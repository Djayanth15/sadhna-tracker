import { getServerSession } from '@/lib/get-session';
import { unauthorized } from 'next/navigation';
import type { Metadata } from 'next';
import { LeaderboardClient } from './leaderboard-client';

export const metadata: Metadata = {
  title: 'Leaderboard – Sadhna Tracker',
};

export default async function LeaderboardPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  return (
    <main className='mx-auto w-full max-w-5xl px-4 py-8'>
      <LeaderboardClient currentUserId={user.id} />
    </main>
  );
}
