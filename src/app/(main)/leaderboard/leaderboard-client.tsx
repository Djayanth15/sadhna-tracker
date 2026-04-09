'use client';

import { useState, useEffect, useCallback } from 'react';
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
  ChevronRight,
  Trophy,
  Users,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isSameWeek,
} from 'date-fns';

interface WeeklyEntry {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalSoulScore: number;
  totalBodyScore: number;
  overallAverage: number;
  daysRecorded: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AvailableWeek {
  weekStart: string;
  weekEnd: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_BG = [
  'bg-yellow-50 dark:bg-yellow-950/20',
  'bg-gray-50 dark:bg-gray-800/20',
  'bg-amber-50 dark:bg-amber-950/20',
];
const MEDAL_BORDER = [
  'border-yellow-200 dark:border-yellow-800',
  'border-gray-200 dark:border-gray-700',
  'border-amber-200 dark:border-amber-800',
];

export function LeaderboardClient({ currentUserId }: { currentUserId: string }) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<AvailableWeek[]>([]);
  const [loading, setLoading] = useState(false);

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(addDays(weekStart, 6), 'MMM d, yyyy');
  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?weekStart=${weekStartStr}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.leaderboard ?? []);
        setAvailableWeeks(data.availableWeeks ?? []);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
    } finally {
      setLoading(false);
    }
  }, [weekStartStr]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const goToPrevWeek = () => setWeekStart((w) => subWeeks(w, 1));
  const goToNextWeek = () => setWeekStart((w) => addWeeks(w, 1));
  const goToCurrentWeek = () =>
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Jump to a week that has data (most recent)
  const jumpToLatestWeek = () => {
    if (availableWeeks.length > 0) {
      const latest = availableWeeks[0];
      const d = new Date(`${latest.weekStart.split('T')[0]}T00:00:00`);
      setWeekStart(startOfWeek(d, { weekStartsOn: 1 }));
    }
  };

  const hasDataInAnyWeek = availableWeeks.length > 0;
  const currentWeekHasData = entries.length > 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30'>
          <Trophy className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>Leaderboard</h1>
          <p className='text-sm text-muted-foreground'>
            Weekly rankings across all participants
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <div>
              <p className='font-semibold'>
                {format(weekStart, 'MMM d')} – {weekEndStr}
              </p>
              <p className='text-sm text-muted-foreground'>
                {isCurrentWeek ? 'Current week' : format(weekStart, 'yyyy')}
                {currentWeekHasData
                  ? ` · ${entries.length} participant${entries.length !== 1 ? 's' : ''}`
                  : ''}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={goToPrevWeek}>
                <ChevronLeft className='h-4 w-4' />
                <span className='hidden sm:inline ml-1'>Prev</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={goToCurrentWeek}
                disabled={isCurrentWeek}
              >
                This Week
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={goToNextWeek}
                disabled={isCurrentWeek}
              >
                <span className='hidden sm:inline mr-1'>Next</span>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader className='p-4 pb-2'>
          <CardTitle className='text-base flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Weekly Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0 pb-2'>
          {loading ? (
            <p className='text-center py-12 text-muted-foreground'>Loading...</p>
          ) : !currentWeekHasData ? (
            <div className='text-center py-12 space-y-3'>
              <p className='text-muted-foreground'>
                No scores submitted for this week yet.
              </p>
              {hasDataInAnyWeek && !isCurrentWeek && (
                <Button variant='outline' size='sm' onClick={jumpToLatestWeek}>
                  Jump to latest week with data
                </Button>
              )}
              {hasDataInAnyWeek && isCurrentWeek && (
                <Button variant='outline' size='sm' onClick={goToPrevWeek}>
                  Go to previous week
                </Button>
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-16 pl-4'>Rank</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead className='text-center'>Soul</TableHead>
                    <TableHead className='text-center'>Body</TableHead>
                    <TableHead className='text-center'>Overall</TableHead>
                    <TableHead className='text-center hidden sm:table-cell'>
                      Days
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => {
                    const isTop3 = index < 3;
                    const isCurrentUser = entry.user.id === currentUserId;
                    const rowBg = isTop3 ? MEDAL_BG[index] : '';
                    const rowBorder = isTop3 ? MEDAL_BORDER[index] : '';

                    return (
                      <TableRow
                        key={entry.id}
                        className={`${rowBg} ${
                          isCurrentUser
                            ? 'ring-2 ring-inset ring-primary/30'
                            : ''
                        } transition-colors`}
                      >
                        <TableCell className='pl-4'>
                          <div className='flex items-center gap-1.5'>
                            {isTop3 ? (
                              <span className='text-xl'>{MEDALS[index]}</span>
                            ) : (
                              <span className='text-sm font-semibold text-muted-foreground w-6 text-center'>
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isTop3
                                  ? 'bg-white dark:bg-gray-900 border ' + rowBorder
                                  : 'bg-muted'
                              }`}
                            >
                              {entry.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className='font-medium text-sm leading-tight'>
                                {entry.user.name}
                                {isCurrentUser && (
                                  <Badge
                                    variant='outline'
                                    className='ml-2 text-xs py-0 px-1.5'
                                  >
                                    You
                                  </Badge>
                                )}
                              </p>
                              <p className='text-xs text-muted-foreground hidden sm:block'>
                                {entry.user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-center'>
                          <span className='font-semibold text-purple-600 dark:text-purple-400 text-sm'>
                            {entry.totalSoulScore.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className='text-center'>
                          <span className='font-semibold text-blue-600 dark:text-blue-400 text-sm'>
                            {entry.totalBodyScore.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className='text-center'>
                          <span
                            className={`font-bold text-sm ${
                              entry.overallAverage >= 80
                                ? 'text-green-600 dark:text-green-400'
                                : entry.overallAverage >= 60
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-500 dark:text-red-400'
                            }`}
                          >
                            {entry.overallAverage.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className='text-center hidden sm:table-cell'>
                          <span
                            className={`text-xs font-medium ${
                              entry.daysRecorded === 7
                                ? 'text-green-600 dark:text-green-400'
                                : entry.daysRecorded >= 5
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {entry.daysRecorded}/7
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Highlight Cards (visible only when there are 3+ entries) */}
      {!loading && entries.length >= 3 && (
        <div className='grid grid-cols-3 gap-3'>
          {entries.slice(0, 3).map((entry, index) => (
            <Card
              key={entry.id}
              className={`text-center border ${MEDAL_BORDER[index]} ${MEDAL_BG[index]}`}
            >
              <CardContent className='p-4'>
                <div className='text-2xl mb-1'>{MEDALS[index]}</div>
                <p className='font-semibold text-sm truncate'>{entry.user.name}</p>
                <p className='text-lg font-bold text-green-600 dark:text-green-400 mt-1'>
                  {entry.overallAverage.toFixed(1)}%
                </p>
                <div className='flex justify-center gap-3 mt-1 text-xs text-muted-foreground'>
                  <span className='text-purple-600 dark:text-purple-400'>
                    S {entry.totalSoulScore.toFixed(0)}%
                  </span>
                  <span className='text-blue-600 dark:text-blue-400'>
                    B {entry.totalBodyScore.toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
