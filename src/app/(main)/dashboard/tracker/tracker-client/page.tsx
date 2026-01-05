'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, TrendingUp, Plus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface DailyScore {
  id: string;
  userId: string;
  date: string;
  bodyScore: number;
  soulScore: number;
  average: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface DailyScoreData {
  scoreDate: string;
  bodyScore: number;
  soulScore: number;
  average: number;
}

interface WeekData {
  weekStart: string;
  weekEnd: string;
  bodyAvg: string;
  soulAvg: string;
  overallAvg: string;
  dailyScores: DailyScoreData[];
}

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  bodyAvg: string;
  soulAvg: string;
  overallAvg: string;
}

interface TrackerClientProps {
  user: User;
}

export function TrackerClient({ user }: TrackerClientProps) {
  const [scores, setScores] = useState<DailyScore[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [bodyScore, setBodyScore] = useState('');
  const [soulScore, setSoulScore] = useState('');
  const [view, setView] = useState<'entry' | 'table' | 'chart'>('entry');
  const [loading, setLoading] = useState(false);
  const [allUsersScores, setAllUsersScores] = useState<DailyScore[]>([]);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchScores();
    if (isAdmin) {
      fetchAllUsersScores();
    }
  }, [isAdmin]);

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/scores');
      if (response.ok) {
        const data = await response.json();
        setScores(data);
      }
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    }
  };

  const fetchAllUsersScores = async () => {
    try {
      const response = await fetch('/api/scores/all-users');
      if (response.ok) {
        const data = await response.json();
        setAllUsersScores(data);
      }
    } catch (error) {
      console.error('Failed to fetch all users scores:', error);
    }
  };

  const handleSubmitScore = async () => {
    const body = parseFloat(bodyScore);
    const soul = parseFloat(soulScore);

    if (body >= 0 && body <= 10 && soul >= 0 && soul <= 10) {
      setLoading(true);
      try {
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            bodyScore: body,
            soulScore: soul,
          }),
        });

        if (response.ok) {
          await fetchScores();
          setBodyScore('');
          setSoulScore('');
        }
      } catch (error) {
        console.error('Failed to save score:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getWeekStart = (date: string) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeeklyData = (): WeekData[] => {
    const weeks: Record<
      string,
      {
        dates: string[];
        body: number[];
        soul: number[];
        avg: number[];
      }
    > = {};

    scores.forEach((score) => {
      const weekStart = getWeekStart(score.date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { dates: [], body: [], soul: [], avg: [] };
      }

      weeks[weekKey].dates.push(score.date);
      weeks[weekKey].body.push(score.bodyScore);
      weeks[weekKey].soul.push(score.soulScore);
      weeks[weekKey].avg.push(score.average);
    });

    return Object.keys(weeks)
      .sort()
      .map((weekKey) => {
        const week = weeks[weekKey];
        return {
          weekStart: weekKey,
          weekEnd: new Date(
            new Date(weekKey).getTime() + 6 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
          bodyAvg: (
            week.body.reduce((a, b) => a + b, 0) / week.body.length
          ).toFixed(2),
          soulAvg: (
            week.soul.reduce((a, b) => a + b, 0) / week.soul.length
          ).toFixed(2),
          overallAvg: (
            week.avg.reduce((a, b) => a + b, 0) / week.avg.length
          ).toFixed(2),
          dailyScores: week.dates
            .map((date) => {
              const score = scores.find((s) => s.date === date);
              return score
                ? {
                    scoreDate: score.date,
                    bodyScore: score.bodyScore,
                    soulScore: score.soulScore,
                    average: score.average,
                  }
                : { scoreDate: date, bodyScore: 0, soulScore: 0, average: 0 };
            })
            .sort(
              (a, b) =>
                new Date(a.scoreDate).getTime() -
                new Date(b.scoreDate).getTime()
            ),
        };
      });
  };

  const getChartData = () => {
    return getWeeklyData().map((week, index) => ({
      week: `Week ${index + 1}`,
      weekLabel: `${format(new Date(week.weekStart), 'MMM d')} - ${format(
        new Date(week.weekEnd),
        'MMM d'
      )}`,
      Body: parseFloat(week.bodyAvg),
      Soul: parseFloat(week.soulAvg),
      Overall: parseFloat(week.overallAvg),
    }));
  };

  const getAllUsersWeeklyData = (): Record<string, WeeklySummary[]> => {
    const userWeeks: Record<
      string,
      Record<
        string,
        { dates: string[]; body: number[]; soul: number[]; avg: number[] }
      >
    > = {};

    allUsersScores.forEach((score) => {
      const userName = score.user?.name || 'Unknown';
      if (!userWeeks[userName]) {
        userWeeks[userName] = {};
      }

      const weekStart = getWeekStart(score.date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!userWeeks[userName][weekKey]) {
        userWeeks[userName][weekKey] = {
          dates: [],
          body: [],
          soul: [],
          avg: [],
        };
      }

      userWeeks[userName][weekKey].dates.push(score.date);
      userWeeks[userName][weekKey].body.push(score.bodyScore);
      userWeeks[userName][weekKey].soul.push(score.soulScore);
      userWeeks[userName][weekKey].avg.push(score.average);
    });

    const result: Record<string, WeeklySummary[]> = {};
    Object.keys(userWeeks).forEach((userName) => {
      result[userName] = Object.keys(userWeeks[userName])
        .sort()
        .map((weekKey) => {
          const week = userWeeks[userName][weekKey];
          return {
            weekStart: weekKey,
            weekEnd: new Date(
              new Date(weekKey).getTime() + 6 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0],
            bodyAvg: (
              week.body.reduce((a, b) => a + b, 0) / week.body.length
            ).toFixed(2),
            soulAvg: (
              week.soul.reduce((a, b) => a + b, 0) / week.soul.length
            ).toFixed(2),
            overallAvg: (
              week.avg.reduce((a, b) => a + b, 0) / week.avg.length
            ).toFixed(2),
          };
        });
    });

    return result;
  };

  const currentScore = scores.find((s) => s.date === selectedDate);

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>Body & Soul Tracker</h1>
        <p className='text-muted-foreground'>
          Track your daily wellness journey
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex gap-4 flex-wrap'>
            {!isAdmin && (
              <Button
                onClick={() => setView('entry')}
                variant={view === 'entry' ? 'default' : 'outline'}
              >
                <Plus className='mr-2 h-4 w-4' />
                Enter Scores
              </Button>
            )}
            <Button
              onClick={() => setView('table')}
              variant={view === 'table' ? 'default' : 'outline'}
            >
              <Calendar className='mr-2 h-4 w-4' />
              {isAdmin ? 'All Users View' : 'Weekly View'}
            </Button>
            {!isAdmin && (
              <Button
                onClick={() => setView('chart')}
                variant={view === 'chart' ? 'default' : 'outline'}
              >
                <TrendingUp className='mr-2 h-4 w-4' />
                Progress Chart
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {view === 'entry' && !isAdmin && (
            <div className='max-w-md mx-auto space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='date'>Date</Label>
                <Input
                  id='date'
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='body'>Body Score (0-10)</Label>
                <Input
                  id='body'
                  type='number'
                  step='0.1'
                  min='0'
                  max='10'
                  value={bodyScore}
                  onChange={(e) => setBodyScore(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='soul'>Soul Score (0-10)</Label>
                <Input
                  id='soul'
                  type='number'
                  step='0.1'
                  min='0'
                  max='10'
                  value={soulScore}
                  onChange={(e) => setSoulScore(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSubmitScore}
                disabled={loading}
                className='w-full'
              >
                {loading ? 'Saving...' : 'Save Score'}
              </Button>

              {currentScore && (
                <div className='p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg'>
                  <p className='font-semibold text-green-800 dark:text-green-200'>
                    Current scores for{' '}
                    {format(new Date(selectedDate), 'MMM d, yyyy')}:
                  </p>
                  <p className='text-green-700 dark:text-green-300'>
                    Body: {currentScore.bodyScore} | Soul:{' '}
                    {currentScore.soulScore} | Avg:{' '}
                    {currentScore.average.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {view === 'table' && !isAdmin && (
            <div className='space-y-6'>
              {getWeeklyData().length === 0 ? (
                <p className='text-muted-foreground text-center py-8'>
                  No data yet. Start entering your daily scores!
                </p>
              ) : (
                getWeeklyData().map((week, index) => (
                  <Card key={week.weekStart}>
                    <CardHeader className='bg-primary text-primary-foreground'>
                      <CardTitle>
                        Week {index + 1}:{' '}
                        {format(new Date(week.weekStart), 'MMM d')} -{' '}
                        {format(new Date(week.weekEnd), 'MMM d, yyyy')}
                      </CardTitle>
                      <div className='flex gap-6 text-sm'>
                        <span>Body Avg: {week.bodyAvg}</span>
                        <span>Soul Avg: {week.soulAvg}</span>
                        <span>Overall Avg: {week.overallAvg}</span>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-6'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Body</TableHead>
                            <TableHead>Soul</TableHead>
                            <TableHead>Average</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {week.dailyScores.map((day) => (
                            <TableRow key={day.scoreDate}>
                              <TableCell>
                                {format(new Date(day.scoreDate), 'EEE, MMM d')}
                              </TableCell>
                              <TableCell>{day.bodyScore.toFixed(1)}</TableCell>
                              <TableCell>{day.soulScore.toFixed(1)}</TableCell>
                              <TableCell className='font-semibold'>
                                {day.average.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {view === 'table' && isAdmin && (
            <div className='space-y-8'>
              {Object.keys(getAllUsersWeeklyData()).length === 0 ? (
                <p className='text-muted-foreground text-center py-8'>
                  No users have entered data yet.
                </p>
              ) : (
                Object.entries(getAllUsersWeeklyData()).map(
                  ([userName, weeks]) => (
                    <Card key={userName} className='border-2'>
                      <CardHeader className='bg-primary text-primary-foreground'>
                        <CardTitle>User: {userName}</CardTitle>
                      </CardHeader>
                      <CardContent className='pt-6'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Week</TableHead>
                              <TableHead>Period</TableHead>
                              <TableHead>Body Avg</TableHead>
                              <TableHead>Soul Avg</TableHead>
                              <TableHead>Overall Avg</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {weeks.map((week, index) => (
                              <TableRow key={week.weekStart}>
                                <TableCell className='font-medium'>
                                  Week {index + 1}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(week.weekStart), 'MMM d')} -{' '}
                                  {format(
                                    new Date(week.weekEnd),
                                    'MMM d, yyyy'
                                  )}
                                </TableCell>
                                <TableCell className='text-blue-600 dark:text-blue-400 font-semibold'>
                                  {week.bodyAvg}
                                </TableCell>
                                <TableCell className='text-purple-600 dark:text-purple-400 font-semibold'>
                                  {week.soulAvg}
                                </TableCell>
                                <TableCell className='text-green-600 dark:text-green-400 font-bold'>
                                  {week.overallAvg}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )
                )
              )}
            </div>
          )}

          {view === 'chart' && !isAdmin && (
            <div>
              {getChartData().length === 0 ? (
                <p className='text-muted-foreground text-center py-8'>
                  No data yet. Start entering your daily scores!
                </p>
              ) : (
                <ResponsiveContainer width='100%' height={400}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='week' />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='bg-background border rounded-lg shadow-lg p-4'>
                              <p className='font-semibold mb-2'>
                                {payload[0].payload.weekLabel}
                              </p>
                              {payload.map((entry, index: number) => (
                                <p key={index} style={{ color: entry.color }}>
                                  {entry.name}: {entry.value}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='Body'
                      stroke='#3b82f6'
                      strokeWidth={2}
                    />
                    <Line
                      type='monotone'
                      dataKey='Soul'
                      stroke='#8b5cf6'
                      strokeWidth={2}
                    />
                    <Line
                      type='monotone'
                      dataKey='Overall'
                      stroke='#10b981'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
