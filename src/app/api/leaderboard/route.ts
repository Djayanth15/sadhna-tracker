import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const weekStartParam = searchParams.get('weekStart');

  const participants = await prisma.user.findMany({
    where: { bys: true },
    select: { id: true, name: true },
  });

  // Determine the exact week to show
  const weekStart = weekStartParam
    ? new Date(weekStartParam + 'T00:00:00.000Z')
    : (() => {
        // Default to current Monday
        const now = new Date();
        const day = now.getUTCDay(); // 0=Sun,1=Mon,...
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setUTCDate(now.getUTCDate() + diff);
        monday.setUTCHours(0, 0, 0, 0);
        return monday;
      })();

  // Fetch only that week's summary for each participant
  const summaries = await prisma.weeklySummary.findMany({
    where: {
      userId: { in: participants.map((p) => p.id) },
      weekStart,
    },
    select: {
      userId: true,
      overallAverage: true,
      totalSoulScore: true,
      totalBodyScore: true,
      daysRecorded: true,
    },
  });

  const summaryByUser = new Map(summaries.map((s) => [s.userId, s]));

  const userScores = participants.map((p) => {
    const s = summaryByUser.get(p.id);
    return {
      userId: p.id,
      name: p.name,
      overallScore: s?.overallAverage ?? null,
      soulScore: s?.totalSoulScore ?? null,
      bodyScore: s?.totalBodyScore ?? null,
      daysRecorded: s?.daysRecorded ?? 0,
      hasData: !!s,
    };
  });

  // Sort: participants with data first (by overallScore desc), then no-data
  userScores.sort((a, b) => {
    if (a.hasData && !b.hasData) return -1;
    if (!a.hasData && b.hasData) return 1;
    return (b.overallScore ?? 0) - (a.overallScore ?? 0);
  });

  return NextResponse.json(userScores);
}
