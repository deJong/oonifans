import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_SECONDS = 300; // 1 submit per IP per 5 minutes
const MAX_SUBMISSIONS = 5000;

const IG_SHORTCODE_RE = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]{8,12})\/?/;

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rateLimitKey = `rl:${ip}`;

  const isLimited = await kv.get(rateLimitKey);
  if (isLimited) {
    return NextResponse.json(
      { error: 'Slow down. One submission every 5 minutes.' },
      { status: 429 }
    );
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || !('url' in body)) {
    return NextResponse.json({ error: 'Missing URL.' }, { status: 400 });
  }

  const url = String((body as { url: unknown }).url).trim();

  // Validate Instagram URL and extract shortcode
  const match = url.match(IG_SHORTCODE_RE);
  if (!match) {
    return NextResponse.json(
      { error: 'Not a valid Instagram post or reel URL.' },
      { status: 400 }
    );
  }

  const shortcode = match[1];

  // Guard against runaway growth
  const total = await kv.llen('submissions');
  if (total >= MAX_SUBMISSIONS) {
    return NextResponse.json({ error: 'The gallery is full.' }, { status: 503 });
  }

  // Deduplicate
  const existing: string[] = await kv.lrange('submissions', 0, -1);
  const duplicate = existing.some(entry => {
    try { return (JSON.parse(entry) as { shortcode: string }).shortcode === shortcode; }
    catch { return false; }
  });

  if (duplicate) {
    return NextResponse.json({ error: 'This post is already in the gallery.' }, { status: 409 });
  }

  // Persist submission
  const submission = { shortcode, submittedAt: Date.now() };
  await kv.lpush('submissions', JSON.stringify(submission));

  // Set rate limit token
  await kv.set(rateLimitKey, 1, { ex: RATE_LIMIT_WINDOW_SECONDS });

  return NextResponse.json({ ok: true });
}
