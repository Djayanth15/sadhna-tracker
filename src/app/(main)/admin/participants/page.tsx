import { getServerSession } from '@/lib/get-session';
import { forbidden, unauthorized } from 'next/navigation';
import type { Metadata } from 'next';
import { ParticipantsClient } from './participants-client';

export const metadata: Metadata = {
  title: 'Participants – Admin',
};

export default async function ParticipantsPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();
  if (user.role !== 'admin') forbidden();

  return (
    <main className='mx-auto w-full max-w-6xl px-4 py-8'>
      <div className='space-y-2 mb-6'>
        <h1 className='text-2xl font-semibold'>Participants</h1>
        <p className='text-muted-foreground text-sm'>
          Week-wise daily entry tracking for all participants.
        </p>
      </div>
      <ParticipantsClient />
    </main>
  );
}
