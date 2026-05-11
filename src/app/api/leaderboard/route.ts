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

  // Upper bound: include weeks up to and including the selected weekStart
  const upToWeekStart = weekStartParam
    ? new Date(weekStartParam + 'T00:00:00.000Z')
    : null;

  const allSummaries = await prisma.weeklySummary.findMany({
    where: {
      userId: { in: participants.map((p) => p.id) },
      ...(upToWeekStart ? { weekStart: { lte: upToWeekStart } } : {}),
    },
    select: {
      userId: true,
      overallAverage: true,
      totalSoulScore: true,
      totalBodyScore: true,
      weekStart: true,
    },
  });

  const userScores = participants.map((p) => {
    const summaries = allSummaries.filter((s) => s.userId === p.id);
    if (summaries.length === 0) {
      return {
        userId: p.id,
        name: p.name,
        avgOverall: 0,
        avgSoul: 0,
        avgBody: 0,
        weeksRecorded: 0,
        latestWeekScore: null as number | null,
      };
    }
    const avgOverall =
      summaries.reduce((sum, s) => sum + s.overallAverage, 0) / summaries.length;
    const avgSoul =
      summaries.reduce((sum, s) => sum + s.totalSoulScore, 0) / summaries.length;
    const avgBody =
      summaries.reduce((sum, s) => sum + s.totalBodyScore, 0) / summaries.length;

    // Latest week within the selected range
    const sorted = [...summaries].sort(
      (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );
    const latestWeekScore = sorted[0]?.overallAverage ?? null;

    return {
      userId: p.id,
      name: p.name,
      avgOverall,
      avgSoul,
      avgBody,
      weeksRecorded: summaries.length,
      latestWeekScore,
    };
  });

  userScores.sort((a, b) => b.avgOverall - a.avgOverall);

  return NextResponse.json(userScores);
}
