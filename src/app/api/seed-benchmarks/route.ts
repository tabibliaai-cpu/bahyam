export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';

const benchmarkApis = [
  { name: 'Stripe API', url: 'https://api.stripe.com/v1', method: 'GET', category: 'Payment', slug: 'stripe-api', description: 'Payment processing API' },
  { name: 'GitHub API', url: 'https://api.github.com', method: 'GET', category: 'Developer', slug: 'github-api', description: 'Code hosting platform API' },
  { name: 'OpenAI API', url: 'https://api.openai.com/v1/models', method: 'GET', category: 'AI', slug: 'openai-api', description: 'AI models API' },
  { name: 'Cloudflare API', url: 'https://api.cloudflare.com/client/v4', method: 'GET', category: 'Infrastructure', slug: 'cloudflare-api', description: 'CDN and security API' },
  { name: 'Vercel API', url: 'https://api.vercel.com', method: 'GET', category: 'Hosting', slug: 'vercel-api', description: 'Deployment platform API' },
  { name: 'Twilio API', url: 'https://api.twilio.com', method: 'GET', category: 'Communication', slug: 'twilio-api', description: 'SMS and voice API' },
  { name: 'Supabase API', url: 'https://api.supabase.com', method: 'GET', category: 'Database', slug: 'supabase-api', description: 'Open source Firebase alternative' },
  { name: 'PlanetScale API', url: 'https://api.planetscale.com/v1', method: 'GET', category: 'Database', slug: 'planetscale-api', description: 'Serverless MySQL platform' },
  { name: 'Resend API', url: 'https://api.resend.com', method: 'GET', category: 'Email', slug: 'resend-api', description: 'Email delivery API' },
  { name: 'Anthropic API', url: 'https://api.anthropic.com', method: 'GET', category: 'AI', slug: 'anthropic-api', description: 'Claude AI API' },
  { name: 'Hugging Face API', url: 'https://huggingface.co/api', method: 'GET', category: 'AI', slug: 'huggingface-api', description: 'ML models API' },
  { name: 'Binance API', url: 'https://api.binance.com/api/v3/ping', method: 'GET', category: 'Crypto', slug: 'binance-api', description: 'Crypto exchange API' },
  { name: 'CoinGecko API', url: 'https://api.coingecko.com/api/v3/ping', method: 'GET', category: 'Crypto', slug: 'coingecko-api', description: 'Crypto prices API' },
  { name: 'Shopify API', url: 'https://shopify.dev/api', method: 'GET', category: 'Ecommerce', slug: 'shopify-api', description: 'Ecommerce platform API' },
  { name: 'Sendgrid API', url: 'https://api.sendgrid.com/v3', method: 'GET', category: 'Email', slug: 'sendgrid-api', description: 'Email marketing API' },
  { name: 'Plaid API', url: 'https://production.plaid.com', method: 'GET', category: 'Fintech', slug: 'plaid-api', description: 'Banking data API' },
  { name: 'Mapbox API', url: 'https://api.mapbox.com', method: 'GET', category: 'Maps', slug: 'mapbox-api', description: 'Maps and location API' },
  { name: 'Algolia API', url: 'https://status.algolia.com/api/v2/status.json', method: 'GET', category: 'Search', slug: 'algolia-api', description: 'Search and discovery API' },
  { name: 'Pusher API', url: 'https://api.pusherapp.com', method: 'GET', category: 'Realtime', slug: 'pusher-api', description: 'Realtime messaging API' },
  { name: 'Auth0 API', url: 'https://auth0.com/api', method: 'GET', category: 'Auth', slug: 'auth0-api', description: 'Authentication API' },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();

    let seeded = 0;
    for (const api of benchmarkApis) {
      try {
        await db.execute({
          sql: `INSERT OR IGNORE INTO apis (id, user_id, name, url, method, category, slug, description, is_public, is_benchmark, check_interval_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 300)`,
          args: [crypto.randomUUID(), 'system', api.name, api.url, api.method, api.category, api.slug, api.description],
        });
        seeded++;
      } catch (e) {
        // Already exists
      }
    }

    return NextResponse.json({ success: true, seeded, total: benchmarkApis.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
