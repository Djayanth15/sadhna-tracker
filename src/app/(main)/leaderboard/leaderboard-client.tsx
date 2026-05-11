'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Trophy, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';

interface WeeklySummaryEntry {
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

interface LeaderboardData {
  entries: WeeklySummaryEntry[];
  availableWeeks: string[];
  selectedWeek: string | null;
}

const parseLocalDate = (iso: string) => {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
};

const medalColors: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
};

const rowHighlight: Record<number, string> = {
  1: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
  2: 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700',
  3: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
};

function ScoreBar({ value }: { value: number }) {
  return (
    <div className='flex items-center gap-2'>
      <div className='w-20 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block'>
        <div
          className='h-full bg-green-500 rounded-full'
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className='text-sm font-semibold tabular-nums'>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export function LeaderboardClient({ currentUserId }: { currentUserId: string }) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const fetchLeaderboard = async (weekStart?: string) => {
    setLoading(true);
    try {
      const url = weekStart
        ? `/api/leaderboard?weekStart=${weekStart}`
        : '/api/leaderboard';
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setSelectedWeek(d.selectedWeek);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!data?.availableWeeks || !selectedWeek) return;
    const idx = data.availableWeeks.indexOf(selectedWeek);
    const newIdx = direction === 'prev' ? idx + 1 : idx - 1;
    if (newIdx >= 0 && newIdx < data.availableWeeks.length) {
      const newWeek = data.availableWeeks[newIdx];
      setSelectedWeek(newWeek);
      fetchLeaderboard(newWeek);
    }
  };

  if (loading) {
    return (
      <div className='text-center py-20 text-muted-foreground'>Loading...</div>
    );
  }

  if (!data) {
    return (
      <div className='text-center py-20 text-muted-foreground'>
        Failed to load leaderboard.
      </div>
    );
  }

  const { entries, availableWeeks } = data;
  const currentIdx = selectedWeek ? availableWeeks.indexOf(selectedWeek) : -1;
  const canGoPrev = currentIdx < availableWeeks.length - 1;
  const canGoNext = currentIdx > 0;

  return (
    <div className='space-y-4'>
      {/* Week navigation */}
      <div className='flex items-center justify-between'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateWeek('prev')}
          disabled={!canGoPrev}
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          Previous
        </Button>

        <div className='text-center'>
          {selectedWeek ? (
            <>
              <p className='font-semibold text-sm sm:text-base'>
                {format(parseLocalDate(selectedWeek), 'MMM d')}
                {data.entries[0]?.weekEnd
                  ? ` – ${format(parseLocalDate(data.entries[0].weekEnd), 'MMM d, yyyy')}`
                  : ''}
              </p>
              <p className='text-xs text-muted-foreground'>
                Week {availableWeeks.length - currentIdx} of {availableWeeks.length}
              </p>
            </>
          ) : (
            <p className='text-sm text-muted-foreground'>No weeks available</p>
          )}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateWeek('next')}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight className='h-4 w-4 ml-1' />
        </Button>
      </div>

      {/* Top 3 cards */}
      {entries.length >= 1 && (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2'>
          {entries.slice(0, 3).map((entry, i) => {
            const rank = i + 1;
            const isCurrentUser = entry.user.id === currentUserId;
            return (
              <Card
                key={entry.id}
                className={`border-2 ${rowHighlight[rank] ?? ''}`}
              >
                <CardContent className='p-4 text-center'>
                  <div className='flex items-center justify-center gap-1 mb-1'>
                    <Trophy className={`h-5 w-5 ${medalColors[rank]}`} />
                    <span className={`font-bold text-lg ${medalColors[rank]}`}>
                      #{rank}
                    </span>
                  </div>
                  <p className='font-semibold text-sm truncate'>
                    {entry.user.name}
                    {isCurrentUser && (
                      <span className='ml-1 text-xs text-muted-foreground'>(you)</span>
                    )}
                  </p>
                  <p className='text-2xl font-bold mt-1'>
                    {entry.overallAverage.toFixed(1)}%
                  </p>
                  <div className='flex justify-center gap-3 mt-2 text-xs text-muted-foreground'>
                    <span className='text-purple-600 dark:text-purple-400'>
                      Soul {entry.totalSoulScore.toFixed(1)}%
                    </span>
                    <span className='text-blue-600 dark:text-blue-400'>
                      Body {entry.totalBodyScore.toFixed(1)}%
                    </span>
                  </div>
                  <Link href={`/analysis/${entry.user.id}`}>
                    <Button variant='ghost' size='sm' className='mt-2 h-7 text-xs gap-1'>
                      <BarChart2 className='h-3 w-3' />
                      Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full rankings table */}
      {entries.length === 0 ? (
        <div className='text-center py-16 text-muted-foreground'>
          No scores recorded for this week.
        </div>
      ) : (
        <Card>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className='text-right'>Soul</TableHead>
                  <TableHead className='text-right'>Body</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead className='text-right hidden sm:table-cell'>Days</TableHead>
                  <TableHead className='w-10'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, i) => {
                  const rank = i + 1;
                  const isCurrentUser = entry.user.id === currentUserId;
                  return (
                    <TableRow
                      key={entry.id}
                      className={
                        isCurrentUser
                          ? 'bg-primary/5 font-medium'
                          : rank <= 3
                          ? rowHighlight[rank]
                          : ''
                      }
                    >
                      <TableCell className='font-bold'>
                        <span className={medalColors[rank] ?? 'text-muted-foreground'}>
                          {rank <= 3 ? `#${rank}` : rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='font-medium'>{entry.user.name}</span>
                        {isCurrentUser && (
                          <span className='ml-1 text-xs text-muted-foreground'>(you)</span>
                        )}
                      </TableCell>
                      <TableCell className='text-right text-purple-600 dark:text-purple-400 font-semibold text-sm'>
                        {entry.totalSoulScore.toFixed(1)}%
                      </TableCell>
                      <TableCell className='text-right text-blue-600 dark:text-blue-400 font-semibold text-sm'>
                        {entry.totalBodyScore.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <ScoreBar value={entry.overallAverage} />
                      </TableCell>
                      <TableCell className='text-right text-muted-foreground text-sm hidden sm:table-cell'>
                        {entry.daysRecorded}/7
                      </TableCell>
                      <TableCell>
                        <Link href={`/analysis/${entry.user.id}`}>
                          <Button variant='ghost' size='icon' className='h-7 w-7'>
                            <BarChart2 className='h-3.5 w-3.5' />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
