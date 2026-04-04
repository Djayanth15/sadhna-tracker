'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check, X, Users } from 'lucide-react';
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isSameWeek,
} from 'date-fns';

interface DailyScoreSummary {
  id: string;
  date: string;
  dailySoulScore: number;
  dailyBodyScore: number;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  dailyScores: DailyScoreSummary[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const parseLocalDate = (isoString: string) => {
  const datePart = isoString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function ParticipantsClient() {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/participants?weekStart=${weekStartStr}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
      }
    } catch (e) {
      console.error('Failed to fetch participants', e);
    } finally {
      setLoading(false);
    }
  }, [weekStartStr]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const getScoreForDay = (participant: Participant, day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return participant.dailyScores.find((s) => s.date.split('T')[0] === dayStr);
  };

  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });

  const totalFilled = (participant: Participant) =>
    weekDays.filter((d) => getScoreForDay(participant, d)).length;

  return (
    <div className='space-y-6'>
      {/* Week Navigation */}
      <Card>
        <CardHeader className='p-4'>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <div>
              <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Weekly Attendance
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                {format(weekStart, 'MMM d')} –{' '}
                {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setWeekStart((w) => subWeeks(w, 1))}
              >
                <ChevronLeft className='h-4 w-4' />
                <span className='hidden sm:inline ml-1'>Prev</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
                }
                disabled={isCurrentWeek}
              >
                This Week
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setWeekStart((w) => addWeeks(w, 1))}
                disabled={isCurrentWeek}
              >
                <span className='hidden sm:inline mr-1'>Next</span>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Attendance Grid */}
      <Card>
        <CardContent className='p-0 sm:p-4 overflow-x-auto'>
          {loading ? (
            <p className='text-center py-12 text-muted-foreground'>Loading...</p>
          ) : participants.length === 0 ? (
            <p className='text-center py-12 text-muted-foreground'>
              No participants found. Mark users as participants (bys=true) from
              the database.
            </p>
          ) : (
            <table className='w-full min-w-[600px] text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left py-3 px-4 font-medium text-muted-foreground w-40'>
                    Participant
                  </th>
                  {weekDays.map((day, i) => (
                    <th
                      key={i}
                      className='text-center py-3 px-2 font-medium text-muted-foreground'
                    >
                      <div>{DAYS[i]}</div>
                      <div className='text-xs font-normal'>
                        {format(day, 'MMM d')}
                      </div>
                    </th>
                  ))}
                  <th className='text-center py-3 px-3 font-medium text-muted-foreground'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr
                    key={p.id}
                    className='border-b last:border-0 hover:bg-muted/40 cursor-pointer transition-colors'
                    onClick={() => router.push(`/admin/participants/${p.id}`)}
                  >
                    <td className='py-3 px-4'>
                      <div className='font-medium truncate max-w-[140px]'>
                        {p.name}
                      </div>
                      <div className='text-xs text-muted-foreground truncate max-w-[140px]'>
                        {p.email}
                      </div>
                    </td>
                    {weekDays.map((day, i) => {
                      const score = getScoreForDay(p, day);
                      const isFuture = day > new Date();
                      return (
                        <td key={i} className='text-center py-3 px-2'>
                          {isFuture ? (
                            <span className='text-muted-foreground/40 text-lg'>–</span>
                          ) : score ? (
                            <span
                              className='inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40'
                              title={`Soul: ${score.dailySoulScore.toFixed(1)}, Body: ${score.dailyBodyScore.toFixed(1)}`}
                            >
                              <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                            </span>
                          ) : (
                            <span className='inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40'>
                              <X className='h-4 w-4 text-red-500 dark:text-red-400' />
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className='text-center py-3 px-3 font-semibold'>
                      <span
                        className={
                          totalFilled(p) === 7
                            ? 'text-green-600 dark:text-green-400'
                            : totalFilled(p) >= 5
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-500 dark:text-red-400'
                        }
                      >
                        {totalFilled(p)}/7
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
