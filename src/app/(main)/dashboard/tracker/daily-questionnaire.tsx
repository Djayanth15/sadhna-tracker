// 'use client';

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { format, parseISO } from 'date-fns';
// import { getUserTimezone, getCurrentDateInTimezone } from '@/lib/timezone';

// interface DailyQuestionnaireProps {
//   selectedDate: string;
//   onSubmit: () => void;
// }

// interface ExistingDailyEntry {
//   id: string;
//   userId: string;
//   date: string;
//   mpAttendanceTime: string | null;
//   mpAttendanceScore: number;
//   japaCompletionTime: string | null;
//   japaCompletionScore: number;
//   lectureMinutes: number;
//   readingMinutes: number;
//   sleepTime: string | null;
//   sleepScore: number;
//   wakeTime: string | null;
//   wakeScore: number;
//   studyWorkMinutes: number;
//   restMinutes: number;
//   restScore: number;
//   filledSameDay: boolean;
//   sameDayScore: number;
//   dailySoulScore: number;
//   dailyBodyScore: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export function DailyQuestionnaire({
//   selectedDate,
//   onSubmit,
// }: DailyQuestionnaireProps) {
//   // Soul questions
//   const [mpTime, setMpTime] = useState('');
//   const [japaTime, setJapaTime] = useState('');
//   const [lectureHours, setLectureHours] = useState('');
//   const [lectureMinutes, setLectureMinutes] = useState('');
//   const [readingHours, setReadingHours] = useState('');
//   const [readingMinutes, setReadingMinutes] = useState('');

//   // Body questions
//   const [sleepTime, setSleepTime] = useState('');
//   const [wakeTime, setWakeTime] = useState('');
//   const [studyWorkHours, setStudyWorkHours] = useState('');
//   const [studyWorkMinutes, setStudyWorkMinutes] = useState('');
//   const [restMinutes, setRestMinutes] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [existingEntry, setExistingEntry] = useState<ExistingDailyEntry | null>(
//     null
//   );
//   const [userTimezone, setUserTimezone] = useState<string>('');

//   // Check if filling on the same day (using user's timezone)
//   const isFillingToday =
//     selectedDate === getCurrentDateInTimezone(userTimezone);

//   useEffect(() => {
//     const tz = getUserTimezone();
//     setUserTimezone(tz);
//   }, []);

//   // Fetch existing entry whenever date or timezone changes
//   useEffect(() => {
//     if (userTimezone) {
//       fetchExistingEntry();
//     }
//   }, [selectedDate, userTimezone]);

//   const clearForm = () => {
//     setMpTime('');
//     setJapaTime('');
//     setLectureHours('');
//     setLectureMinutes('');
//     setReadingHours('');
//     setReadingMinutes('');
//     setSleepTime('');
//     setWakeTime('');
//     setStudyWorkHours('');
//     setStudyWorkMinutes('');
//     setRestMinutes('');
//   };

//   const fetchExistingEntry = async () => {
//     try {
//       const response = await fetch(
//         `/api/scores/daily?date=${selectedDate}&timezone=${userTimezone}`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         if (data) {
//           setExistingEntry(data);
//           // Pre-fill form with existing data
//           if (data.mpAttendanceTime) {
//             const date = new Date(data.mpAttendanceTime);
//             setMpTime(
//               date.toLocaleTimeString('en-US', {
//                 hour12: false,
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 timeZone: userTimezone,
//               })
//             );
//           } else {
//             setMpTime('');
//           }

//           if (data.japaCompletionTime) {
//             const date = new Date(data.japaCompletionTime);
//             setJapaTime(
//               date.toLocaleTimeString('en-US', {
//                 hour12: false,
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 timeZone: userTimezone,
//               })
//             );
//           } else {
//             setJapaTime('');
//           }

//           setLectureHours(Math.floor(data.lectureMinutes / 60).toString());
//           setLectureMinutes((data.lectureMinutes % 60).toString());
//           setReadingHours(Math.floor(data.readingMinutes / 60).toString());
//           setReadingMinutes((data.readingMinutes % 60).toString());

//           if (data.sleepTime) {
//             const date = new Date(data.sleepTime);
//             setSleepTime(
//               date.toLocaleTimeString('en-US', {
//                 hour12: false,
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 timeZone: userTimezone,
//               })
//             );
//           } else {
//             setSleepTime('');
//           }

//           if (data.wakeTime) {
//             const date = new Date(data.wakeTime);
//             setWakeTime(
//               date.toLocaleTimeString('en-US', {
//                 hour12: false,
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 timeZone: userTimezone,
//               })
//             );
//           } else {
//             setWakeTime('');
//           }

