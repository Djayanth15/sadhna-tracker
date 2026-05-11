'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Users,
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

interface ScorePopup {
  weekId: string;
  soulScore: number;
  bodyScore: number;
}

export function TrackerClientNew({ user }: TrackerClientProps) {
  const router = useRouter();
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
  const [allParticipants, setAllParticipants] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [scorePopup, setScorePopup] = useState<ScorePopup | null>(null);
  const [explanation, setExplanation] = useState('');
  const [savingExplanation, setSavingExplanation] = useState(false);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      fetchGoals();
      fetchDailyScores();
      fetchWeeklyScores();
      fetchAllParticipants();
    }
    if (isAdmin) {
      fetchAllUsersScores();
      fetchAllUsersWeeklyScores();
      fetchAllParticipants();
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

  const fetchAllParticipants = async () => {
    try {
      const response = await fetch('/api/admin/participants');
      if (response.ok) {
        const data = await response.json();
        setAllParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
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
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const response = await fetch('/api/scores/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStartDate: weekStartStr }),
      });

      if (response.ok) {
        const summary = await response.json();
        await fetchWeeklyScores();
        setExplanation('');
        setScorePopup({
          weekId: summary.id,
          soulScore: summary.totalSoulScore,
          bodyScore: summary.totalBodyScore,
        });
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

  const handlePopupClose = async () => {
    if (!scorePopup) return;
    const needsExplanation =
      scorePopup.soulScore < 80 || scorePopup.bodyScore < 80;
    if (needsExplanation && explanation.trim()) {
      setSavingExplanation(true);
      try {
        await fetch('/api/scores/weekly', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weekId: scorePopup.weekId, explanation }),
        });
      } catch (e) {
        console.error('Failed to save explanation:', e);
      } finally {
        setSavingExplanation(false);
      }
    }
    setScorePopup(null);
    setExplanation('');
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

          {/* Admin View - Participants List */}
          {view === 'admin' && isAdmin && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Users className='h-4 w-4' />
                <span>
                  {allParticipants.length} participant
                  {allParticipants.length !== 1 ? 's' : ''}
                </span>
              </div>

              {allParticipants.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>
                  No participants found.
                </p>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {allParticipants.map((participant) => (
                    <button
                      key={participant.id}
                      onClick={() =>
                        router.push(`/admin/participants/${participant.id}`)
                      }
                      className='flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/40 transition-colors text-left w-full'
                    >
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm'>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className='min-w-0'>
                        <p className='font-medium text-sm truncate'>
                          {participant.name}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {participant.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Score Popup */}
      {scorePopup && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>
          <div className='bg-background rounded-xl shadow-xl border w-full max-w-sm space-y-5 p-6'>
            <h2 className='text-lg font-semibold text-center'>
              Weekly Score Results
            </h2>

            <div className='grid grid-cols-2 gap-3'>
              <div className='p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-center'>
                <p className='text-xs text-muted-foreground mb-1'>Soul Score</p>
                <p
                  className={`text-2xl font-black ${scorePopup.soulScore < 80 ? 'text-red-500 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`}
                >
                  {scorePopup.soulScore.toFixed(1)}%
                </p>
                {scorePopup.soulScore < 80 && (
                  <p className='text-xs text-red-500 mt-1'>Below 80%</p>
                )}
              </div>
              <div className='p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center'>
                <p className='text-xs text-muted-foreground mb-1'>Body Score</p>
                <p
                  className={`text-2xl font-black ${scorePopup.bodyScore < 80 ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}
                >
                  {scorePopup.bodyScore.toFixed(1)}%
                </p>
                {scorePopup.bodyScore < 80 && (
                  <p className='text-xs text-red-500 mt-1'>Below 80%</p>
                )}
              </div>
            </div>

            {(scorePopup.soulScore < 80 || scorePopup.bodyScore < 80) && (
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Please explain your low score
                  <span className='text-red-500 ml-0.5'>*</span>
                </label>
                <textarea
                  className='w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary'
                  rows={3}
                  placeholder='What happened this week? What will you do differently?'
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                />
              </div>
            )}

            <Button
              className='w-full'
              onClick={handlePopupClose}
              disabled={
                savingExplanation ||
                ((scorePopup.soulScore < 80 || scorePopup.bodyScore < 80) &&
                  !explanation.trim())
              }
            >
              {savingExplanation
                ? 'Saving...'
                : scorePopup.soulScore < 80 || scorePopup.bodyScore < 80
                  ? 'Submit Explanation'
                  : 'Close'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
