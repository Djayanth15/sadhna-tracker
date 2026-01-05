import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allScores = await prisma.dailyScore.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { user: { name: 'asc' } }],
    });

    return NextResponse.json(allScores);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch all scores' },
      { status: 500 }
    );
  }
}
