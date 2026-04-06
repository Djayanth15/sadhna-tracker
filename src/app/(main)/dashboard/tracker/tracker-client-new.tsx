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
import {
  Calendar,
  TrendingUp,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
} from 'date-fns';
import { GoalsForm } from './goals-form';
import { DailyQuestionnaire } from './daily-questionnaire';

interface WeeklyGoals {
  maxHoursLectures: number;
  maxHoursReading: number;
  maxHoursStudyWork: number;
}

interface DailyScore {
  id: string;
  date: string;
  dailySoulScore: number;
  dailyBodyScore: number;
  mpAttendanceScore: number;
  japaCompletionScore: number;
  sleepScore: number;
  wakeScore: number;
  restScore: number;
  sameDayScore: number;
  lectureMinutes: number;
  readingMinutes: number;
  studyWorkMinutes: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
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

interface WeeklySummaryWithUser extends WeeklySummary {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface TrackerClientProps {
  user: User;
}

// Helper to parse ISO date string as local date (ignoring timezone)
// This fixes the off-by-one day issue when dates stored as DATE type
// are returned as UTC ISO strings and displayed in local timezone
const parseLocalDate = (isoString: string) => {
  const datePart = isoString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function TrackerClientNew({ user }: TrackerClientProps) {
  const [goals, setGoals] = useState<WeeklyGoals | null>(null);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<WeeklySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [view, setView] = useState<'goals' | 'entry' | 'weekly' | 'admin'>(
    'entry'
  );
  const [adminView, setAdminView] = useState<'daily' | 'weekly'>('daily');
  const [expandedWeeklyUser, setExpandedWeeklyUser] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [allUsersScores, setAllUsersScores] = useState<DailyScore[]>([]);
  const [allUsersWeeklyScores, setAllUsersWeeklyScores] = useState<
    WeeklySummaryWithUser[]
  >([]);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      fetchGoals();
      fetchDailyScores();
      fetchWeeklyScores();
    }
    if (isAdmin) {
      fetchAllUsersScores();
      fetchAllUsersWeeklyScores();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      if (view === 'weekly') {
        fetchDailyScores();
        fetchWeeklyScores();
      } else if (view === 'entry') {
        fetchDailyScores();
      }
    }
  }, [view]);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
        if (!data) {
          setView('goals');
        }
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const fetchDailyScores = async () => {
    try {
      console.log('Fetching daily scores...');
      const response = await fetch('/api/scores');
      if (response.ok) {
        const data = await response.json();
        console.log('Daily scores fetched:', data);
        setDailyScores(data);
      }
    } catch (error) {
      console.error('Failed to fetch daily scores:', error);
    }
  };

