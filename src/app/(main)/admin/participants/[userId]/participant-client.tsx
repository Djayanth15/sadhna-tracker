'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface DailyScore {
  id: string;
  date: string;
  dailySoulScore: number;
  dailyBodyScore: number;
  mpAttendanceScore: number;
  mpAttendanceTime: string | null;
  japaCompletionScore: number;
  japaCompletionTime: string | null;
  sleepTime: string | null;
  sleepScore: number;
  wakeTime: string | null;
  wakeScore: number;
  lectureMinutes: number;
  readingMinutes: number;
  studyWorkMinutes: number;
  restScore: number;
  sameDayScore: number;
}

interface WeeklySummary {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalSoulScore: number;
  totalBodyScore: number;
  overallAverage: number;
  daysRecorded: number;
  totalMpJapaScore: number;
  lectureEffectiveScore: number;
  readingEffectiveScore: number;
  totalDailyBodyScore: number;
  studyWorkEffectiveScore: number;
  totalLectureHours: number;
  totalReadingHours: number;
  totalStudyWorkHours: number;
  daysWithMp20: number;
  daysWithJapa20: number;
  daysWithSleep20: number;
  daysWithWake20: number;
}

interface ParticipantData {
  user: { id: string; name: string; email: string; bys: boolean };
  weeklySummaries: WeeklySummary[];
  dailyScores: DailyScore[];
}

