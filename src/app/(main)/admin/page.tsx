import { getServerSession } from '@/lib/get-session';
import type { Metadata } from 'next';
import { forbidden, unauthorized } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  if (user.role !== 'admin') forbidden();

  return (
    <main className='mx-auto w-full max-w-6xl px-4 py-12'>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold'>Admin</h1>
          <p className='text-muted-foreground'>Administrator dashboard.</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl'>
          <Link
            href='/admin/participants'
            className='block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors'
          >
            <p className='font-semibold'>Participants</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Week-wise attendance grid and weekly score analysis for all BYS
              participants.
            </p>
          </Link>
          <Link
            href='/dashboard/tracker'
            className='block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors'
          >
            <p className='font-semibold'>Tracker (Admin View)</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Daily and weekly scores overview for all users.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
