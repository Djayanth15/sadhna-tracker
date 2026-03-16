'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoalsFormProps {
  onComplete: () => void;
  existingGoals?: {
    maxHoursLectures: number;
    maxHoursReading: number;
    maxHoursStudyWork: number;
    wakeTime20Points?: string | null;
    wakeTime10Points?: string | null;
    sleepTime20Points?: string | null;
    sleepTime10Points?: string | null;
  } | null;
}

export function GoalsForm({ onComplete, existingGoals }: GoalsFormProps) {
  const [lectureHours, setLectureHours] = useState(
    existingGoals?.maxHoursLectures?.toString() || ''
  );
  const [readingHours, setReadingHours] = useState(
    existingGoals?.maxHoursReading?.toString() || ''
  );
  const [studyWorkHours, setStudyWorkHours] = useState(
    existingGoals?.maxHoursStudyWork?.toString() || ''
  );
  const [loading, setLoading] = useState(false);

  const [wakeTime20Points, setWakeTime20Points] = useState(
    existingGoals?.wakeTime20Points || '03:45'
  );
  const [wakeTime10Points, setWakeTime10Points] = useState(
    existingGoals?.wakeTime10Points || '04:15'
  );

  // Sleep time goals
  const [sleepTime20Points, setSleepTime20Points] = useState(
    existingGoals?.sleepTime20Points || '21:15'
  );
  const [sleepTime10Points, setSleepTime10Points] = useState(
    existingGoals?.sleepTime10Points || '22:00'
  );

  const handleSubmit = async () => {
    const lectures = parseFloat(lectureHours);
    const reading = parseFloat(readingHours);
    const studyWork = parseFloat(studyWorkHours);

    if (lectures > 0 && reading > 0 && studyWork > 0) {
      setLoading(true);
      try {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            maxHoursLectures: lectures,
            maxHoursReading: reading,
            maxHoursStudyWork: studyWork,
            wakeTime20Points,
            wakeTime10Points,
            sleepTime20Points,
            sleepTime10Points,
          }),
        });

        if (response.ok) {
          onComplete();
        }
      } catch (error) {
        console.error('Failed to save goals:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>Set Your Weekly Goals</CardTitle>
        <CardDescription>
          Configure your weekly targets for lectures, reading, and study/work
          hours. These will be used to calculate your weekly scores.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='lectures'>Maximum Hours of Lectures per Week</Label>
          <Input
            id='lectures'
            type='number'
            step='0.5'
            min='0'
            value={lectureHours}
            onChange={(e) => setLectureHours(e.target.value)}
            placeholder='e.g., 10'
          />
          <p className='text-sm text-muted-foreground'>
            How many hours per week do you plan to listen to lectures?
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='reading'>
            Maximum Hours of Book Reading per Week
          </Label>
          <Input
            id='reading'
            type='number'
            step='0.5'
            min='0'
            value={readingHours}
            onChange={(e) => setReadingHours(e.target.value)}
            placeholder='e.g., 7'
          />
          <p className='text-sm text-muted-foreground'>
            How many hours per week do you plan to read books?
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='studywork'>
            Maximum Hours of Study/Work per Week
          </Label>
          <Input
            id='studywork'
            type='number'
            step='0.5'
            min='0'
            value={studyWorkHours}
            onChange={(e) => setStudyWorkHours(e.target.value)}
            placeholder='e.g., 40'
          />
          <p className='text-sm text-muted-foreground'>
            How many hours per week do you plan to study or work?
          </p>
        </div>

        {/* Wake Time Goals Section */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-semibold mb-4'>Wake Up Time Goals</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='wakeTime20'>Wake by (20 points)</Label>
              <Input
                id='wakeTime20'
                type='time'
                value={wakeTime20Points}
                onChange={(e) => setWakeTime20Points(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                Full 20 points if you wake by this time
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='wakeTime10'>Wake by (10 points)</Label>
              <Input
                id='wakeTime10'
                type='time'
                value={wakeTime10Points}
                onChange={(e) => setWakeTime10Points(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                10 points if you wake by this time, 0 after
              </p>
            </div>
          </div>
        </div>

        {/* Sleep Time Goals Section */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-semibold mb-4'>Sleep Time Goals</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='sleepTime20'>Sleep by (20 points)</Label>
              <Input
                id='sleepTime20'
                type='time'
                value={sleepTime20Points}
                onChange={(e) => setSleepTime20Points(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                Full 20 points if you sleep by this time
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='sleepTime10'>Sleep by (10 points)</Label>
              <Input
                id='sleepTime10'
                type='time'
                value={sleepTime10Points}
                onChange={(e) => setSleepTime10Points(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                10 points if you sleep by this time, 0 after
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={
            loading || !lectureHours || !readingHours || !studyWorkHours
          }
          className='w-full'
        >
          {loading ? 'Saving...' : existingGoals ? 'Update Goals' : 'Set Goals'}
        </Button>

        {existingGoals && (
          <p className='text-sm text-center text-muted-foreground'>
            You can update your goals anytime. Changes will apply to future
            weeks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
