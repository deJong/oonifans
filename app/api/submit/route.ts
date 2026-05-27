import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_SECONDS = 300;
const MAX_SUBMISSIONS = 5000;
const IG_SHORTCODE_RE = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]{8,12})\/?/;

async function fetchThumbnail(shortcode: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=https://www.instagram.com/p/${shortcode}/`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as { status: string; data?: { image?: { url?: string } } };
    return data?.data?.image?.url ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rateLimitKey = `rl:${ip}`;

  const isLimited = await kv.get(rateLimitKey);
  if (isLimited) {
    return NextResponse.json(
      { error: 'Slow down. One submission every 5 minutes.' },
      { status: 429 }
    );
  }

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
  const match = url.match(IG_SHORTCODE_RE);
  if (!match) {
    return NextResponse.json(
      { error: 'Not a valid Instagram post or reel URL.' },
      { status: 400 }
    );
  }

  const shortcode = match[1];

  const total = await kv.llen('submissions');
  if (total >= MAX_SUBMISSIONS) {
    return NextResponse.json({ error: 'The gallery is full.' }, { status: 503 });
  }

  const existing = await kv.lrange<{ shortcode: string }>('submissions', 0, -1);
  const duplicate = existing.some(s => s?.shortcode === shortcode);
  if (duplicate) {
    return NextResponse.json({ error: 'This post is already in the gallery.' }, { status: 409 });
  }

  const thumbnail = await fetchThumbnail(shortcode);
  const submission = { shortcode, thumbnail, submittedAt: Date.now() };
  await kv.lpush('submissions', JSON.stringify(submission));
  await kv.set(rateLimitKey, 1, { ex: RATE_LIMIT_WINDOW_SECONDS });

  return NextResponse.json({ ok: true });
}