//           setStudyWorkHours(Math.floor(data.studyWorkMinutes / 60).toString());
//           setStudyWorkMinutes((data.studyWorkMinutes % 60).toString());
//           setRestMinutes(data.restMinutes.toString());
//         } else {
//           // No existing entry for this date, clear the form
//           setExistingEntry(null);
//           clearForm();
//         }
//       } else {
//         // No existing entry for this date, clear the form
//         setExistingEntry(null);
//         clearForm();
//       }
//     } catch (error) {
//       console.error('Failed to fetch existing entry:', error);
//       // Clear form on error
//       setExistingEntry(null);
//       clearForm();
//     }
//   };

//   const calculateScores = () => {
//     // MP Attendance Score
//     let mpScore = 0;
//     if (mpTime) {
//       const [hours, minutes] = mpTime.split(':').map(Number);
//       const totalMinutes = hours * 60 + minutes;
//       const target = 4 * 60 + 30; // 4:30 AM
//       const limit = 4 * 60 + 35; // 4:35 AM

//       if (totalMinutes <= target) {
//         mpScore = 20;
//       } else if (totalMinutes <= limit) {
//         mpScore = 5;
//       } else {
//         mpScore = 0;
//       }
//     }

//     // Japa Completion Score
//     let japaScore = 0;
//     if (japaTime) {
//       const [hours, minutes] = japaTime.split(':').map(Number);
//       const totalMinutes = hours * 60 + minutes;
//       const target1 = 9 * 60; // 9:00 AM
//       const target2 = 12 * 60; // 12:00 PM

//       if (totalMinutes <= target1) {
//         japaScore = 20;
//       } else if (totalMinutes <= target2) {
//         japaScore = 10;
//       } else {
//         japaScore = 0;
//       }
//     }

//     // Sleep Score
//     let sleepScore = 0;
//     if (sleepTime) {
//       const [hours, minutes] = sleepTime.split(':').map(Number);
//       const totalMinutes = hours * 60 + minutes;
//       const target1 = 21 * 60 + 15; // 9:15 PM
//       const target2 = 22 * 60; // 10:00 PM

//       if (totalMinutes <= target1) {
//         sleepScore = 20;
//       } else if (totalMinutes <= target2) {
//         sleepScore = 10;
//       } else {
//         sleepScore = 0;
//       }
//     }

//     // Wake Score
//     let wakeScore = 0;
//     if (wakeTime) {
//       const [hours, minutes] = wakeTime.split(':').map(Number);
//       const totalMinutes = hours * 60 + minutes;
//       const target1 = 3 * 60 + 40; // 3:40 AM
//       const target2 = 4 * 60 + 15; // 4:15 AM

//       if (totalMinutes <= target1) {
//         wakeScore = 20;
//       } else if (totalMinutes <= target2) {
//         wakeScore = 10;
//       } else {
//         wakeScore = 0;
//       }
//     }

//     // Rest Score
//     let restScore = 0;
//     const rest = parseFloat(restMinutes) || 0;
//     if (rest < 30) {
//       restScore = 20;
//     } else if (rest < 60) {
//       restScore = 10;
//     } else {
//       restScore = 0;
//     }

//     // Same Day Score
//     const sameDayScore = isFillingToday ? 5 : 0;

//     return {
//       mpScore,
//       japaScore,
//       sleepScore,
//       wakeScore,
//       restScore,
//       sameDayScore,
//     };
//   };

//   const handleSubmit = async () => {
//     setLoading(true);
//     try {
//       const lectureTotal =
//         (parseFloat(lectureHours) || 0) * 60 +
//         (parseFloat(lectureMinutes) || 0);
//       const readingTotal =
//         (parseFloat(readingHours) || 0) * 60 +
//         (parseFloat(readingMinutes) || 0);
//       const studyWorkTotal =
//         (parseFloat(studyWorkHours) || 0) * 60 +
//         (parseFloat(studyWorkMinutes) || 0);
//       const restTotal = parseFloat(restMinutes) || 0;

//       const scores = calculateScores();

//       // Create proper datetime strings in user's timezone
//       const createDateTime = (timeStr: string) => {
//         if (!timeStr) return null;
//         // Create a date object representing the exact moment in user's timezone
//         const dateTimeStr = `${selectedDate}T${timeStr}:00`;
//         const date = new Date(dateTimeStr);
//         return date.toISOString();
//       };

