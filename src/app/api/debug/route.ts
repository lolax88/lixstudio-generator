import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // Test Replicate
  const replicateKey = process.env.REPLICATE_API_TOKEN;
  results.replicate_key_exists = !!replicateKey;
  results.replicate_key_prefix = replicateKey?.slice(0, 5) || 'NONE';
  
  if (replicateKey) {
    try {
      const res = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${replicateKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify({
          version: 'black-forest-labs/flux-schnell',
          input: { prompt: 'a simple coffee cup logo', num_outputs: 1, aspect_ratio: '1:1', output_format: 'png' },
        }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json().catch(() => ({}));
      results.replicate = {
        status: res.status,
        ok: res.ok,
        hasOutput: !!data.output,
        error: data?.error || data?.detail,
        id: data?.id,
        status_field: data?.status,
      };
    } catch (e: any) {
      results.replicate = { error: e?.message };
    }
  } else {
    results.replicate = { error: 'No REPLICATE_API_TOKEN' };
  }

  return NextResponse.json(results, { status: 200 });
}
