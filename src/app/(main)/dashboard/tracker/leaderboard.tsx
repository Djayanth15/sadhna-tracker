'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Trophy, Medal } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

interface LeaderboardEntry {
  userId: string;
  name: string;
  weekScore: number | null;
  soulScore: number | null;
  bodyScore: number | null;
}

interface LeaderboardProps {
  currentUserId: string;
}

const getMondayOfWeek = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

const formatWeekRange = (weekStart: Date): string => {
  const weekEnd = addDays(weekStart, 6);
  return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
};

const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];
const rankBg = [
  'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
  'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700',
  'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className='h-4 w-4 text-yellow-500' />;
  if (rank === 2) return <Medal className='h-4 w-4 text-slate-400' />;
  if (rank === 3) return <Medal className='h-4 w-4 text-amber-600' />;
  return (
    <span className='text-sm font-semibold text-muted-foreground w-4 text-center'>
      {rank}
    </span>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const color =
    value >= 80
      ? 'text-green-600 dark:text-green-400'
      : value >= 60
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-500 dark:text-red-400';
  return (
    <span className={`font-semibold tabular-nums ${color}`}>
      {value.toFixed(1)}%
    </span>
  );
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const lastWeek = getMondayOfWeek(addDays(new Date(), -7));

  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMondayOfWeek(addDays(new Date(), -7))
  );

  const isLastWeek = weekStart.getTime() === lastWeek.getTime();

  const fetchLeaderboard = useCallback(async (ws: Date) => {
    setLoading(true);
    try {
      const weekStartStr = format(ws, 'yyyy-MM-dd');
      const res = await fetch(`/api/leaderboard?weekStart=${weekStartStr}`);
      if (res.ok) {
        setEntries(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(weekStart);
  }, [weekStart, fetchLeaderboard]);

  const navigateWeek = (dir: 'prev' | 'next') => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (dir === 'prev' ? -7 : 7));
      return d;
    });
  };

  const activeEntries = entries.filter((e) => e.weekScore !== null);
  const noDataEntries = entries.filter((e) => e.weekScore === null);

  return (
    <div className='space-y-4'>
      {/* Week selector */}
      <div className='flex items-center justify-between gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateWeek('prev')}
          className='flex-1 sm:flex-none'
        >
          <ChevronLeft className='h-4 w-4 sm:mr-1' />
          <span className='hidden sm:inline'>Prev</span>
        </Button>

        <div className='text-center flex-1 sm:flex-none'>
          <p className='text-sm font-medium'>{formatWeekRange(weekStart)}</p>
          <p className='text-xs text-muted-foreground'>
            {isLastWeek ? 'Last week' : 'Weekly scores'}
          </p>
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateWeek('next')}
          disabled={isLastWeek}
          className='flex-1 sm:flex-none'
        >
          <span className='hidden sm:inline'>Next</span>
          <ChevronRight className='h-4 w-4 sm:ml-1' />
        </Button>
      </div>

      {!isLastWeek && (
        <Button
          variant='ghost'
          size='sm'
          className='w-full text-xs'
          onClick={() => setWeekStart(lastWeek)}
        >
          Back to last week
        </Button>
      )}

      {loading ? (
        <div className='text-center py-10 text-sm text-muted-foreground'>
          Loading leaderboard...
        </div>
      ) : entries.length === 0 ? (
        <div className='text-center py-10 text-sm text-muted-foreground'>
          No participants found.
        </div>
      ) : (
        <>
          {/* Top 3 podium (desktop) */}
          {activeEntries.length >= 3 && (
            <div className='hidden sm:grid grid-cols-3 gap-3 mb-2'>
              {[activeEntries[1], activeEntries[0], activeEntries[2]].map(
                (entry, podiumIdx) => {
                  const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
                  const isMe = entry.userId === currentUserId;
                  return (
                    <Card
                      key={entry.userId}
                      className={`border ${rankBg[rank - 1]} ${isMe ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardHeader className='p-3 pb-2 text-center'>
                        <div className='flex justify-center mb-1'>
                          <RankIcon rank={rank} />
                        </div>
                        <CardTitle className='text-sm truncate'>
                          {entry.name}
                          {isMe && (
                            <span className='ml-1 text-xs text-primary'>
                              (you)
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='p-3 pt-0 text-center'>
                        <p
                          className={`text-2xl font-black ${rankColors[rank - 1]}`}
                        >
                          {entry.weekScore!.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}

          {/* Full ranked list */}
          <div className='space-y-2'>
            {activeEntries.map((entry, idx) => {
              const rank = idx + 1;
              const isMe = entry.userId === currentUserId;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isMe
                      ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/30'
                      : 'bg-card'
                  }`}
                >
                  <div className='flex items-center justify-center w-6 shrink-0'>
                    <RankIcon rank={rank} />
                  </div>

                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm'>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {entry.name}
                      {isMe && (
                        <span className='ml-1 text-xs text-primary font-normal'>
                          (you)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className='flex flex-col items-end gap-0.5 shrink-0'>
                    <ScoreBadge value={entry.weekScore!} />
                    <div className='flex gap-2 text-xs text-muted-foreground'>
                      <span>
                        S:{' '}
                        <span className='text-purple-500'>
                          {entry.soulScore!.toFixed(0)}%
                        </span>
                      </span>
                      <span>
                        B:{' '}
                        <span className='text-blue-500'>
                          {entry.bodyScore!.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {noDataEntries.length > 0 && (
              <div className='pt-2'>
                <p className='text-xs text-muted-foreground px-1 mb-2'>
                  No data yet
                </p>
                {noDataEntries.map((entry) => {
                  const isMe = entry.userId === currentUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-3 p-3 rounded-lg border opacity-50 ${
                        isMe ? 'border-primary/40' : ''
                      }`}
                    >
                      <div className='w-6 shrink-0 text-center text-xs text-muted-foreground'>
                        —
                      </div>
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-sm'>
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {entry.name}
                        {isMe && (
                          <span className='ml-1 text-xs text-primary'>
                            (you)
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