//       const payload = {
//         date: selectedDate,
//         timezone: userTimezone,
//         mpAttendanceTime: createDateTime(mpTime),
//         mpAttendanceScore: scores.mpScore,
//         japaCompletionTime: createDateTime(japaTime),
//         japaCompletionScore: scores.japaScore,
//         lectureMinutes: lectureTotal,
//         readingMinutes: readingTotal,
//         sleepTime: createDateTime(sleepTime),
//         sleepScore: scores.sleepScore,
//         wakeTime: createDateTime(wakeTime),
//         wakeScore: scores.wakeScore,
//         studyWorkMinutes: studyWorkTotal,
//         restMinutes: restTotal,
//         restScore: scores.restScore,
//         filledSameDay: isFillingToday,
//         sameDayScore: scores.sameDayScore,
//         dailySoulScore: scores.mpScore + scores.japaScore,
//         dailyBodyScore:
//           scores.sleepScore +
//           scores.wakeScore +
//           scores.restScore +
//           scores.sameDayScore,
//       };

//       const response = await fetch('/api/scores/daily', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         onSubmit();
//         // Refresh the entry to show updated data
//         await fetchExistingEntry();
//       }
//     } catch (error) {
//       console.error('Failed to save daily score:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const scores = calculateScores();
//   const dailySoulScore = scores.mpScore + scores.japaScore;
//   const dailyBodyScore =
//     scores.sleepScore +
//     scores.wakeScore +
//     scores.restScore +
//     scores.sameDayScore;

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>
//           Daily Questionnaire -{' '}
//           {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
//           {userTimezone && (
//             <span className='text-sm font-normal text-muted-foreground ml-2'>
//               ({userTimezone})
//             </span>
//           )}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className='space-y-8'>
//         {/* Soul Questions */}
//         <div className='space-y-4'>
//           <h3 className='text-lg font-semibold text-primary'>Soul Questions</h3>

//           <div className='space-y-2'>
//             <Label htmlFor='mpTime'>When did you attend MP?</Label>
//             <Input
//               id='mpTime'
//               type='time'
//               value={mpTime}
//               onChange={(e) => setMpTime(e.target.value)}
//             />
//             <p className='text-sm text-muted-foreground'>
//               Score: {scores.mpScore} points
//               {mpTime && (
//                 <span className='ml-2'>
//                   (By 4:30 AM = 20pts, 4:30-4:35 AM = 5pts, After 4:35 AM =
//                   0pts)
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className='space-y-2'>
//             <Label htmlFor='japaTime'>When did you complete your Japa?</Label>
//             <Input
//               id='japaTime'
//               type='time'
//               value={japaTime}
//               onChange={(e) => setJapaTime(e.target.value)}
//             />
//             <p className='text-sm text-muted-foreground'>
//               Score: {scores.japaScore} points
//               {japaTime && (
//                 <span className='ml-2'>
//                   (By 9:00 AM = 20pts, By 12:00 PM = 10pts, After 12:00 PM =
//                   0pts)
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className='space-y-2'>
//             <Label>Hours of Lecture Listening Today</Label>
//             <div className='flex gap-2'>
//               <div className='flex-1'>
//                 <Input
//                   type='number'
//                   min='0'
//                   placeholder='Hours'
//                   value={lectureHours}
//                   onChange={(e) => setLectureHours(e.target.value)}
//                 />
//               </div>
//               <div className='flex-1'>
//                 <Input
//                   type='number'
//                   min='0'
//                   max='59'
//                   placeholder='Minutes'
//                   value={lectureMinutes}
//                   onChange={(e) => setLectureMinutes(e.target.value)}
//                 />
//               </div>
//             </div>
//             <p className='text-sm text-muted-foreground'>
//               Total:{' '}
//               {(parseFloat(lectureHours) || 0) * 60 +
//                 (parseFloat(lectureMinutes) || 0)}{' '}
//               minutes
//             </p>
//           </div>

//           <div className='space-y-2'>
//             <Label>Hours of Book Reading Today</Label>
//             <div className='flex gap-2'>
//               <div className='flex-1'>
//                 <Input
//                   type='number'
//                   min='0'
//                   placeholder='Hours'
//                   value={readingHours}
//                   onChange={(e) => setReadingHours(e.target.value)}
//                 />
//               </div>
//               <div className='flex-1'>
//                 <Input
//                   type='number'
//                   min='0'
//                   max='59'
//                   placeholder='Minutes'
//                   value={readingMinutes}
//                   onChange={(e) => setReadingMinutes(e.target.value)}
//                 />
//               </div>
//             </div>
//             <p className='text-sm text-muted-foreground'>
//               Total:{' '}
//               {(parseFloat(readingHours) || 0) * 60 +
//                 (parseFloat(readingMinutes) || 0)}{' '}
//               minutes
//             </p>
//           </div>

