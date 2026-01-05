import { getServerSession } from '@/lib/get-session';
import { unauthorized } from 'next/navigation';
import type { Metadata } from 'next';
import { TrackerClientNew } from './tracker-client-new';

export const metadata: Metadata = {
  title: 'Body & Soul Tracker',
};

export default async function TrackerPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  return (
    <main className='mx-auto w-full max-w-7xl px-4 py-12'>
      <TrackerClientNew user={user} />
    </main>
  );
}