  const fetchWeeklyScores = async () => {
    try {
      const response = await fetch('/api/scores/weekly');
      if (response.ok) {
        const data = await response.json();
        setWeeklyScores(data);
      }
    } catch (error) {
      console.error('Failed to fetch weekly scores:', error);
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

  const fetchAllUsersWeeklyScores = async () => {
    try {
      const response = await fetch('/api/scores/all-weekly');
      if (response.ok) {
        const data = await response.json();
        setAllUsersWeeklyScores(data);
      }
    } catch (error) {
      console.error('Failed to fetch all users weekly scores:', error);
    }
  };

  const handleGoalsComplete = () => {
    fetchGoals();
    setView('entry');
  };

  const handleDailySubmit = async () => {
    await fetchDailyScores();
  };

  const calculateWeeklyScore = async () => {
    setLoading(true);
    try {
      const weekStart = startOfWeek(new Date(selectedDate), {
        weekStartsOn: 1,
      });
      // Send date as YYYY-MM-DD string to avoid timezone shift issues
      // when the server parses the ISO timestamp
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const response = await fetch('/api/scores/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: weekStartStr,
        }),
      });

      if (response.ok) {
        await fetchWeeklyScores();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to calculate weekly score');
      }
    } catch (error) {
      console.error('Failed to calculate weekly score:', error);
      alert('Failed to calculate weekly score');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeekDays = () => {
    const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getScoreForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyScores.find((s) => {
      if (!s.date) return false;
      const scoreDateStr = s.date.split('T')[0];
      return scoreDateStr === dateStr;
    });
  };

  const hasCompleteWeekData = () => {
    const weekDays = getCurrentWeekDays();
    return weekDays.every((day) => getScoreForDate(day));
  };

  const groupScoresByUser = () => {
    const grouped: Record<string, DailyScore[]> = {};
    allUsersScores.forEach((score) => {
      const userName = score.user?.name || 'Unknown';
      if (!grouped[userName]) {
        grouped[userName] = [];
      }
      grouped[userName].push(score);
    });
    return grouped;
  };

  const groupWeeklyScoresByUser = () => {
    const grouped: Record<string, WeeklySummaryWithUser[]> = {};
    allUsersWeeklyScores.forEach((score) => {
      const userName = score.user?.name || 'Unknown';
      if (!grouped[userName]) {
        grouped[userName] = [];
      }
      grouped[userName].push(score);
    });
    return grouped;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const daysToAdd = direction === 'prev' ? -7 : 7;
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  return (
    <div className='space-y-4 sm:space-y-6 px-2 sm:px-0'>
      {/* Header - Mobile Optimized */}
      <div className='space-y-2'>
        <h1 className='text-xl sm:text-2xl font-semibold'>
          Body & Soul Tracker
        </h1>
        <p className='text-sm sm:text-base text-muted-foreground'>
          Track your spiritual and physical wellness journey
        </p>
      </div>

      {/* Navigation - Mobile First */}
      <Card>
        <CardHeader className='p-4 sm:p-6'>
          <div className='flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-thin'>
            {!isAdmin && (
              <>
                <Button
                  onClick={() => setView('goals')}
                  variant={view === 'goals' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-shrink-0'
                >
                  <Settings className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='text-xs sm:text-sm'>Goals</span>
                </Button>
                <Button
                  onClick={() => setView('entry')}
                  variant={view === 'entry' ? 'default' : 'outline'}
                  size='sm'
                  disabled={!goals}
                  className='flex-shrink-0'
                >
                  <Calendar className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='text-xs sm:text-sm'>Daily Entry</span>
                </Button>
                <Button
                  onClick={() => setView('weekly')}
                  variant={view === 'weekly' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-shrink-0'
                >
                  <BarChart3 className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='text-xs sm:text-sm'>Weekly</span>
                </Button>
              </>
            )}
            {isAdmin && (
              <Button
                onClick={() => setView('admin')}
                variant={view === 'admin' ? 'default' : 'outline'}
                size='sm'
                className='flex-shrink-0'
              >
                <TrendingUp className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                <span className='text-xs sm:text-sm'>All Users</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className='p-4 sm:p-6'>
          {/* Goals View */}
          {view === 'goals' && !isAdmin && (
            <GoalsForm onComplete={handleGoalsComplete} existingGoals={goals} />
          )}

          {/* Daily Entry View */}
          {view === 'entry' && !isAdmin && goals && (
            <div className='space-y-4 sm:space-y-6'>
              <div className='max-w-md mx-auto space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='date' className='text-sm sm:text-base'>
                    Select Date
                  </Label>
                  <Input
                    id='date'
                    type='date'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className='text-sm sm:text-base'
                  />
                </div>
              </div>

              <DailyQuestionnaire
                selectedDate={selectedDate}
                onSubmit={handleDailySubmit}
              />
            </div>
          )}

          {view === 'entry' && !isAdmin && !goals && (
            <div className='text-center py-8'>
              <p className='text-sm sm:text-base text-muted-foreground mb-4'>
                Please set your weekly goals first to start tracking.
              </p>
              <Button onClick={() => setView('goals')} size='sm'>
                <Settings className='mr-2 h-4 w-4' />
                Set Goals
              </Button>
            </div>
          )}

          {/* Weekly View - Mobile Optimized */}
          {view === 'weekly' && !isAdmin && (
            <div className='space-y-4 sm:space-y-6'>
              {/* Week Navigation */}
              <Card className='bg-muted/50'>
                <CardHeader className='p-4 sm:p-6'>
                  <div className='space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between'>
                    <div>
                      <CardTitle className='text-base sm:text-lg'>
                        Week Progress
                      </CardTitle>
                      <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
                        {format(
                          startOfWeek(new Date(selectedDate), {
                            weekStartsOn: 1,
                          }),
                          'MMM d'
                        )}{' '}
                        -{' '}
                        {format(
                          addDays(
                            startOfWeek(new Date(selectedDate), {
                              weekStartsOn: 1,
                            }),
                            6
                          ),
                          'MMM d, yyyy'
                        )}
                      </p>
                    </div>

                    {/* Mobile: Stack buttons, Desktop: Row */}
                    <div className='flex gap-2 justify-between sm:justify-end'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => navigateWeek('prev')}
                        className='flex-1 sm:flex-none'
                      >
                        <ChevronLeft className='h-4 w-4 sm:mr-1' />
                        <span className='hidden sm:inline'>Prev</span>
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setSelectedDate(
                            new Date().toISOString().split('T')[0]
                          )
                        }
                        className='flex-1 sm:flex-none'
                      >
                        Today
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => navigateWeek('next')}
                        disabled={new Date(selectedDate) >= new Date()}
                        className='flex-1 sm:flex-none'
                      >
                        <span className='hidden sm:inline'>Next</span>
                        <ChevronRight className='h-4 w-4 sm:ml-1' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='p-4 sm:p-6'>
                  {/* Mobile: Card layout, Desktop: Table */}
                  <div className='block sm:hidden space-y-3'>
                    {getCurrentWeekDays().map((day) => {
                      const score = getScoreForDate(day);
                      return (
                        <div
                          key={day.toISOString()}
                          className='flex items-center justify-between p-3 bg-background rounded-lg border'
                        >
                          <div className='flex-1'>
                            <p className='font-medium text-sm'>
                              {format(day, 'EEE, MMM d')}
                            </p>
                            <div className='flex gap-4 mt-1 text-xs text-muted-foreground'>
                              <span>
                                Soul:{' '}
                                {score ? score.dailySoulScore.toFixed(1) : '-'}
                              </span>
                              <span>
                                Body:{' '}
                                {score ? score.dailyBodyScore.toFixed(1) : '-'}
                              </span>
                            </div>
                          </div>
                          <div>
                            {score ? (
                              <span className='text-green-600 text-xl'>✓</span>
                            ) : (
                              <span className='text-red-600 text-xl'>✗</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className='hidden sm:block overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Soul</TableHead>
                          <TableHead>Body</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentWeekDays().map((day) => {
                          const score = getScoreForDate(day);
                          return (
                            <TableRow key={day.toISOString()}>
                              <TableCell>{format(day, 'EEE, MMM d')}</TableCell>
                              <TableCell>
                                {score ? score.dailySoulScore.toFixed(1) : '-'}
                              </TableCell>
                              <TableCell>
                                {score ? score.dailyBodyScore.toFixed(1) : '-'}
                              </TableCell>
                              <TableCell>
                                {score ? (
                                  <span className='text-green-600'>✓</span>
                                ) : (
                                  <span className='text-red-600'>✗</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {hasCompleteWeekData() && (
                    <Button
                      onClick={calculateWeeklyScore}
                      disabled={loading}
                      className='w-full mt-4'
                      size='sm'
                    >
                      {loading ? 'Calculating...' : 'Calculate Weekly Score'}
                    </Button>
                  )}

                  {!hasCompleteWeekData() && (
                    <p className='text-xs sm:text-sm text-muted-foreground text-center mt-4'>
                      Complete all 7 days to calculate weekly score
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Past Weeks */}
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-semibold px-1'>
                  Past Weeks
                </h3>
                {weeklyScores.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>
                    No weekly scores calculated yet
                  </p>
                ) : (
                  weeklyScores.map((week) => (
                    <Card key={week.id}>
                      <CardHeader className='bg-primary text-primary-foreground p-4'>
                        <CardTitle className='text-sm sm:text-base'>
                          {format(parseLocalDate(week.weekStart), 'MMM d')} -{' '}
                          {format(parseLocalDate(week.weekEnd), 'MMM d, yyyy')}
                        </CardTitle>
                        <p className='text-xs sm:text-sm opacity-90'>
                          {week.daysRecorded} days recorded
                        </p>
                      </CardHeader>
                      <CardContent className='p-4 sm:pt-6'>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
                          {/* Soul Score */}
                          <div className='p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg'>
                            <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                              Soul Score
                            </p>
                            <p className='text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400'>
                              {week.totalSoulScore.toFixed(2)}%
                            </p>
                            <div className='text-xs mt-2 space-y-0.5 sm:space-y-1'>
                              <p>MP+Japa: {week.totalMpJapaScore.toFixed(0)}</p>
                              <p>
                                Lectures:{' '}
                                {week.lectureEffectiveScore.toFixed(1)}
                              </p>
                              <p>
                                Reading: {week.readingEffectiveScore.toFixed(1)}
                              </p>
                            </div>
                          </div>

                          {/* Body Score */}
                          <div className='p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg'>
                            <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                              Body Score
                            </p>
                            <p className='text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400'>
                              {week.totalBodyScore.toFixed(2)}%
                            </p>
                            <div className='text-xs mt-2 space-y-0.5 sm:space-y-1'>
                              <p>
                                Daily: {week.totalDailyBodyScore.toFixed(0)}
                              </p>
                              <p>
                                Study/Work:{' '}
                                {week.studyWorkEffectiveScore.toFixed(1)}
                              </p>
                            </div>
                          </div>

                          {/* Overall Score */}
                          <div className='p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 rounded-lg'>
                            <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                              Overall
                            </p>
                            <p className='text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400'>
                              {week.overallAverage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        {/* Weekly Highlights */}
                        <div className='mt-4 pt-4 border-t'>
                          <p className='text-xs sm:text-sm font-medium text-muted-foreground mb-3'>
                            Weekly Highlights
                          </p>
                          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                            <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-md'>
                              <div className='text-xs'>
                                <p className='text-muted-foreground'>
                                  Hours of Reading
                                </p>
                                <p className='font-semibold'>
                                  {week.totalReadingHours.toFixed(1)}h
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-md'>
                              <div className='text-xs'>
                                <p className='text-muted-foreground'>
                                  Hours of Listening
                                </p>
                                <p className='font-semibold'>
                                  {week.totalLectureHours.toFixed(1)}h
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-md'>
                              <div className='text-xs'>
                                <p className='text-muted-foreground'>
                                  MP Attended in Time
                                </p>
                                <p className='font-semibold'>
                                  {week.daysWithMp20}/7 days
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-md'>
                              <div className='text-xs'>
                                <p className='text-muted-foreground'>
                                  Japa Completed in Time
                                </p>
                                <p className='font-semibold'>
                                  {week.daysWithJapa20}/7 days
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-md'>
                              <div className='text-xs'>
                                <p className='text-muted-foreground'>
                                  Slept on Time
                                </p>
                                <p className='font-semibold'>
                                  {week.daysWithSleep20}/7 days
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-md'>
                              <div className='text-xs'>
                                <p className='text-muted-foreground'>
                                  Woke up on Time
                                </p>
                                <p className='font-semibold'>
                                  {week.daysWithWake20}/7 days
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Admin View - Mobile Optimized */}
          {view === 'admin' && isAdmin && (
            <div className='space-y-4 sm:space-y-6'>
              <div className='flex gap-2 overflow-x-auto pb-2'>
                <Button
                  onClick={() => setAdminView('daily')}
                  variant={adminView === 'daily' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-shrink-0'
                >
                  Daily Scores
                </Button>
                <Button
                  onClick={() => setAdminView('weekly')}
                  variant={adminView === 'weekly' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-shrink-0'
                >
                  Weekly Scores
                </Button>
              </div>

              {adminView === 'daily' && (
                <div className='space-y-4 sm:space-y-6'>
                  {Object.keys(groupScoresByUser()).length === 0 ? (
                    <p className='text-sm text-muted-foreground text-center py-8'>
                      No user data available
                    </p>
                  ) : (
                    Object.entries(groupScoresByUser()).map(
                      ([userName, scores]) => (
                        <Card key={userName}>
                          <CardHeader className='bg-primary text-primary-foreground p-4'>
                            <CardTitle className='text-sm sm:text-base'>
                              {userName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='p-0 sm:pt-6'>
                            {/* Mobile: Card Layout */}
                            <div className='block sm:hidden divide-y'>
                              {scores
                                .sort(
                                  (a, b) =>
                                    new Date(b.date).getTime() -
                                    new Date(a.date).getTime()
                                )
                                .slice(0, 10)
                                .map((score) => (
                                  <div key={score.id} className='p-4 space-y-2'>
                                    <p className='font-medium text-sm'>
                                      {format(
                                        parseLocalDate(score.date),
                                        'MMM d, yyyy'
                                      )}
                                    </p>
                                    <div className='flex gap-4 text-sm'>
                                      <span className='text-purple-600 dark:text-purple-400 font-semibold'>
                                        Soul: {score.dailySoulScore.toFixed(1)}
                                      </span>
                                      <span className='text-blue-600 dark:text-blue-400 font-semibold'>
                                        Body: {score.dailyBodyScore.toFixed(1)}
                                      </span>
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                      MP: {score.mpAttendanceScore} | Japa:{' '}
                                      {score.japaCompletionScore} | Sleep:{' '}
                                      {score.sleepScore}
                                    </p>
                                  </div>
                                ))}
                            </div>

                            {/* Desktop: Table */}
                            <div className='hidden sm:block overflow-x-auto'>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Soul Score</TableHead>
                                    <TableHead>Body Score</TableHead>
                                    <TableHead>Details</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {scores
                                    .sort(
                                      (a, b) =>
                                        new Date(b.date).getTime() -
                                        new Date(a.date).getTime()
                                    )
                                    .slice(0, 10)
                                    .map((score) => (
                                      <TableRow key={score.id}>
                                        <TableCell>
                                          {format(
                                            parseLocalDate(score.date),
                                            'MMM d, yyyy'
                                          )}
                                        </TableCell>
                                        <TableCell className='text-purple-600 dark:text-purple-400 font-semibold'>
                                          {score.dailySoulScore.toFixed(1)}
                                        </TableCell>
                                        <TableCell className='text-blue-600 dark:text-blue-400 font-semibold'>
                                          {score.dailyBodyScore.toFixed(1)}
                                        </TableCell>
                                        <TableCell className='text-xs text-muted-foreground'>
                                          MP: {score.mpAttendanceScore} | Japa:{' '}
                                          {score.japaCompletionScore} | Sleep:{' '}
                                          {score.sleepScore}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )
                  )}
                </div>
              )}

              {adminView === 'weekly' &&
                (() => {
                  const grouped = groupWeeklyScoresByUser();
                  // Find the most recent week across all users
                  const latestWeekStart =
                    allUsersWeeklyScores.length > 0
                      ? allUsersWeeklyScores.reduce(
                          (latest, s) =>
                            new Date(s.weekStart) > new Date(latest)
                              ? s.weekStart
                              : latest,
                          allUsersWeeklyScores[0].weekStart
                        )
                      : null;

                  // Build last-week scores per user (sorted by overall desc)
                  const lastWeekRows = Object.entries(grouped)
                    .map(([userName, weeks]) => {
                      const sorted = [...weeks].sort(
                        (a, b) =>
                          new Date(b.weekStart).getTime() -
                          new Date(a.weekStart).getTime()
                      );
                      const lastWeek = latestWeekStart
                        ? (sorted.find(
                            (w) => w.weekStart === latestWeekStart
                          ) ?? sorted[0])
                        : sorted[0];
                      return {
                        userName,
                        lastWeek,
                        allWeeks: sorted,
                        userId: lastWeek?.user?.id,
                      };
                    })
                    .filter((r) => r.lastWeek)
                    .sort(
                      (a, b) =>
                        b.lastWeek!.overallAverage - a.lastWeek!.overallAverage
                    );

                  const medals = ['🥇', '🥈', '🥉'];
                  const podiumColors = [
                    // Gold
                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
                    // Silver
                    'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-600',
                    // Bronze
                    'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
                  ];
                  const podiumScoreColors = [
                    'text-yellow-600 dark:text-yellow-400',
                    'text-slate-500 dark:text-slate-400',
                    'text-orange-500 dark:text-orange-400',
                  ];
                  const rankBadge = (idx: number) => {
                    if (idx === 0) return <span className='text-base'>🥇</span>;
                    if (idx === 1) return <span className='text-base'>🥈</span>;
                    if (idx === 2) return <span className='text-base'>🥉</span>;
                    return (
                      <span className='text-sm text-muted-foreground font-medium'>
                        {idx + 1}
                      </span>
                    );
                  };

                  return (
                    <div className='space-y-4'>
                      {lastWeekRows.length === 0 ? (
                        <p className='text-sm text-muted-foreground text-center py-8'>
                          No weekly scores calculated yet
                        </p>
                      ) : (
                        <>
                          {/* Last week header */}
                          {latestWeekStart && (
                            <p className='text-sm text-muted-foreground px-1'>
                              Last week:{' '}
                              <span className='font-medium text-foreground'>
                                {format(
                                  parseLocalDate(latestWeekStart),
                                  'MMM d'
                                )}{' '}
                                –{' '}
                                {format(
                                  addDays(parseLocalDate(latestWeekStart), 6),
                                  'MMM d, yyyy'
                                )}
                              </span>
                              <span className='ml-2 text-xs'>
                                (click a row to see full history)
                              </span>
                            </p>
                          )}

                          {/* Top-3 podium */}
                          {lastWeekRows.length >= 1 && (
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                              {lastWeekRows
                                .slice(0, 3)
                                .map(({ userName, lastWeek }, idx) => (
                                  <div
                                    key={userName}
                                    className={`relative rounded-xl border-2 p-4 ${podiumColors[idx]} ${idx === 0 ? 'sm:order-2' : idx === 1 ? 'sm:order-1' : 'sm:order-3'}`}
                                  >
                                    {/* Medal */}
                                    <div className='flex items-center justify-between mb-2'>
                                      <span className='text-2xl'>
                                        {medals[idx]}
                                      </span>
                                      {idx === 0 && (
                                        <span className='text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'>
                                          Champion
                                        </span>
                                      )}
                                    </div>
                                    <p className='font-bold text-base truncate'>
                                      {userName}
                                    </p>
                                    <p
                                      className={`text-2xl font-black mt-1 ${podiumScoreColors[idx]}`}
                                    >
                                      {lastWeek!.overallAverage.toFixed(1)}%
                                    </p>
                                    <div className='flex gap-3 mt-2 text-xs text-muted-foreground'>
                                      <span className='text-purple-600 dark:text-purple-400'>
                                        Soul{' '}
                                        {lastWeek!.totalSoulScore.toFixed(1)}%
                                      </span>
                                      <span className='text-blue-600 dark:text-blue-400'>
                                        Body{' '}
                                        {lastWeek!.totalBodyScore.toFixed(1)}%
                                      </span>
                                    </div>
                                    <p className='text-xs text-muted-foreground mt-1'>
                                      {lastWeek!.daysRecorded}/7 days
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Full leaderboard table */}
                          <Card>
                            <CardContent className='p-0 overflow-x-auto'>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className='w-10 text-center'>
                                      #
                                    </TableHead>
                                    <TableHead>Participant</TableHead>
                                    <TableHead className='text-center text-purple-600 dark:text-purple-400'>
                                      Soul
                                    </TableHead>
                                    <TableHead className='text-center text-blue-600 dark:text-blue-400'>
                                      Body
                                    </TableHead>
                                    <TableHead className='text-center text-green-600 dark:text-green-400'>
                                      Overall
                                    </TableHead>
                                    <TableHead className='text-center'>
                                      Days
                                    </TableHead>
                                    <TableHead className='w-8'></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {lastWeekRows.map(
                                    (
                                      { userName, lastWeek, allWeeks, userId },
                                      idx
                                    ) => (
                                      <>
                                        <TableRow
                                          key={userName}
                                          className={`cursor-pointer transition-colors ${
                                            idx === 0
                                              ? 'bg-yellow-50/60 dark:bg-yellow-900/10 hover:bg-yellow-100/60 dark:hover:bg-yellow-900/20'
                                              : idx === 1
                                                ? 'bg-slate-50/60 dark:bg-slate-800/20 hover:bg-slate-100/60 dark:hover:bg-slate-800/30'
                                                : idx === 2
                                                  ? 'bg-orange-50/60 dark:bg-orange-900/10 hover:bg-orange-100/60 dark:hover:bg-orange-900/20'
                                                  : 'hover:bg-muted/50'
                                          }`}
                                          onClick={() =>
                                            setExpandedWeeklyUser(
                                              expandedWeeklyUser === userName
                                                ? null
                                                : userName
                                            )
                                          }
                                        >
                                          <TableCell className='text-center'>
                                            {rankBadge(idx)}
                                          </TableCell>
                                          <TableCell className='font-medium'>
                                            {userName}
                                          </TableCell>
                                          <TableCell className='text-center text-purple-600 dark:text-purple-400 font-semibold'>
                                            {lastWeek!.totalSoulScore.toFixed(
                                              1
                                            )}
                                            %
                                          </TableCell>
                                          <TableCell className='text-center text-blue-600 dark:text-blue-400 font-semibold'>
                                            {lastWeek!.totalBodyScore.toFixed(
                                              1
                                            )}
                                            %
                                          </TableCell>
                                          <TableCell
                                            className={`text-center font-bold ${
                                              idx === 0
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : idx === 1
                                                  ? 'text-slate-500 dark:text-slate-400'
                                                  : idx === 2
                                                    ? 'text-orange-500 dark:text-orange-400'
                                                    : 'text-green-600 dark:text-green-400'
                                            }`}
                                          >
                                            {lastWeek!.overallAverage.toFixed(
                                              1
                                            )}
                                            %
                                          </TableCell>
                                          <TableCell className='text-center text-muted-foreground text-sm'>
                                            {lastWeek!.daysRecorded}/7
                                          </TableCell>
                                          <TableCell>
                                            {expandedWeeklyUser === userName ? (
                                              <ChevronUp className='h-4 w-4 text-muted-foreground' />
                                            ) : (
                                              <ChevronDown className='h-4 w-4 text-muted-foreground' />
                                            )}
                                          </TableCell>
                                        </TableRow>

                                        {/* Expanded history */}
                                        {expandedWeeklyUser === userName && (
                                          <TableRow
                                            key={`${userName}-expanded`}
                                          >
                                            <TableCell
                                              colSpan={7}
                                              className='p-0 bg-muted/20'
                                            >
                                              <div className='p-4 space-y-3'>
                                                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                                                  Full History – {userName}
                                                </p>
                                                <div className='space-y-2'>
                                                  {allWeeks.map((week) => (
                                                    <div
                                                      key={week.id}
                                                      className='flex flex-wrap items-center gap-3 p-3 bg-background rounded-lg border text-sm'
                                                    >
                                                      <span className='font-medium w-36 shrink-0'>
                                                        {format(
                                                          parseLocalDate(
                                                            week.weekStart
                                                          ),
                                                          'MMM d'
                                                        )}
                                                        {' – '}
                                                        {format(
                                                          parseLocalDate(
                                                            week.weekEnd
                                                          ),
                                                          'MMM d, yyyy'
                                                        )}
                                                      </span>
                                                      <span className='text-purple-600 dark:text-purple-400'>
                                                        Soul:{' '}
                                                        {week.totalSoulScore.toFixed(
                                                          1
                                                        )}
                                                        %
                                                      </span>
                                                      <span className='text-blue-600 dark:text-blue-400'>
                                                        Body:{' '}
                                                        {week.totalBodyScore.toFixed(
                                                          1
                                                        )}
                                                        %
                                                      </span>
                                                      <span className='text-green-600 dark:text-green-400 font-semibold'>
                                                        Overall:{' '}
                                                        {week.overallAverage.toFixed(
                                                          1
                                                        )}
                                                        %
                                                      </span>
                                                      <span className='text-muted-foreground text-xs ml-auto'>
                                                        {week.daysRecorded}/7
                                                        days
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>
                  );
                })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
