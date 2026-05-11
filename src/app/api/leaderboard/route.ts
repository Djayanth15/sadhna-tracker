import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/leaderboard?weekStart=YYYY-MM-DD
// Returns ranked weekly summaries for all users for a given week
// Accessible by all authenticated users
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekStartParam = searchParams.get('weekStart');

  try {
    // Get all distinct week starts (sorted newest first)
    const allWeeks = await prisma.weeklySummary.findMany({
      select: { weekStart: true },
      distinct: ['weekStart'],
      orderBy: { weekStart: 'desc' },
    });

    const availableWeeks = allWeeks.map(
      (w) => w.weekStart.toISOString().split('T')[0]
    );

    if (availableWeeks.length === 0) {
      return NextResponse.json({
        entries: [],
        availableWeeks: [],
        selectedWeek: null,
      });
    }

    const targetWeekStart = weekStartParam || availableWeeks[0];

    // Parse as UTC midnight to match DB date storage
    const [year, month, day] = targetWeekStart.split('-').map(Number);
    const weekStartDate = new Date(Date.UTC(year, month - 1, day));

    const entries = await prisma.weeklySummary.findMany({
      where: { weekStart: weekStartDate },
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

    return NextResponse.json({
      entries,
      availableWeeks,
      selectedWeek: targetWeekStart,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
