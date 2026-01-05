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
