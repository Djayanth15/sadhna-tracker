'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
import { format, startOfMonth, getMonth, getYear } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type ValueType,
} from 'recharts';
import { User } from '@/lib/auth';

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

interface AnalysisData {
  user: { id: string; name: string; email: string; bys: boolean };
  weeklySummaries: WeeklySummary[];
  dailyScores: DailyScore[];
}

const parseLocalDate = (iso: string) => {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
};

const parseTimeOnly = (iso: string | null): string => {
  if (!iso) return '–';
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

const minutesToTime = (minutes: number | null): string => {
  if (minutes === null) return '–';
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// ─────────────── Weekly card ───────────────

function WeekCard({
  summary,
  dailyScores,
}: {
  summary: WeeklySummary;
  dailyScores: DailyScore[];
}) {
  const [open, setOpen] = useState(false);

  const weekStart = parseLocalDate(summary.weekStart);
  const weekEnd = parseLocalDate(summary.weekEnd);
  const weekScores = dailyScores
    .filter((s) => {
      const d = parseLocalDate(s.date);
      return d >= weekStart && d <= weekEnd;
    })
    .sort(
      (a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
    );

  const wakeTimes = weekScores
    .filter((s) => s.wakeTime)
    .map((s) => {
      const d = new Date(s.wakeTime!);
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    });

  const sleepTimes = weekScores
    .filter((s) => s.sleepTime)
    .map((s) => {
      const d = new Date(s.sleepTime!);
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    });

  const avgWake = wakeTimes.length
    ? wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length
    : null;

  const avgSleep = sleepTimes.length
    ? sleepTimes.reduce((a, b) => a + b, 0) / sleepTimes.length
    : null;

  return (
    <Card className='border'>
      <CardHeader
        className='p-3 sm:p-4 cursor-pointer select-none'
        onClick={() => setOpen((v) => !v)}
      >
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm sm:text-base'>
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
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
          {/* Score summary */}
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
              <p className='text-xs text-muted-foreground mt-1'>
                {summary.daysRecorded}/7 days
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
            <div className='p-2 bg-muted/50 rounded-md text-xs'>
              <p className='text-muted-foreground'>Woke on Time</p>
              <p className='font-semibold'>{summary.daysWithWake20}/7 days</p>
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
                    <TableHead className='text-center'>Lect.</TableHead>
                    <TableHead className='text-center'>Read.</TableHead>
                    <TableHead className='text-center'>Soul</TableHead>
                    <TableHead className='text-center'>Body</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekScores.map((s) => (
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

// ─────────────── Charts section ───────────────

type ChartMode = 'weekly' | 'monthly';

function ChartsSection({ weeklySummaries }: { weeklySummaries: WeeklySummary[] }) {
  const sorted = [...weeklySummaries].sort(
    (a, b) =>
      parseLocalDate(a.weekStart).getTime() - parseLocalDate(b.weekStart).getTime()
  );

  // Default date range: all data
  const [startDate, setStartDate] = useState(
    sorted.length ? sorted[0].weekStart.split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    sorted.length ? sorted[sorted.length - 1].weekStart.split('T')[0] : ''
  );
  const [mode, setMode] = useState<ChartMode>('weekly');

  // Filter summaries by date range
  const filtered = useMemo(() => {
    if (!startDate || !endDate) return sorted;
    const s = parseLocalDate(startDate);
    const e = parseLocalDate(endDate);
    return sorted.filter((w) => {
      const d = parseLocalDate(w.weekStart);
      return d >= s && d <= e;
    });
  }, [sorted, startDate, endDate]);

  // Weekly chart data
  const weeklyData = useMemo(
    () =>
      filtered.map((w) => ({
        label: format(parseLocalDate(w.weekStart), 'MMM d'),
        Soul: parseFloat(w.totalSoulScore.toFixed(1)),
        Body: parseFloat(w.totalBodyScore.toFixed(1)),
        Overall: parseFloat(w.overallAverage.toFixed(1)),
      })),
    [filtered]
  );

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const byMonth: Record<
      string,
      { label: string; soul: number[]; body: number[]; overall: number[] }
    > = {};

    for (const w of filtered) {
      const d = parseLocalDate(w.weekStart);
      const key = `${getYear(d)}-${String(getMonth(d) + 1).padStart(2, '0')}`;
      const label = format(startOfMonth(d), 'MMM yyyy');
      if (!byMonth[key]) byMonth[key] = { label, soul: [], body: [], overall: [] };
      byMonth[key].soul.push(w.totalSoulScore);
      byMonth[key].body.push(w.totalBodyScore);
      byMonth[key].overall.push(w.overallAverage);
    }

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => {
        const avg = (arr: number[]) =>
          parseFloat((arr.reduce((s, x) => s + x, 0) / arr.length).toFixed(1));
        return {
          label: v.label,
          Soul: avg(v.soul),
          Body: avg(v.body),
          Overall: avg(v.overall),
        };
      });
  }, [filtered]);

  const chartData = mode === 'weekly' ? weeklyData : monthlyData;

  if (sorted.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        No weekly data available for charts.
      </p>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Controls */}
      <div className='flex flex-wrap items-end gap-4'>
        <div className='flex gap-1'>
          <Button
            size='sm'
            variant={mode === 'weekly' ? 'default' : 'outline'}
            onClick={() => setMode('weekly')}
          >
            Weekly
          </Button>
          <Button
            size='sm'
            variant={mode === 'monthly' ? 'default' : 'outline'}
            onClick={() => setMode('monthly')}
          >
            Monthly
          </Button>
        </div>
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <label className='text-muted-foreground text-xs'>From</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='border rounded-md px-2 py-1 text-xs bg-background'
          />
          <label className='text-muted-foreground text-xs'>To</label>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='border rounded-md px-2 py-1 text-xs bg-background'
          />
          <Button
            size='sm'
            variant='ghost'
            className='text-xs h-7'
            onClick={() => {
              setStartDate(sorted[0].weekStart.split('T')[0]);
              setEndDate(sorted[sorted.length - 1].weekStart.split('T')[0]);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No data in selected range.
        </p>
      ) : mode === 'weekly' ? (
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis dataKey='label' tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit='%' />
            <Tooltip formatter={(v: ValueType) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type='monotone'
              dataKey='Soul'
              stroke='#9333ea'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type='monotone'
              dataKey='Body'
              stroke='#3b82f6'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type='monotone'
              dataKey='Overall'
              stroke='#22c55e'
              strokeWidth={2}
              strokeDasharray='5 3'
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis dataKey='label' tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit='%' />
            <Tooltip formatter={(v: ValueType) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey='Soul' fill='#9333ea' radius={[3, 3, 0, 0]} />
            <Bar dataKey='Body' fill='#3b82f6' radius={[3, 3, 0, 0]} />
            <Bar dataKey='Overall' fill='#22c55e' radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─────────────── Main component ───────────────

export function AnalysisClient({
  userId,
  currentUser,
}: {
  userId: string;
  currentUser: User;
}) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analysis/${userId}`)
      .then((r) => r.json())
      .then(setData)
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
        User not found.
      </div>
    );
  }

  const { user, weeklySummaries, dailyScores } = data;
  const isOwnPage = currentUser.id === userId;

  const sorted = [...weeklySummaries].sort(
    (a, b) =>
      parseLocalDate(b.weekStart).getTime() - parseLocalDate(a.weekStart).getTime()
  );

  const avgSoul =
    sorted.length
      ? sorted.reduce((s, w) => s + w.totalSoulScore, 0) / sorted.length
      : 0;

  const avgBody =
    sorted.length
      ? sorted.reduce((s, w) => s + w.totalBodyScore, 0) / sorted.length
      : 0;

  const avgOverall =
    sorted.length
      ? sorted.reduce((s, w) => s + w.overallAverage, 0) / sorted.length
      : 0;

  return (
    <div className='space-y-6'>
      {/* Back button + header */}
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => history.back()}
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          Back
        </Button>
      </div>

      <div className='space-y-1'>
        <h1 className='text-xl sm:text-2xl font-semibold'>
          {isOwnPage ? 'My Analysis' : `${user.name}'s Analysis`}
        </h1>
        {!isOwnPage && (
          <p className='text-muted-foreground text-sm'>{user.email}</p>
        )}
      </div>

      {/* All-time summary */}
      <div className='grid grid-cols-3 gap-3'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-xs text-muted-foreground mb-1'>Avg Soul</p>
            <p className='text-xl font-bold text-purple-600 dark:text-purple-400'>
              {avgSoul.toFixed(1)}%
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              {sorted.length} weeks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-xs text-muted-foreground mb-1'>Avg Body</p>
            <p className='text-xl font-bold text-blue-600 dark:text-blue-400'>
              {avgBody.toFixed(1)}%
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              {sorted.length} weeks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-xs text-muted-foreground mb-1'>Avg Overall</p>
            <p className='text-xl font-bold text-green-600 dark:text-green-400'>
              {avgOverall.toFixed(1)}%
            </p>
            <p className='text-xs text-muted-foreground mt-1'>all-time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader className='p-4 pb-2'>
          <CardTitle className='text-base'>Score Trends</CardTitle>
          <p className='text-xs text-muted-foreground'>
            Switch between weekly and monthly views, or pick a custom date range.
          </p>
        </CardHeader>
        <CardContent className='p-4 pt-2'>
          <ChartsSection weeklySummaries={weeklySummaries} />
        </CardContent>
      </Card>

      {/* Weekly history */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-base font-semibold'>
            Weekly History ({sorted.length} {sorted.length === 1 ? 'week' : 'weeks'})
          </h2>
          <Link href='/leaderboard'>
            <Button variant='outline' size='sm' className='text-xs'>
              Leaderboard
            </Button>
          </Link>
        </div>
        {sorted.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No weekly scores calculated yet.
          </p>
        ) : (
          sorted.map((week) => (
            <WeekCard key={week.id} summary={week} dailyScores={dailyScores} />
          ))
        )}
      </div>
    </div>
  );
}