//           <div className='p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg'>
//             <p className='font-semibold text-purple-800 dark:text-purple-200'>
//               Daily Soul Score: {dailySoulScore} / 40 points
//             </p>
//           </div>
//         </div>

//         {/* Body Questions */}
//         <div className='space-y-4'>
//           <h3 className='text-lg font-semibold text-primary'>Body Questions</h3>

//           <div className='space-y-2'>
//             <Label htmlFor='sleepTime'>When did you go to sleep?</Label>
//             <Input
//               id='sleepTime'
//               type='time'
//               value={sleepTime}
//               onChange={(e) => setSleepTime(e.target.value)}
//             />
//             <p className='text-sm text-muted-foreground'>
//               Score: {scores.sleepScore} points
//               {sleepTime && (
//                 <span className='ml-2'>
//                   (By 9:15 PM = 20pts, By 10:00 PM = 10pts, After 10:00 PM =
//                   0pts)
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className='space-y-2'>
//             <Label htmlFor='wakeTime'>When did you wake up?</Label>
//             <Input
//               id='wakeTime'
//               type='time'
//               value={wakeTime}
//               onChange={(e) => setWakeTime(e.target.value)}
//             />
//             <p className='text-sm text-muted-foreground'>
//               Score: {scores.wakeScore} points
//               {wakeTime && (
//                 <span className='ml-2'>
//                   (By 3:40 AM = 20pts, By 4:15 AM = 10pts, After 4:15 AM = 0pts)
//                 </span>
//               )}
//             </p>
//           </div>

//           <div className='space-y-2'>
//             <Label>Hours of Study/Work Today</Label>
//             <div className='flex gap-2'>
//               <div className='flex-1'>
//                 <Input
//                   type='number'
//                   min='0'
//                   placeholder='Hours'
//                   value={studyWorkHours}
//                   onChange={(e) => setStudyWorkHours(e.target.value)}
//                 />
//               </div>
//               <div className='flex-1'>
//                 <Input
//                   type='number'
//                   min='0'
//                   max='59'
//                   placeholder='Minutes'
//                   value={studyWorkMinutes}
//                   onChange={(e) => setStudyWorkMinutes(e.target.value)}
//                 />
//               </div>
//             </div>
//             <p className='text-sm text-muted-foreground'>
//               Total:{' '}
//               {(parseFloat(studyWorkHours) || 0) * 60 +
//                 (parseFloat(studyWorkMinutes) || 0)}{' '}
//               minutes
//             </p>
//           </div>

//           <div className='space-y-2'>
//             <Label htmlFor='restMinutes'>Minutes of Rest During Day</Label>
//             <Input
//               id='restMinutes'
//               type='number'
//               min='0'
//               value={restMinutes}
//               onChange={(e) => setRestMinutes(e.target.value)}
//               placeholder='e.g., 30'
//             />
//             <p className='text-sm text-muted-foreground'>
//               Score: {scores.restScore} points
//               {restMinutes && (
//                 <span className='ml-2'>
//                   (&lt; 30 mins = 20pts, &lt; 60 mins = 10pts, &gt; 60 mins =
//                   0pts)
//                 </span>
//               )}
//             </p>
//           </div>

//           {isFillingToday && (
//             <div className='p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg'>
//               <p className='text-sm text-green-800 dark:text-green-200'>
//                 ✓ Filling on the same day: +5 points
//               </p>
//             </div>
//           )}

//           <div className='p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg'>
//             <p className='font-semibold text-blue-800 dark:text-blue-200'>
//               Daily Body Score: {dailyBodyScore} / {isFillingToday ? 65 : 60}{' '}
//               points
//             </p>
//           </div>
//         </div>

//         <Button onClick={handleSubmit} disabled={loading} className='w-full'>
//           {loading
//             ? 'Saving...'
//             : existingEntry
//             ? 'Update Entry'
//             : 'Save Entry'}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO } from 'date-fns';
import { getUserTimezone, getCurrentDateInTimezone } from '@/lib/timezone';

interface DailyQuestionnaireProps {
  selectedDate: string;
  onSubmit: () => void;
}

interface ExistingDailyEntry {
  id: string;
  userId: string;
  date: string;
  mpAttendanceTime: string | null;
  mpAttendanceScore: number;
  japaCompletionTime: string | null;
  japaCompletionScore: number;
  lectureMinutes: number;
  readingMinutes: number;
  sleepTime: string | null;
  sleepScore: number;
  wakeTime: string | null;
  wakeScore: number;
  studyWorkMinutes: number;
  restMinutes: number;
  restScore: number;
  filledSameDay: boolean;
  sameDayScore: number;
  dailySoulScore: number;
  dailyBodyScore: number;
  createdAt: string;
  updatedAt: string;
}

