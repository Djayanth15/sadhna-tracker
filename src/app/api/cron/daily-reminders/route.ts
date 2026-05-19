import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// Runs daily at 9 PM IST (15:30 UTC) via Vercel Cron.
// Sends reminder emails to all bys=true participants who haven't
// submitted their daily score for today (IST date).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Compute today's date in IST (Asia/Kolkata = UTC+5:30)
  const todayIST = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const todayStart = new Date(`${todayIST}T00:00:00.000Z`);
  const tomorrowStart = new Date(`${todayIST}T00:00:00.000Z`);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

  // Fetch all bys participants who haven't submitted a score for today
  const participants = await prisma.user.findMany({
    where: {
      bys: true,
      dailyScores: {
        none: {
          date: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      },
    },
    select: { id: true, name: true, email: true },
  });

  if (participants.length === 0) {
    return NextResponse.json({ message: 'All participants submitted today.', sent: 0 });
  }

  const results = await Promise.allSettled(
    participants.map((p) =>
      sendEmail({
        to: p.email,
        subject: "Hari bol! Don't forget your Sadhna Tracker entry for today 🙏",
        text: `Hari bol ${p.name},\n\nYou haven't submitted your daily Sadhna Tracker scores yet for today (${todayIST}).\n\nPlease take a moment to fill in your scores at your earliest convenience.\n\nHare Krishna!`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
            <h2 style="color: #7c3aed; margin-bottom: 8px;">Hari bol, ${p.name}! 🙏</h2>
            <p style="margin-bottom: 16px; color: #555;">You haven't submitted your daily Sadhna Tracker scores yet for <strong>${todayIST}</strong>.</p>
            <p style="margin-bottom: 24px; color: #555;">Please take a moment to fill in your scores before the day ends.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://sadhna-tracker.vercel.app'}/dashboard/tracker"
               style="display:inline-block; background:#7c3aed; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
              Submit My Scores
            </a>
            <p style="margin-top: 32px; font-size: 13px; color: #999;">Hare Krishna! 🪔</p>
          </div>
        `,
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({
    message: `Reminders sent: ${sent}, failed: ${failed}`,
    sent,
    failed,
    date: todayIST,
  });
}