const parseLocalDate = (isoString: string) => {
  const datePart = isoString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const parseTimeOnly = (isoString: string | null): string => {
  if (!isoString) return '–';
  // Times are stored as DateTime; extract HH:MM
  const d = new Date(isoString);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

function WeekAnalysis({
  summary,
  dailyScores,
}: {
  summary: WeeklySummary;
  dailyScores: DailyScore[];
}) {
  const [open, setOpen] = useState(false);

  // Filter daily scores for this week
  const weekStart = parseLocalDate(summary.weekStart);
  const weekEnd = parseLocalDate(summary.weekEnd);
  const weekScores = dailyScores.filter((s) => {
    const d = parseLocalDate(s.date);
    return d >= weekStart && d <= weekEnd;
  });

  // Averages
  const avgWake =
    weekScores.filter((s) => s.wakeTime).length > 0
      ? weekScores
          .filter((s) => s.wakeTime)
          .map((s) => {
            const d = new Date(s.wakeTime!);
            return d.getUTCHours() * 60 + d.getUTCMinutes();
          })
          .reduce((a, b) => a + b, 0) /
        weekScores.filter((s) => s.wakeTime).length
      : null;

  const avgSleep =
    weekScores.filter((s) => s.sleepTime).length > 0
      ? weekScores
          .filter((s) => s.sleepTime)
          .map((s) => {
            const d = new Date(s.sleepTime!);
            return d.getUTCHours() * 60 + d.getUTCMinutes();
          })
          .reduce((a, b) => a + b, 0) /
        weekScores.filter((s) => s.sleepTime).length
      : null;

  const minutesToTime = (minutes: number | null) => {
    if (minutes === null) return '–';
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.round(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <Card className='border'>
      <CardHeader
        className='p-3 sm:p-4 cursor-pointer select-none'
        onClick={() => setOpen((v) => !v)}
      >
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm sm:text-base'>
              {format(parseLocalDate(summary.weekStart), 'MMM d')} –{' '}
              {format(parseLocalDate(summary.weekEnd), 'MMM d, yyyy')}
            </CardTitle>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {summary.daysRecorded}/7 days · Overall:{' '}
              <span className='font-semibold text-green-600 dark:text-green-400'>
                {summary.overallAverage.toFixed(1)}%
              </span>
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='hidden sm:flex gap-4 text-sm'>
              <span className='text-purple-600 dark:text-purple-400 font-semibold'>
                Soul {summary.totalSoulScore.toFixed(1)}%
              </span>
              <span className='text-blue-600 dark:text-blue-400 font-semibold'>
                Body {summary.totalBodyScore.toFixed(1)}%
              </span>
            </div>
            {open ? (
              <ChevronUp className='h-4 w-4 text-muted-foreground' />
            ) : (
              <ChevronDown className='h-4 w-4 text-muted-foreground' />
            )}
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className='p-3 sm:p-4 pt-0 space-y-4'>
          {/* Scores summary */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Soul</p>
              <p className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                {summary.totalSoulScore.toFixed(2)}%
              </p>
              <div className='text-xs mt-1 space-y-0.5 text-muted-foreground'>
                <p>MP+Japa: {summary.totalMpJapaScore.toFixed(0)}</p>
                <p>Lectures: {summary.lectureEffectiveScore.toFixed(1)}</p>
                <p>Reading: {summary.readingEffectiveScore.toFixed(1)}</p>
              </div>
            </div>
            <div className='p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Body</p>
              <p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                {summary.totalBodyScore.toFixed(2)}%
              </p>
              <div className='text-xs mt-1 space-y-0.5 text-muted-foreground'>
                <p>Daily: {summary.totalDailyBodyScore.toFixed(0)}</p>
                <p>Study/Work: {summary.studyWorkEffectiveScore.toFixed(1)}</p>
              </div>
            </div>
            <div className='p-3 bg-green-50 dark:bg-green-950/30 rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Overall</p>
              <p className='text-lg font-bold text-green-600 dark:text-green-400'>
                {summary.overallAverage.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Weekly analysis stats */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Avg Wake Time</p>
              <p className='font-semibold'>{minutesToTime(avgWake)}</p>
            </div>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Avg Sleep Time</p>
              <p className='font-semibold'>{minutesToTime(avgSleep)}</p>
            </div>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Lecture Hours</p>
              <p className='font-semibold'>{summary.totalLectureHours.toFixed(1)}h</p>
            </div>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Reading Hours</p>
              <p className='font-semibold'>{summary.totalReadingHours.toFixed(1)}h</p>
            </div>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Study/Work Hours</p>
              <p className='font-semibold'>{summary.totalStudyWorkHours.toFixed(1)}h</p>
            </div>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>MP on Time</p>
              <p className='font-semibold'>{summary.daysWithMp20}/7 days</p>
            </div>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Japa on Time</p>
              <p className='font-semibold'>{summary.daysWithJapa20}/7 days</p>
            </div>
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Slept on Time</p>
              <p className='font-semibold'>{summary.daysWithSleep20}/7 days</p>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          {weekScores.length > 0 && (
            <div className='overflow-x-auto'>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
                Day-by-Day
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className='text-center'>Wake</TableHead>
                    <TableHead className='text-center'>Sleep</TableHead>
                    <TableHead className='text-center'>MP</TableHead>
                    <TableHead className='text-center'>Japa</TableHead>
                    <TableHead className='text-center'>Lectures</TableHead>
                    <TableHead className='text-center'>Reading</TableHead>
                    <TableHead className='text-center'>Soul</TableHead>
                    <TableHead className='text-center'>Body</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekScores
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                    .map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className='text-xs'>
                          {format(parseLocalDate(s.date), 'EEE, MMM d')}
                        </TableCell>
                        <TableCell className='text-center text-xs'>
                          {parseTimeOnly(s.wakeTime)}
                        </TableCell>
                        <TableCell className='text-center text-xs'>
                          {parseTimeOnly(s.sleepTime)}
                        </TableCell>
                        <TableCell className='text-center text-xs'>
                          {s.mpAttendanceScore}
                        </TableCell>
                        <TableCell className='text-center text-xs'>
                          {s.japaCompletionScore}
                        </TableCell>
                        <TableCell className='text-center text-xs'>
                          {(s.lectureMinutes / 60).toFixed(1)}h
                        </TableCell>
                        <TableCell className='text-center text-xs'>
                          {(s.readingMinutes / 60).toFixed(1)}h
                        </TableCell>
                        <TableCell className='text-center text-xs font-semibold text-purple-600 dark:text-purple-400'>
                          {s.dailySoulScore.toFixed(1)}
                        </TableCell>
                        <TableCell className='text-center text-xs font-semibold text-blue-600 dark:text-blue-400'>
                          {s.dailyBodyScore.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function ParticipantClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/participants/${userId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className='text-center py-20 text-muted-foreground'>Loading...</div>
    );
  }

  if (!data?.user) {
    return (
      <div className='text-center py-20 text-muted-foreground'>
        Participant not found.
      </div>
    );
  }

  const { user, weeklySummaries, dailyScores } = data;

  // Overall averages across all weeks
  const allWeeks = [...weeklySummaries].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );

  const avgOverall =
    allWeeks.length > 0
      ? allWeeks.reduce((s, w) => s + w.overallAverage, 0) / allWeeks.length
      : 0;

  const avgSoul =
    allWeeks.length > 0
      ? allWeeks.reduce((s, w) => s + w.totalSoulScore, 0) / allWeeks.length
      : 0;

  const avgBody =
    allWeeks.length > 0
      ? allWeeks.reduce((s, w) => s + w.totalBodyScore, 0) / allWeeks.length
      : 0;

  return (
    <div className='space-y-6'>
      {/* Back + header */}
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/admin/participants')}
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          Back
        </Button>
      </div>

      <div className='space-y-1'>
        <h1 className='text-xl sm:text-2xl font-semibold'>{user.name}</h1>
        <p className='text-muted-foreground text-sm'>{user.email}</p>
      </div>

      {/* Summary stats */}
      <div className='grid grid-cols-3 gap-3'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-xs text-muted-foreground mb-1'>Avg Soul</p>
            <p className='text-xl font-bold text-purple-600 dark:text-purple-400'>
              {avgSoul.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-xs text-muted-foreground mb-1'>Avg Body</p>
            <p className='text-xl font-bold text-blue-600 dark:text-blue-400'>
              {avgBody.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-xs text-muted-foreground mb-1'>Avg Overall</p>
            <p className='text-xl font-bold text-green-600 dark:text-green-400'>
              {avgOverall.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly breakdowns */}
      <div className='space-y-3'>
        <h2 className='text-base font-semibold'>
          Weekly History ({allWeeks.length} weeks)
        </h2>
        {allWeeks.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No weekly scores calculated yet.
          </p>
        ) : (
          allWeeks.map((week) => (
            <WeekAnalysis
              key={week.id}
              summary={week}
              dailyScores={dailyScores}
            />
          ))
        )}
      </div>
    </div>
  );
}
