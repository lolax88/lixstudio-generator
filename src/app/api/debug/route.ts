import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};
  const hfKey = process.env.HF_TOKEN;
  
  if (!hfKey) return NextResponse.json({ error: 'No HF_TOKEN' });

  // Test router with different models
  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'stabilityai/stable-diffusion-3-medium',
    'CompVis/stable-diffusion-v1-4',
    'runwayml/stable-diffusion-v1-5',
    'prompthero/openjourney',
  ];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://router.huggingface.co/hf-inference/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: 'a simple logo', parameters: { width: 512, height: 512 } }),
          signal: AbortSignal.timeout(20000),
        }
      );
      const contentType = res.headers.get('content-type') || '';
      const isImage = contentType.includes('image');
      results[model] = {
        status: res.status,
        ok: res.ok,
        contentType,
        isImage,
        body: isImage ? 'IMAGE' : await res.text().then(t => t.slice(0, 200)).catch(() => 'unknown'),
      };
      if (res.ok && isImage) break; // Found working model
    } catch (e: any) {
      results[model] = { error: e?.message };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
