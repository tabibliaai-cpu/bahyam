export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ status: 'Database initialized' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
