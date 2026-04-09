'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Calendar,
  BarChart2,
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
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
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface UserInfo {
  id: string;
  name: string;
  email: string;
  bys: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseLocalDate = (isoString: string) => {
  const datePart = isoString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const parseTimeOnly = (isoString: string | null): string => {
  if (!isoString) return '–';
  const d = new Date(isoString);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

const minutesToTime = (minutes: number | null): string => {
  if (minutes === null) return '–';
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// ─── WeekAnalysis accordion card ─────────────────────────────────────────────

function WeekAnalysis({
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
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());

  // Compute averages from daily scores
  const wakeMins = weekScores
    .filter((s) => s.wakeTime)
    .map((s) => {
      const d = new Date(s.wakeTime!);
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    });
  const avgWake = wakeMins.length > 0 ? wakeMins.reduce((a, b) => a + b, 0) / wakeMins.length : null;

  const sleepMins = weekScores
    .filter((s) => s.sleepTime)
    .map((s) => {
      const d = new Date(s.sleepTime!);
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    });
  const avgSleep = sleepMins.length > 0 ? sleepMins.reduce((a, b) => a + b, 0) / sleepMins.length : null;

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
              <div className='text-xs mt-1 text-muted-foreground'>
                <p>{summary.daysRecorded}/7 days</p>
              </div>
            </div>
          </div>

          {/* Weekly analytics */}
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

          {/* Day-by-day table */}
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
                      <TableCell className='text-center text-xs'>{s.mpAttendanceScore}</TableCell>
                      <TableCell className='text-center text-xs'>{s.japaCompletionScore}</TableCell>
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

// ─── Time range presets ───────────────────────────────────────────────────────

type RangePreset = '1m' | '3m' | '6m' | '1y' | 'all';

const RANGE_LABELS: Record<RangePreset, string> = {
  '1m': '1 Month',
  '3m': '3 Months',
  '6m': '6 Months',
  '1y': '1 Year',
  all: 'All Time',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalysisClient({
  userId,
  currentUserId,
  isAdmin,
}: {
  userId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [allWeeklySummaries, setAllWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangePreset, setRangePreset] = useState<RangePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  const isOwnPage = userId === currentUserId;

  useEffect(() => {
    fetch(`/api/analysis/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user ?? null);
        setAllWeeklySummaries(
          (d.weeklySummaries ?? []).sort(
            (a: WeeklySummary, b: WeeklySummary) =>
              new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
          )
        );
        setDailyScores(d.dailyScores ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  // ── Filter summaries by selected range ──────────────────────────────────────
  const filteredSummaries = useMemo(() => {
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (useCustomRange) {
      if (customFrom) fromDate = new Date(customFrom);
      if (customTo) toDate = new Date(customTo);
    } else {
      const now = new Date();
      if (rangePreset === '1m') fromDate = subMonths(now, 1);
      else if (rangePreset === '3m') fromDate = subMonths(now, 3);
      else if (rangePreset === '6m') fromDate = subMonths(now, 6);
      else if (rangePreset === '1y') fromDate = subMonths(now, 12);
      // 'all' → no filter
    }

    return allWeeklySummaries.filter((s) => {
      const d = parseLocalDate(s.weekStart);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [allWeeklySummaries, rangePreset, useCustomRange, customFrom, customTo]);

  // ── Chart data: weekly trend ─────────────────────────────────────────────────
  const weeklyChartData = useMemo(
    () =>
      filteredSummaries.map((s) => ({
        week: format(parseLocalDate(s.weekStart), 'MMM d'),
        Soul: parseFloat(s.totalSoulScore.toFixed(1)),
        Body: parseFloat(s.totalBodyScore.toFixed(1)),
        Overall: parseFloat(s.overallAverage.toFixed(1)),
      })),
    [filteredSummaries]
  );

  // ── Chart data: monthly averages ─────────────────────────────────────────────
  const monthlyChartData = useMemo(() => {
    const grouped: Record<
      string,
      { soul: number[]; body: number[]; overall: number[] }
    > = {};

    filteredSummaries.forEach((s) => {
      const key = format(parseLocalDate(s.weekStart), 'MMM yyyy');
      if (!grouped[key]) grouped[key] = { soul: [], body: [], overall: [] };
      grouped[key].soul.push(s.totalSoulScore);
      grouped[key].body.push(s.totalBodyScore);
      grouped[key].overall.push(s.overallAverage);
    });

    const avg = (arr: number[]) =>
      arr.length === 0 ? 0 : parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      Soul: avg(data.soul),
      Body: avg(data.body),
      Overall: avg(data.overall),
    }));
  }, [filteredSummaries]);

  // ── Overall stats (filtered) ─────────────────────────────────────────────────
  const avgSoul =
    filteredSummaries.length > 0
      ? filteredSummaries.reduce((s, w) => s + w.totalSoulScore, 0) / filteredSummaries.length
      : 0;
  const avgBody =
    filteredSummaries.length > 0
      ? filteredSummaries.reduce((s, w) => s + w.totalBodyScore, 0) / filteredSummaries.length
      : 0;
  const avgOverall =
    filteredSummaries.length > 0
      ? filteredSummaries.reduce((s, w) => s + w.overallAverage, 0) / filteredSummaries.length
      : 0;

  if (loading) {
    return <div className='text-center py-20 text-muted-foreground'>Loading...</div>;
  }

  if (!user) {
    return (
      <div className='text-center py-20 text-muted-foreground'>User not found.</div>
    );
  }

  const sortedWeeklyDesc = [...allWeeklySummaries].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );

  return (
    <div className='space-y-6'>
      {/* Back button (admin viewing someone else) */}
      {isAdmin && !isOwnPage && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/admin/participants')}
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          Back to Participants
        </Button>
      )}

      {/* Header */}
      <div className='space-y-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          <h1 className='text-xl sm:text-2xl font-semibold'>
            {isOwnPage ? 'My Analysis' : user.name}
          </h1>
          {user.bys && (
            <Badge variant='outline' className='text-xs'>
              BYS
            </Badge>
          )}
        </div>
        {(!isOwnPage || isAdmin) && (
          <p className='text-sm text-muted-foreground'>{user.email}</p>
        )}
        <p className='text-sm text-muted-foreground'>
          {allWeeklySummaries.length} week{allWeeklySummaries.length !== 1 ? 's' : ''} of data
        </p>
      </div>

      {allWeeklySummaries.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center text-muted-foreground'>
            No weekly scores calculated yet. Submit daily entries and calculate
            your weekly score from the Tracker.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Time Range Selector ───────────────────────────────────────── */}
          <Card>
            <CardHeader className='p-4 pb-3'>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Analysis Period
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-0 space-y-3'>
              {/* Preset buttons */}
              <div className='flex flex-wrap gap-2'>
                {(Object.keys(RANGE_LABELS) as RangePreset[]).map((preset) => (
                  <Button
                    key={preset}
                    variant={!useCustomRange && rangePreset === preset ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      setRangePreset(preset);
                      setUseCustomRange(false);
                    }}
                  >
                    {RANGE_LABELS[preset]}
                  </Button>
                ))}
              </div>
              {/* Custom date range */}
              <div className='flex flex-wrap items-center gap-3'>
                <span className='text-sm text-muted-foreground'>Custom:</span>
                <input
                  type='date'
                  className='border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  value={customFrom}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    setUseCustomRange(true);
                  }}
                  max={customTo || undefined}
                />
                <span className='text-sm text-muted-foreground'>to</span>
                <input
                  type='date'
                  className='border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  value={customTo}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    setUseCustomRange(true);
                  }}
                  min={customFrom || undefined}
                />
                {useCustomRange && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setUseCustomRange(false);
                      setCustomFrom('');
                      setCustomTo('');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                Showing {filteredSummaries.length} week{filteredSummaries.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* ── Summary Stats ─────────────────────────────────────────────── */}
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

          {filteredSummaries.length > 0 && (
            <>
              {/* ── Weekly Trend Chart ──────────────────────────────────────── */}
              <Card>
                <CardHeader className='p-4 pb-2'>
                  <CardTitle className='text-sm flex items-center gap-2'>
                    <TrendingUp className='h-4 w-4' />
                    Weekly Score Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4 pt-0'>
                  <ResponsiveContainer width='100%' height={280}>
                    <LineChart
                      data={weeklyChartData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
                      <XAxis
                        dataKey='week'
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        interval='preserveStartEnd'
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)}%`,
                          name,
                        ]}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--background))',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      />
                      <Line
                        type='monotone'
                        dataKey='Soul'
                        stroke='#8b5cf6'
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
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        strokeDasharray='4 2'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* ── Monthly Analysis Chart ──────────────────────────────────── */}
              {monthlyChartData.length > 0 && (
                <Card>
                  <CardHeader className='p-4 pb-2'>
                    <CardTitle className='text-sm flex items-center gap-2'>
                      <BarChart2 className='h-4 w-4' />
                      Monthly Averages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-4 pt-0'>
                    <ResponsiveContainer width='100%' height={280}>
                      <BarChart
                        data={monthlyChartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
                        <XAxis
                          dataKey='month'
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(1)}%`,
                            name,
                          ]}
                          contentStyle={{
                            fontSize: 12,
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            backgroundColor: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                        <Bar dataKey='Soul' fill='#8b5cf6' radius={[3, 3, 0, 0]} />
                        <Bar dataKey='Body' fill='#3b82f6' radius={[3, 3, 0, 0]} />
                        <Bar dataKey='Overall' fill='#22c55e' radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* ── Weekly History Accordion ───────────────────────────────────── */}
          <div className='space-y-3'>
            <h2 className='text-base font-semibold'>
              Weekly History ({sortedWeeklyDesc.length} weeks)
            </h2>
            {sortedWeeklyDesc.map((week) => (
              <WeekAnalysis
                key={week.id}
                summary={week}
                dailyScores={dailyScores}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
