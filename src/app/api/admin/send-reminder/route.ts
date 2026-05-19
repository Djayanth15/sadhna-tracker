import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/send-reminder
// Body: { userId: string; message: string }
// Sends a custom reminder email to the specified participant.
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, message } = body as { userId?: string; message?: string };

  if (!userId || !message?.trim()) {
    return NextResponse.json(
      { error: 'userId and message are required' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, bys: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    await sendEmail({
      to: user.email,
      subject: 'Message from your Sadhna Tracker admin 🙏',
      text: `Hari bol ${user.name},\n\n${message.trim()}\n\nHare Krishna!`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h2 style="color: #7c3aed; margin-bottom: 8px;">Hari bol, ${user.name}! 🙏</h2>
          <div style="margin-bottom: 24px; color: #333; white-space: pre-wrap; line-height: 1.6;">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <p style="margin-top: 32px; font-size: 13px; color: #999;">— Your Sadhna Tracker Admin 🪔</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, sentTo: user.email });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
