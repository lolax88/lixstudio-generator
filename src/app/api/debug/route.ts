import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // Test HF
  const hfKey = process.env.HF_TOKEN;
  if (hfKey) {
    try {
      const res = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
        method: 'POST',
        headers: { Authorization: `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: 'a simple logo', parameters: { width: 512, height: 512 } }),
        signal: AbortSignal.timeout(30000),
      });
      results.hf = {
        status: res.status,
        ok: res.ok,
        contentType: res.headers.get('content-type'),
        body: res.ok ? 'IMAGE' : await res.text().catch(() => 'unknown'),
      };
    } catch (e: any) {
      results.hf = { error: e?.message };
    }
  } else {
    results.hf = { error: 'No HF_TOKEN' };
  }

  // Test Google AI
  const googleKey = process.env.GOOGLE_AI_KEY;
  if (googleKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Generate a simple logo' }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      results.google = {
        status: res.status,
        ok: res.ok,
        hasImage: data?.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData),
        error: data?.error?.message,
      };
    } catch (e: any) {
      results.google = { error: e?.message };
    }
  } else {
    results.google = { error: 'No GOOGLE_AI_KEY' };
  }

  // Test Pollinations
  try {
    const res = await fetch('https://image.pollinations.ai/prompt/a%20simple%20logo?width=256&height=256', {
      signal: AbortSignal.timeout(15000),
    });
    results.pollinations = {
      status: res.status,
      ok: res.ok,
    };
  } catch (e: any) {
    results.pollinations = { error: e?.message };
  }

  return NextResponse.json(results, { status: 200 });
}
