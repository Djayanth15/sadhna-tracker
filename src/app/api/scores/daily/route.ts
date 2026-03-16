import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const timezone = searchParams.get('timezone');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Parse as UTC midnight to match @db.Date storage convention
    const dateObj = new Date(date.split('T')[0] + 'T00:00:00.000Z');

    const score = await prisma.dailyScore.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: dateObj,
        },
      },
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error('Failed to fetch daily score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily score' },
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
    const {
      date,
      timezone,
      mpAttendanceTime,
      mpAttendanceScore,
      japaCompletionTime,
      japaCompletionScore,
      lectureMinutes,
      readingMinutes,
      sleepTime,
      sleepScore,
      wakeTime,
      wakeScore,
      studyWorkMinutes,
      restMinutes,
      restScore,
      filledSameDay,
      sameDayScore,
      dailySoulScore,
      dailyBodyScore,
    } = body;

    // Parse as UTC midnight — ensures the user's intended date is stored
    // consistently as @db.Date regardless of the server's local timezone.
    const userDate = new Date(date + 'T00:00:00.000Z');

    const score = await prisma.dailyScore.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: userDate,
        },
      },
      update: {
        mpAttendanceTime: mpAttendanceTime ? new Date(mpAttendanceTime) : null,
        mpAttendanceScore,
        japaCompletionTime: japaCompletionTime
          ? new Date(japaCompletionTime)
          : null,
        japaCompletionScore,
        lectureMinutes,
        readingMinutes,
        sleepTime: sleepTime ? new Date(sleepTime) : null,
        sleepScore,
        wakeTime: wakeTime ? new Date(wakeTime) : null,
        wakeScore,
        studyWorkMinutes,
        restMinutes,
        restScore,
        filledSameDay,
        sameDayScore,
        dailySoulScore,
        dailyBodyScore,
      },
      create: {
        userId: session.user.id,
        date: userDate,
        mpAttendanceTime: mpAttendanceTime ? new Date(mpAttendanceTime) : null,
        mpAttendanceScore,
        japaCompletionTime: japaCompletionTime
          ? new Date(japaCompletionTime)
          : null,
        japaCompletionScore,
        lectureMinutes,
        readingMinutes,
        sleepTime: sleepTime ? new Date(sleepTime) : null,
        sleepScore,
        wakeTime: wakeTime ? new Date(wakeTime) : null,
        wakeScore,
        studyWorkMinutes,
        restMinutes,
        restScore,
        filledSameDay,
        sameDayScore,
        dailySoulScore,
        dailyBodyScore,
      },
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error('Failed to save daily score:', error);
    return NextResponse.json(
      { error: 'Failed to save daily score' },
      { status: 500 }
    );
  }
}
