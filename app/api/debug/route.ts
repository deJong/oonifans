import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const raw = await kv.lrange('submissions', 0, -1);
    return NextResponse.json({ ok: true, count: raw.length, raw });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}
