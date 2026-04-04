import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/participants/[userId]
// Returns all weekly summaries + daily scores for a specific participant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, bys: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const weeklySummaries = await prisma.weeklySummary.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
    });

    const dailyScores = await prisma.dailyScore.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        dailySoulScore: true,
        dailyBodyScore: true,
        mpAttendanceScore: true,
        mpAttendanceTime: true,
        japaCompletionScore: true,
        japaCompletionTime: true,
        sleepTime: true,
        sleepScore: true,
        wakeTime: true,
        wakeScore: true,
        lectureMinutes: true,
        readingMinutes: true,
        studyWorkMinutes: true,
        restScore: true,
        sameDayScore: true,
      },
    });

    return NextResponse.json({ user, weeklySummaries, dailyScores });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participant data' },
      { status: 500 }
    );
  }
}
