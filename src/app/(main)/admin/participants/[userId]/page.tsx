import { getServerSession } from '@/lib/get-session';
import { forbidden, unauthorized } from 'next/navigation';
import type { Metadata } from 'next';
import { ParticipantClient } from './participant-client';

export const metadata: Metadata = {
  title: 'Participant Analysis – Admin',
};

export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();
  if (user.role !== 'admin') forbidden();

  const { userId } = await params;

  return (
    <main className='mx-auto w-full max-w-5xl px-4 py-8'>
      <ParticipantClient userId={userId} />
    </main>
  );
}
