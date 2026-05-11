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

  const weekStart = weekStartParam
    ? new Date(weekStartParam + 'T00:00:00.000Z')
    : (() => {
        const d = new Date();
        const day = d.getUTCDay();
        const diff = (day + 6) % 7; // days since Monday
        d.setUTCDate(d.getUTCDate() - diff);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      })();

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
    },
  });

  const summaryMap = new Map(summaries.map((s) => [s.userId, s]));

  const userScores = participants.map((p) => {
    const summary = summaryMap.get(p.id);
    return {
      userId: p.id,
      name: p.name,
      weekScore: summary?.overallAverage ?? null,
      soulScore: summary?.totalSoulScore ?? null,
      bodyScore: summary?.totalBodyScore ?? null,
    };
  });

  // Sort: participants with data first (by weekScore desc), then those without
  userScores.sort((a, b) => {
    if (a.weekScore === null && b.weekScore === null) return 0;
    if (a.weekScore === null) return 1;
    if (b.weekScore === null) return -1;
    return b.weekScore - a.weekScore;
  });

  return NextResponse.json(userScores);
}