export function DailyQuestionnaire({
  selectedDate,
  onSubmit,
}: DailyQuestionnaireProps) {
  // Soul questions
  const [mpTime, setMpTime] = useState('');
  const [japaTime, setJapaTime] = useState('');
  const [lectureHours, setLectureHours] = useState('');
  const [lectureMinutes, setLectureMinutes] = useState('');
  const [readingHours, setReadingHours] = useState('');
  const [readingMinutes, setReadingMinutes] = useState('');

  // Body questions
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [studyWorkHours, setStudyWorkHours] = useState('');
  const [studyWorkMinutes, setStudyWorkMinutes] = useState('');
  const [restMinutes, setRestMinutes] = useState('');

  // Manual same-day completion checkbox
  const [completedSameDay, setCompletedSameDay] = useState(false);

  const [loading, setLoading] = useState(false);
  const [existingEntry, setExistingEntry] = useState<ExistingDailyEntry | null>(
    null
  );
  const [userTimezone, setUserTimezone] = useState<string>('');

  useEffect(() => {
    const tz = getUserTimezone();
    setUserTimezone(tz);
  }, []);

  // Fetch existing entry whenever date or timezone changes
  useEffect(() => {
    if (userTimezone) {
      fetchExistingEntry();
    }
  }, [selectedDate, userTimezone]);

  const clearForm = () => {
    setMpTime('');
    setJapaTime('');
    setLectureHours('');
    setLectureMinutes('');
    setReadingHours('');
    setReadingMinutes('');
    setSleepTime('');
    setWakeTime('');
    setStudyWorkHours('');
    setStudyWorkMinutes('');
    setRestMinutes('');
    setCompletedSameDay(false);
  };

  const fetchExistingEntry = async () => {
    try {
      const response = await fetch(
        `/api/scores/daily?date=${selectedDate}&timezone=${userTimezone}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setExistingEntry(data);
          // Pre-fill form with existing data
          if (data.mpAttendanceTime) {
            const date = new Date(data.mpAttendanceTime);
            setMpTime(
              date.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                timeZone: userTimezone,
              })
            );
          } else {
            setMpTime('');
          }

          if (data.japaCompletionTime) {
            const date = new Date(data.japaCompletionTime);
            setJapaTime(
              date.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                timeZone: userTimezone,
              })
            );
          } else {
            setJapaTime('');
          }

          setLectureHours(Math.floor(data.lectureMinutes / 60).toString());
          setLectureMinutes((data.lectureMinutes % 60).toString());
          setReadingHours(Math.floor(data.readingMinutes / 60).toString());
          setReadingMinutes((data.readingMinutes % 60).toString());

          if (data.sleepTime) {
            const date = new Date(data.sleepTime);
            setSleepTime(
              date.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                timeZone: userTimezone,
              })
            );
          } else {
            setSleepTime('');
          }

          if (data.wakeTime) {
            const date = new Date(data.wakeTime);
            setWakeTime(
              date.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                timeZone: userTimezone,
              })
            );
          } else {
            setWakeTime('');
          }

          setStudyWorkHours(Math.floor(data.studyWorkMinutes / 60).toString());
          setStudyWorkMinutes((data.studyWorkMinutes % 60).toString());
          setRestMinutes(data.restMinutes.toString());

          // Load the filledSameDay status
          setCompletedSameDay(data.filledSameDay || false);
        } else {
          // No existing entry for this date, clear the form
          setExistingEntry(null);
          clearForm();
        }
      } else {
        // No existing entry for this date, clear the form
        setExistingEntry(null);
        clearForm();
      }
    } catch (error) {
      console.error('Failed to fetch existing entry:', error);
      // Clear form on error
      setExistingEntry(null);
      clearForm();
    }
  };

  const calculateScores = () => {
    // MP Attendance Score
    let mpScore = 0;
    if (mpTime) {
      const [hours, minutes] = mpTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const target = 4 * 60 + 30; // 4:30 AM
      const limit = 4 * 60 + 35; // 4:35 AM

      if (totalMinutes <= target) {
        mpScore = 20;
      } else if (totalMinutes <= limit) {
        mpScore = 5;
      } else {
        mpScore = 0;
      }
    }

    // Japa Completion Score
    let japaScore = 0;
    if (japaTime) {
      const [hours, minutes] = japaTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const target1 = 9 * 60; // 9:00 AM
      const target2 = 12 * 60; // 12:00 PM

      if (totalMinutes <= target1) {
        japaScore = 20;
      } else if (totalMinutes <= target2) {
        japaScore = 10;
      } else {
        japaScore = 0;
      }
    }

    // Sleep Score
    let sleepScore = 0;
    if (sleepTime) {
      const [hours, minutes] = sleepTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const target1 = 21 * 60 + 15; // 9:15 PM
      const target2 = 22 * 60; // 10:00 PM

      if (totalMinutes <= target1) {
        sleepScore = 20;
      } else if (totalMinutes <= target2) {
        sleepScore = 10;
      } else {
        sleepScore = 0;
      }
    }

    // Wake Score
    let wakeScore = 0;
    if (wakeTime) {
      const [hours, minutes] = wakeTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const target1 = 3 * 60 + 40; // 3:40 AM
      const target2 = 4 * 60 + 15; // 4:15 AM

      if (totalMinutes <= target1) {
        wakeScore = 20;
      } else if (totalMinutes <= target2) {
        wakeScore = 10;
      } else {
        wakeScore = 0;
      }
    }

    // Rest Score
    let restScore = 0;
    const rest = parseFloat(restMinutes) || 0;
    if (rest < 30) {
      restScore = 20;
    } else if (rest < 60) {
      restScore = 10;
    } else {
      restScore = 0;
    }

    // Same Day Score - now based on manual checkbox
    const sameDayScore = completedSameDay ? 5 : 0;

    return {
      mpScore,
      japaScore,
      sleepScore,
      wakeScore,
      restScore,
      sameDayScore,
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const lectureTotal =
        (parseFloat(lectureHours) || 0) * 60 +
        (parseFloat(lectureMinutes) || 0);
      const readingTotal =
        (parseFloat(readingHours) || 0) * 60 +
        (parseFloat(readingMinutes) || 0);
      const studyWorkTotal =
        (parseFloat(studyWorkHours) || 0) * 60 +
        (parseFloat(studyWorkMinutes) || 0);
      const restTotal = parseFloat(restMinutes) || 0;

      const scores = calculateScores();

      // Create proper datetime strings in user's timezone
      const createDateTime = (timeStr: string) => {
        if (!timeStr) return null;
        // Create a date object representing the exact moment in user's timezone
        const dateTimeStr = `${selectedDate}T${timeStr}:00`;
        const date = new Date(dateTimeStr);
        return date.toISOString();
      };

      const payload = {
        date: selectedDate,
        timezone: userTimezone,
        mpAttendanceTime: createDateTime(mpTime),
        mpAttendanceScore: scores.mpScore,
        japaCompletionTime: createDateTime(japaTime),
        japaCompletionScore: scores.japaScore,
        lectureMinutes: lectureTotal,
        readingMinutes: readingTotal,
        sleepTime: createDateTime(sleepTime),
        sleepScore: scores.sleepScore,
        wakeTime: createDateTime(wakeTime),
        wakeScore: scores.wakeScore,
        studyWorkMinutes: studyWorkTotal,
        restMinutes: restTotal,
        restScore: scores.restScore,
        filledSameDay: completedSameDay,
        sameDayScore: scores.sameDayScore,
        dailySoulScore: scores.mpScore + scores.japaScore,
        dailyBodyScore:
          scores.sleepScore +
          scores.wakeScore +
          scores.restScore +
          scores.sameDayScore,
      };

      const response = await fetch('/api/scores/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSubmit();
        // Refresh the entry to show updated data
        await fetchExistingEntry();
      }
    } catch (error) {
      console.error('Failed to save daily score:', error);
    } finally {
      setLoading(false);
    }
  };

  const scores = calculateScores();
  const dailySoulScore = scores.mpScore + scores.japaScore;
  const dailyBodyScore =
    scores.sleepScore +
    scores.wakeScore +
    scores.restScore +
    scores.sameDayScore;

  return (
    <Card className='mx-auto max-w-2xl'>
      <CardHeader className='p-4 sm:p-6'>
        <CardTitle className='text-base sm:text-lg md:text-xl'>
          <div className='flex flex-col gap-1'>
            <span className='text-sm sm:text-base md:text-lg'>
              Daily Questionnaire
            </span>
            <span className='text-xs sm:text-sm font-normal text-muted-foreground'>
              {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
            </span>
            {userTimezone && (
              <span className='text-xs font-normal text-muted-foreground'>
                ({userTimezone})
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4 sm:p-6 space-y-6 sm:space-y-8'>
        {/* Soul Questions */}
        <div className='space-y-3 sm:space-y-4'>
          <h3 className='text-base sm:text-lg font-semibold text-primary flex items-center gap-2'>
            <span className='text-lg sm:text-xl'>🙏</span>
            Soul Questions
          </h3>

          {/* MP Time */}
          <div className='space-y-2'>
            <Label htmlFor='mpTime' className='text-sm sm:text-base'>
              When did you attend MP?
            </Label>
            <Input
              id='mpTime'
              type='time'
              value={mpTime}
              onChange={(e) => setMpTime(e.target.value)}
              className='text-sm sm:text-base'
            />
            <div className='text-xs sm:text-sm text-muted-foreground'>
              <p className='font-medium'>Score: {scores.mpScore} points</p>
              {mpTime && (
                <p className='mt-0.5'>
                  By 4:30 AM = 20pts • 4:30-4:35 AM = 5pts • After 4:35 AM =
                  0pts
                </p>
              )}
            </div>
          </div>

          {/* Japa Time */}
          <div className='space-y-2'>
            <Label htmlFor='japaTime' className='text-sm sm:text-base'>
              When did you complete your Japa?
            </Label>
            <Input
              id='japaTime'
              type='time'
              value={japaTime}
              onChange={(e) => setJapaTime(e.target.value)}
              className='text-sm sm:text-base'
            />
            <div className='text-xs sm:text-sm text-muted-foreground'>
              <p className='font-medium'>Score: {scores.japaScore} points</p>
              {japaTime && (
                <p className='mt-0.5'>
                  By 9:00 AM = 20pts • By 12:00 PM = 10pts • After 12:00 PM =
                  0pts
                </p>
              )}
            </div>
          </div>

          {/* Lecture Hours */}
          <div className='space-y-2'>
            <Label className='text-sm sm:text-base'>
              Hours of Lecture Listening
            </Label>
            <div className='grid grid-cols-2 gap-2 sm:gap-3'>
              <div className='space-y-1'>
                <Input
                  type='number'
                  min='0'
                  placeholder='Hours'
                  value={lectureHours}
                  onChange={(e) => setLectureHours(e.target.value)}
                  className='text-sm sm:text-base'
                />
                <p className='text-xs text-muted-foreground'>Hours</p>
              </div>
              <div className='space-y-1'>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  placeholder='Minutes'
                  value={lectureMinutes}
                  onChange={(e) => setLectureMinutes(e.target.value)}
                  className='text-sm sm:text-base'
                />
                <p className='text-xs text-muted-foreground'>Minutes</p>
              </div>
            </div>
            <p className='text-xs sm:text-sm text-muted-foreground font-medium'>
              Total:{' '}
              {(parseFloat(lectureHours) || 0) * 60 +
                (parseFloat(lectureMinutes) || 0)}{' '}
              minutes
            </p>
          </div>

          {/* Reading Hours */}
          <div className='space-y-2'>
            <Label className='text-sm sm:text-base'>
              Hours of Book Reading
            </Label>
            <div className='grid grid-cols-2 gap-2 sm:gap-3'>
              <div className='space-y-1'>
                <Input
                  type='number'
                  min='0'
                  placeholder='Hours'
                  value={readingHours}
                  onChange={(e) => setReadingHours(e.target.value)}
                  className='text-sm sm:text-base'
                />
                <p className='text-xs text-muted-foreground'>Hours</p>
              </div>
              <div className='space-y-1'>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  placeholder='Minutes'
                  value={readingMinutes}
                  onChange={(e) => setReadingMinutes(e.target.value)}
                  className='text-sm sm:text-base'
                />
                <p className='text-xs text-muted-foreground'>Minutes</p>
              </div>
            </div>
            <p className='text-xs sm:text-sm text-muted-foreground font-medium'>
              Total:{' '}
              {(parseFloat(readingHours) || 0) * 60 +
                (parseFloat(readingMinutes) || 0)}{' '}
              minutes
            </p>
          </div>

          {/* Soul Score Summary */}
          <div className='p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg'>
            <p className='text-sm sm:text-base font-semibold text-purple-800 dark:text-purple-200'>
              Daily Soul Score: {dailySoulScore} / 40 points
            </p>
          </div>
        </div>

        {/* Body Questions */}
        <div className='space-y-3 sm:space-y-4'>
          <h3 className='text-base sm:text-lg font-semibold text-primary flex items-center gap-2'>
            <span className='text-lg sm:text-xl'>💪</span>
            Body Questions
          </h3>

          {/* Sleep Time */}
          <div className='space-y-2'>
            <Label htmlFor='sleepTime' className='text-sm sm:text-base'>
              When did you go to sleep?
            </Label>
            <Input
              id='sleepTime'
              type='time'
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className='text-sm sm:text-base'
            />
            <div className='text-xs sm:text-sm text-muted-foreground'>
              <p className='font-medium'>Score: {scores.sleepScore} points</p>
              {sleepTime && (
                <p className='mt-0.5'>
                  By 9:15 PM = 20pts • By 10:00 PM = 10pts • After 10:00 PM =
                  0pts
                </p>
              )}
            </div>
          </div>

          {/* Wake Time */}
          <div className='space-y-2'>
            <Label htmlFor='wakeTime' className='text-sm sm:text-base'>
              When did you wake up?
            </Label>
            <Input
              id='wakeTime'
              type='time'
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className='text-sm sm:text-base'
            />
            <div className='text-xs sm:text-sm text-muted-foreground'>
              <p className='font-medium'>Score: {scores.wakeScore} points</p>
              {wakeTime && (
                <p className='mt-0.5'>
                  By 3:40 AM = 20pts • By 4:15 AM = 10pts • After 4:15 AM = 0pts
                </p>
              )}
            </div>
          </div>

          {/* Study/Work Hours */}
          <div className='space-y-2'>
            <Label className='text-sm sm:text-base'>Hours of Study/Work</Label>
            <div className='grid grid-cols-2 gap-2 sm:gap-3'>
              <div className='space-y-1'>
                <Input
                  type='number'
                  min='0'
                  placeholder='Hours'
                  value={studyWorkHours}
                  onChange={(e) => setStudyWorkHours(e.target.value)}
                  className='text-sm sm:text-base'
                />
                <p className='text-xs text-muted-foreground'>Hours</p>
              </div>
              <div className='space-y-1'>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  placeholder='Minutes'
                  value={studyWorkMinutes}
                  onChange={(e) => setStudyWorkMinutes(e.target.value)}
                  className='text-sm sm:text-base'
                />
                <p className='text-xs text-muted-foreground'>Minutes</p>
              </div>
            </div>
            <p className='text-xs sm:text-sm text-muted-foreground font-medium'>
              Total:{' '}
              {(parseFloat(studyWorkHours) || 0) * 60 +
                (parseFloat(studyWorkMinutes) || 0)}{' '}
              minutes
            </p>
          </div>

          {/* Rest Minutes */}
          <div className='space-y-2'>
            <Label htmlFor='restMinutes' className='text-sm sm:text-base'>
              Minutes of Rest During Day
            </Label>
            <Input
              id='restMinutes'
              type='number'
              min='0'
              value={restMinutes}
              onChange={(e) => setRestMinutes(e.target.value)}
              placeholder='e.g., 30'
              className='text-sm sm:text-base'
            />
            <div className='text-xs sm:text-sm text-muted-foreground'>
              <p className='font-medium'>Score: {scores.restScore} points</p>
              {restMinutes && (
                <p className='mt-0.5'>
                  &lt; 30 mins = 20pts • &lt; 60 mins = 10pts • &gt; 60 mins =
                  0pts
                </p>
              )}
            </div>
          </div>

          {/* Same Day Completion Checkbox */}
          <div className='flex items-start space-x-3 p-3 sm:p-4 bg-muted/50 rounded-lg border'>
            <Checkbox
              id='sameDay'
              checked={completedSameDay}
              onCheckedChange={(checked) =>
                setCompletedSameDay(checked === true)
              }
              className='mt-0.5'
            />
            <div className='flex-1'>
              <Label
                htmlFor='sameDay'
                className='text-sm sm:text-base font-medium leading-none cursor-pointer'
              >
                I completed this entry on the same day
              </Label>
              <p className='text-xs sm:text-sm text-muted-foreground mt-1.5'>
                Check this box to earn 5 bonus points for filling out the form
                on the same day
              </p>
            </div>
          </div>

          {completedSameDay && (
            <div className='p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg'>
              <p className='text-xs sm:text-sm text-green-800 dark:text-green-200'>
                ✓ Same day completion: +5 points
              </p>
            </div>
          )}

          {/* Body Score Summary */}
          <div className='p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg'>
            <p className='text-sm sm:text-base font-semibold text-blue-800 dark:text-blue-200'>
              Daily Body Score: {dailyBodyScore} / 65 points
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className='w-full text-sm sm:text-base py-5 sm:py-6'
          size='lg'
        >
          {loading
            ? 'Saving...'
            : existingEntry
            ? 'Update Entry'
            : 'Save Entry'}
        </Button>
      </CardContent>
    </Card>
  );
}
