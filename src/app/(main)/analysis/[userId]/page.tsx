import { getServerSession } from '@/lib/get-session';
import { forbidden, unauthorized } from 'next/navigation';
import type { Metadata } from 'next';
import { AnalysisClient } from './analysis-client';

export const metadata: Metadata = {
  title: 'My Analysis – Sadhna Tracker',
};

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  const { userId } = await params;

  // Only the user themselves or an admin can access this page
  if (user.id !== userId && user.role !== 'admin') {
    forbidden();
  }

  return (
    <main className='mx-auto w-full max-w-5xl px-4 py-8'>
      <AnalysisClient userId={userId} currentUserId={user.id} isAdmin={user.role === 'admin'} />
    </main>
  );
}
