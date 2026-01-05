import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allWeeklyScores = await prisma.weeklySummary.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ weekStart: 'desc' }, { user: { name: 'asc' } }],
    });

    return NextResponse.json(allWeeklyScores);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch all weekly scores' },
      { status: 500 }
    );
  }
}
