import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await prisma.weeklyGoals.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { maxHoursLectures, maxHoursReading, maxHoursStudyWork } = body;

    const goals = await prisma.weeklyGoals.upsert({
      where: { userId: session.user.id },
      update: {
        maxHoursLectures,
        maxHoursReading,
        maxHoursStudyWork,
      },
      create: {
        userId: session.user.id,
        maxHoursLectures,
        maxHoursReading,
        maxHoursStudyWork,
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Failed to save goals:', error);
    return NextResponse.json(
      { error: 'Failed to save goals' },
      { status: 500 }
    );
  }
}
