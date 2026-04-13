export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';

async function getLiveApis() {
  try {
    const result = await db.execute({
      sql: `SELECT
              a.*,
              l.status_code as last_status,
              l.response_time_ms as last_response_time,
              l.checked_at as last_checked,
              l.is_error as last_is_error,
              p.risk_score,
              p.degradation_probability,
              (
                SELECT ROUND(
                  (COUNT(CASE WHEN is_error = 0 THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 2
                )
                FROM api_logs WHERE api_id = a.id AND checked_at > datetime('now', '-24 hours')
              ) as uptime_24h,
              (
                SELECT AVG(response_time_ms)
                FROM api_logs WHERE api_id = a.id AND checked_at > datetime('now', '-1 hour')
              ) as avg_response_1h
            FROM apis a
            LEFT JOIN api_logs l ON l.id = (
              SELECT id FROM api_logs WHERE api_id = a.id ORDER BY checked_at DESC LIMIT 1
            )
            LEFT JOIN api_predictions p ON p.api_id = a.id
            WHERE a.is_public = 1 OR a.is_benchmark = 1
            ORDER BY a.is_benchmark DESC, a.name ASC`,
      args: [],
    });
    return result.rows.map((row: any) => ({
      ...row,
      status: !row.last_status || row.last_is_error ? 'down' : row.last_response_time > 2000 ? 'slow' : 'up',
      uptime: row.uptime_24h || 100,
      responseTime: row.last_response_time || 0,
      riskScore: row.risk_score || 0,
    }));
  } catch {
    return [];
  }
}

async function getGlobalStats() {
  try {
    const [total, uptime, checksToday, incidents, avgResponse] = await Promise.all([
      db.execute({ sql: `SELECT COUNT(*) as count FROM apis WHERE is_public = 1 OR is_benchmark = 1`, args: [] }),
      db.execute({ sql: `SELECT ROUND(AVG(CASE WHEN is_error = 0 THEN 100.0 ELSE 0 END), 2) as uptime FROM api_logs WHERE checked_at > datetime('now', '-24 hours')`, args: [] }),
      db.execute({ sql: `SELECT COUNT(*) as count FROM api_logs WHERE checked_at > datetime('now', '-24 hours')`, args: [] }),
      db.execute({ sql: `SELECT COUNT(*) as count FROM alerts WHERE sent_at > datetime('now', '-10 minutes')`, args: [] }),
      db.execute({ sql: `SELECT ROUND(AVG(response_time_ms)) as avg FROM api_logs WHERE checked_at > datetime('now', '-1 hour')`, args: [] }),
    ]);
    return {
      totalApis: total.rows[0]?.count || 0,
      globalUptime: uptime.rows[0]?.uptime || 100,
      checksToday: checksToday.rows[0]?.count || 0,
      activeIncidents: incidents.rows[0]?.count || 0,
      avgResponse: avgResponse.rows[0]?.avg || 0,
    };
  } catch {
    return { totalApis: 0, globalUptime: 100, checksToday: 0, activeIncidents: 0, avgResponse: 0 };
  }
}

async function getRecentEvents() {
  try {
    const result = await db.execute({
      sql: `SELECT al.*, a.name as api_name, a.category FROM alerts al JOIN apis a ON a.id = al.api_id ORDER BY al.sent_at DESC LIMIT 30`,
      args: [],
    });
    return result.rows;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [apis, stats, events] = await Promise.all([getLiveApis(), getGlobalStats(), getRecentEvents()]);
    return Response.json({ apis, stats, events });
  } catch {
    return Response.json({ apis: [], stats: { totalApis: 0, globalUptime: 100, checksToday: 0, activeIncidents: 0, avgResponse: 0 }, events: [] });
  }
}
