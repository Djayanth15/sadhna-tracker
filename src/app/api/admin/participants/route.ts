import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/participants?weekStart=YYYY-MM-DD
// Returns all bys=true users and their daily scores for the given week
// GET /api/admin/participants?weekStart=YYYY-MM-DD  → admin only: participants + daily scores for week
// GET /api/admin/participants                        → all users: participants list (id, name, email)
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = session.user.role === 'admin';
  const { searchParams } = new URL(request.url);
  const weekStartParam = searchParams.get('weekStart');

  // Non-admins can only access the basic participant list (no weekStart filter)
  if (!isAdmin && weekStartParam) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // No weekStart → just return the participant list
  if (!weekStartParam) {
    const participants = await prisma.user.findMany({
      where: { bys: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ participants });
  }

  // Parse weekStart as a local date (no timezone shift)
  // With weekStart → return participants + their daily scores for that week
  const [year, month, day] = weekStartParam.split('-').map(Number);
  const weekEnd = new Date(year, month - 1, day + 7);

  const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;

  try {
    const participants = await prisma.user.findMany({
      where: { bys: true },
      select: {
        id: true,
        name: true,
        email: true,
        dailyScores: {
          where: {
            date: {
              gte: new Date(`${weekStartParam}T00:00:00.000Z`),
              lt: new Date(`${weekEndStr}T00:00:00.000Z`),
            },
          },
          select: {
            id: true,
            date: true,
            dailySoulScore: true,
            dailyBodyScore: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ participants, weekStart: weekStartParam });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
