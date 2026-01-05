// import { getServerSession } from '@/lib/get-session';
// import { prisma } from '@/lib/prisma';
// import { NextRequest, NextResponse } from 'next/server';
// import { startOfWeek, endOfWeek } from 'date-fns';

// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession();

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const weeklyScores = await prisma.weeklySummary.findMany({
//       where: { userId: session.user.id },
//       orderBy: { weekStart: 'desc' },
//     });

//     return NextResponse.json(weeklyScores);
//   } catch (error) {
//     console.error('Failed to fetch weekly scores:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch weekly scores' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession();

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await req.json();
//     const { weekStartDate } = body;

//     const weekStart = startOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });
//     const weekEnd = endOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });

//     // Get all daily scores for this week
//     const dailyScores = await prisma.dailyScore.findMany({
//       where: {
//         userId: session.user.id,
//         date: {
//           gte: weekStart,
//           lte: weekEnd,
//         },
//       },
//     });

//     if (dailyScores.length === 0) {
//       return NextResponse.json(
//         { error: 'No data for this week' },
//         { status: 400 }
//       );
//     }

//     // Get user's weekly goals
//     const goals = await prisma.weeklyGoals.findUnique({
//       where: { userId: session.user.id },
//     });

//     if (!goals) {
//       return NextResponse.json(
//         { error: 'Weekly goals not set' },
//         { status: 400 }
//       );
//     }

//     // Calculate totals
//     const totalMpJapaScore = dailyScores.reduce(
//       (sum, score) => sum + score.mpAttendanceScore + score.japaCompletionScore,
//       0
//     );

//     const totalLectureMinutes = dailyScores.reduce(
//       (sum, score) => sum + score.lectureMinutes,
//       0
//     );

//     const totalReadingMinutes = dailyScores.reduce(
//       (sum, score) => sum + score.readingMinutes,
//       0
//     );

//     const totalStudyWorkMinutes = dailyScores.reduce(
//       (sum, score) => sum + score.studyWorkMinutes,
//       0
//     );

//     const totalDailyBodyScore = dailyScores.reduce(
//       (sum, score) =>
//         sum +
//         score.sleepScore +
//         score.wakeScore +
//         score.restScore +
//         score.sameDayScore,
//       0
//     );

//     // Calculate effective scores
//     const maxLectureMinutes = goals.maxHoursLectures * 60;
//     const maxReadingMinutes = goals.maxHoursReading * 60;
//     const maxStudyWorkMinutes = goals.maxHoursStudyWork * 60;

//     const lectureEffectiveScore = Math.min(
//       (totalLectureMinutes / maxLectureMinutes) * 100,
//       100
//     );

//     const readingEffectiveScore = Math.min(
//       (totalReadingMinutes / maxReadingMinutes) * 60,
//       60
//     );

//     const studyWorkEffectiveScore = Math.min(
//       (totalStudyWorkMinutes / maxStudyWorkMinutes) * 140,
//       140
//     );

//     // Calculate total scores
//     // Soul: (MP+Japa scores + lecture effective + reading effective) / 440 * 100
//     // MP+Japa max = 280 (7 days * 40), lecture max = 100, reading max = 60
//     const totalSoulScore =
//       ((totalMpJapaScore + lectureEffectiveScore + readingEffectiveScore) /
//         440) *
//       100;

//     // Body: (daily body scores + study/work effective) / 595 * 100
//     // Daily body max = 455 (7 days * 65), study/work max = 140
//     const totalBodyScore =
//       ((totalDailyBodyScore + studyWorkEffectiveScore) / 595) * 100;

//     const overallAverage = (totalSoulScore + totalBodyScore) / 2;

//     // Save weekly summary
//     const weeklySummary = await prisma.weeklySummary.upsert({
//       where: {
//         userId_weekStart: {
//           userId: session.user.id,
//           weekStart,
//         },
//       },
//       update: {
//         weekEnd,
//         totalMpJapaScore,
//         lectureEffectiveScore,
//         readingEffectiveScore,
//         totalSoulScore,
//         totalDailyBodyScore,
//         studyWorkEffectiveScore,
//         totalBodyScore,
//         overallAverage,
//         daysRecorded: dailyScores.length,
//       },
//       create: {
//         userId: session.user.id,
//         weekStart,
//         weekEnd,
//         totalMpJapaScore,
//         lectureEffectiveScore,
//         readingEffectiveScore,
//         totalSoulScore,
//         totalDailyBodyScore,
//         studyWorkEffectiveScore,
//         totalBodyScore,
//         overallAverage,
//         daysRecorded: dailyScores.length,
//       },
//     });

//     return NextResponse.json(weeklySummary);
//   } catch (error) {
//     console.error('Failed to calculate weekly score:', error);
//     return NextResponse.json(
//       { error: 'Failed to calculate weekly score' },
//       { status: 500 }
//     );
//   }
// }
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { DailyScore } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const weeklyScores = await prisma.weeklySummary.findMany({
      where: { userId: session.user.id },
      orderBy: { weekStart: 'desc' },
    });

    return NextResponse.json(weeklyScores);
  } catch (error) {
    console.error('Failed to fetch weekly scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly scores' },
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
    const { weekStartDate } = body;

    const weekStart = startOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });

    // Get all daily scores for this week
    const dailyScores: DailyScore[] = await prisma.dailyScore.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    if (dailyScores.length === 0) {
      return NextResponse.json(
        { error: 'No data for this week' },
        { status: 400 }
      );
    }

    // Get user's weekly goals
    const goals = await prisma.weeklyGoals.findUnique({
      where: { userId: session.user.id },
    });

    if (!goals) {
      return NextResponse.json(
        { error: 'Weekly goals not set' },
        { status: 400 }
      );
    }

    // Calculate totals with explicit type annotations
    const totalMpJapaScore = dailyScores.reduce(
      (sum: number, score) =>
        sum + score.mpAttendanceScore + score.japaCompletionScore,
      0
    );

    const totalLectureMinutes = dailyScores.reduce(
      (sum: number, score) => sum + score.lectureMinutes,
      0
    );

    const totalReadingMinutes = dailyScores.reduce(
      (sum: number, score) => sum + score.readingMinutes,
      0
    );

    const totalStudyWorkMinutes = dailyScores.reduce(
      (sum: number, score) => sum + score.studyWorkMinutes,
      0
    );

    const totalDailyBodyScore = dailyScores.reduce(
      (sum: number, score) =>
        sum +
        score.sleepScore +
        score.wakeScore +
        score.restScore +
        score.sameDayScore,
      0
    );

    // Calculate effective scores
    const maxLectureMinutes = goals.maxHoursLectures * 60;
    const maxReadingMinutes = goals.maxHoursReading * 60;
    const maxStudyWorkMinutes = goals.maxHoursStudyWork * 60;

    const lectureEffectiveScore = Math.min(
      (totalLectureMinutes / maxLectureMinutes) * 100,
      100
    );

    const readingEffectiveScore = Math.min(
      (totalReadingMinutes / maxReadingMinutes) * 60,
      60
    );

    const studyWorkEffectiveScore = Math.min(
      (totalStudyWorkMinutes / maxStudyWorkMinutes) * 140,
      140
    );

    // Calculate total scores
    // Soul: (MP+Japa scores + lecture effective + reading effective) / 440 * 100
    // MP+Japa max = 280 (7 days * 40), lecture max = 100, reading max = 60
    const totalSoulScore =
      ((totalMpJapaScore + lectureEffectiveScore + readingEffectiveScore) /
        440) *
      100;

    // Body: (daily body scores + study/work effective) / 595 * 100
    // Daily body max = 455 (7 days * 65), study/work max = 140
    const totalBodyScore =
      ((totalDailyBodyScore + studyWorkEffectiveScore) / 595) * 100;

    const overallAverage = (totalSoulScore + totalBodyScore) / 2;

    // Save weekly summary
    const weeklySummary = await prisma.weeklySummary.upsert({
      where: {
        userId_weekStart: {
          userId: session.user.id,
          weekStart,
        },
      },
      update: {
        weekEnd,
        totalMpJapaScore,
        lectureEffectiveScore,
        readingEffectiveScore,
        totalSoulScore,
        totalDailyBodyScore,
        studyWorkEffectiveScore,
        totalBodyScore,
        overallAverage,
        daysRecorded: dailyScores.length,
      },
      create: {
        userId: session.user.id,
        weekStart,
        weekEnd,
        totalMpJapaScore,
        lectureEffectiveScore,
        readingEffectiveScore,
        totalSoulScore,
        totalDailyBodyScore,
        studyWorkEffectiveScore,
        totalBodyScore,
        overallAverage,
        daysRecorded: dailyScores.length,
      },
    });

    return NextResponse.json(weeklySummary);
  } catch (error) {
    console.error('Failed to calculate weekly score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate weekly score' },
      { status: 500 }
    );
  }
}
