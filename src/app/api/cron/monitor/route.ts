export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pingApi } from '@/lib/monitor';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const apis = await db.execute({
      sql: `SELECT a.* FROM apis a
            WHERE (
              SELECT checked_at FROM api_logs
              WHERE api_id = a.id
              ORDER BY checked_at DESC LIMIT 1
            ) < datetime('now', '-' || a.check_interval_seconds || ' seconds')
            OR NOT EXISTS (
              SELECT 1 FROM api_logs WHERE api_id = a.id
            )
            LIMIT 50`,
      args: [],
    });
    const results = await Promise.allSettled(apis.rows.map((api: any) => pingApi(api)));
    return NextResponse.json({ checked: apis.rows.length, results: results.length });
  } catch (error) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
