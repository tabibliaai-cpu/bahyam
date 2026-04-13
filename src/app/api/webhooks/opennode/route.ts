export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.status === 'paid') {
      await db.execute({
        sql: `UPDATE subscriptions
              SET status = 'active',
                  started_at = datetime('now'),
                  expires_at = datetime('now', '+30 days')
              WHERE id = ?`,
        args: [body.id],
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('OpenNode webhook error:', error);
    return Response.json({ received: true, error: 'Processing error' }, { status: 200 });
  }
}

export async function GET() {
  return Response.json({ status: 'ok' });
}
