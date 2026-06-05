import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // Test Google AI with correct image models
  const googleKey = process.env.GOOGLE_AI_KEY;
  if (googleKey) {
    const imageModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image'];
    for (const model of imageModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Generate a simple coffee cup logo, minimal design' }] }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
            }),
          }
        );
        const data = await res.json().catch(() => ({}));
        const hasImage = data?.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
        results[`google_${model}`] = {
          status: res.status,
          ok: res.ok,
          hasImage,
          error: data?.error?.message,
        };
        if (res.ok && hasImage) break;
      } catch (e: any) {
        results[`google_${model}`] = { error: e?.message };
      }
    }
  } else {
    results.google = { error: 'No GOOGLE_AI_KEY' };
  }

  return NextResponse.json(results, { status: 200 });
}
