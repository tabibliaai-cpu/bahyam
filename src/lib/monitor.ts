import { db } from './db';

export async function pingApi(api: any) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const headers: Record<string, string> = api.headers ? JSON.parse(api.headers) : {};
    if (api.auth_token) {
      headers['Authorization'] = `Bearer ${api.auth_token}`;
    }
    const response = await fetch(api.url, {
      method: api.method || 'GET',
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    const responseTime = Date.now() - start;
    const isError = response.status >= 400;
    await logResult(api.id, response.status, responseTime, '', isError);
    if (isError || responseTime > 2000) {
      await triggerAIDiagnosis(api, response.status, responseTime, '');
    }
    return { status: response.status, responseTime, isError };
  } catch (error: any) {
    const responseTime = Date.now() - start;
    await logResult(api.id, 0, responseTime, error.message || 'Connection failed', true);
    await triggerAIDiagnosis(api, 0, responseTime, error.message || 'Connection failed');
    return { status: 0, responseTime, isError: true };
  }
}

async function logResult(apiId: string, statusCode: number, responseTime: number, body: string, isError: boolean) {
  try {
    await db.execute({
      sql: `INSERT INTO api_logs (id, api_id, status_code, response_time_ms, response_body, is_error, checked_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [crypto.randomUUID(), apiId, statusCode, responseTime, body.slice(0, 500), isError ? 1 : 0],
    });
  } catch (e) {
    console.error('Log result error:', e);
  }
}

async function triggerAIDiagnosis(api: any, statusCode: number, responseTime: number, errorBody: string) {
  try {
    if (!process.env.ZAI_BASE_URL || !process.env.ZAI_API_KEY) return;
    const response = await fetch(process.env.ZAI_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || 'gpt-4o',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: 'You are an expert API reliability engineer. Analyze API failures and provide concise diagnosis. Always respond in JSON with fields: diagnosis, fix, severity (low/medium/high/critical)',
          },
          {
            role: 'user',
            content: `API: ${api.name}, URL: ${api.url}, Status: ${statusCode}, Response time: ${responseTime}ms, Error: ${errorBody}`,
          },
        ],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    await db.execute({
      sql: `INSERT INTO alerts (id, api_id, user_id, error_summary, ai_diagnosis, ai_fix_suggestion, severity, sent_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        crypto.randomUUID(),
        api.id,
        api.user_id || 'system',
        `${api.name} returned ${statusCode} in ${responseTime}ms`,
        parsed.diagnosis || 'Unknown error',
        parsed.fix || 'Check API endpoint',
        parsed.severity || 'medium',
      ],
    });
  } catch (e) {
    console.error('AI diagnosis failed:', e);
  }
}

export { logResult, triggerAIDiagnosis };
