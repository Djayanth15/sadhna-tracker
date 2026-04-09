import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/leaderboard?weekStart=2024-01-08
// Returns all users' weekly summaries for a given week, sorted by overall average
// Accessible to all authenticated users
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekStartParam = searchParams.get('weekStart');

  try {
    const where = weekStartParam
      ? { weekStart: new Date(`${weekStartParam}T00:00:00.000Z`) }
      : {};

    const leaderboard = await prisma.weeklySummary.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { overallAverage: 'desc' },
    });

    // Return distinct available weeks (for navigation hints)
    const availableWeeks = await prisma.weeklySummary.findMany({
      select: { weekStart: true, weekEnd: true },
      distinct: ['weekStart'],
      orderBy: { weekStart: 'desc' },
    });

    return NextResponse.json({
      leaderboard,
      availableWeeks: availableWeeks.map((w) => ({
        weekStart: w.weekStart,
        weekEnd: w.weekEnd,
      })),
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
