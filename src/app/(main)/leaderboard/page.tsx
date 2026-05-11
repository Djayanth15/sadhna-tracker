import { getServerSession } from '@/lib/get-session';
import { unauthorized } from 'next/navigation';
import type { Metadata } from 'next';
import { LeaderboardClient } from './leaderboard-client';

export const metadata: Metadata = {
  title: 'Leaderboard',
};

export default async function LeaderboardPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  return (
    <main className='mx-auto w-full max-w-4xl px-4 py-8'>
      <div className='space-y-2 mb-6'>
        <h1 className='text-2xl font-semibold'>Leaderboard</h1>
        <p className='text-muted-foreground text-sm'>
          Weekly rankings for all participants. Switch weeks to see previous scores.
        </p>
      </div>
      <LeaderboardClient currentUserId={user.id} />
    </main>
  );
}
