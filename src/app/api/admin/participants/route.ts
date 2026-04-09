import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/participants?weekStart=YYYY-MM-DD
// Returns all bys=true users and their daily scores for the given week
// GET /api/admin/participants?weekStart=YYYY-MM-DD  → participants + daily scores for week
// GET /api/admin/participants                        → participants list only (id, name, email)
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekStartParam = searchParams.get('weekStart');
  // No weekStart → just return the participant list

  if (!weekStartParam) {
    // return NextResponse.json({ error: 'weekStart param required' }, { status: 400 });
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
  // const weekStart = new Date(year, month - 1, day);
  const weekEnd = new Date(year, month - 1, day + 7);

  // // Store as UTC midnight for DB query (matches how dates are stored)
  // const weekStartUTC = new Date(`${weekStartParam}T00:00:00.000Z`);
  // const weekEndUTC = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
  const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
  // const weekEndUTCStr = `${weekEndStr}T00:00:00.000Z`;

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
              // gte: weekStartUTC,
              // lt: new Date(weekEndUTCStr),
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
