import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // Test HF with detailed error
  const hfKey = process.env.HF_TOKEN;
  results.hf_key_exists = !!hfKey;
  results.hf_key_prefix = hfKey?.slice(0, 8) || 'NONE';
  
  if (hfKey) {
    // Test 1: Basic connectivity
    try {
      const res = await fetch('https://huggingface.co/api/models?limit=1', {
        signal: AbortSignal.timeout(10000),
      });
      results.hf_connectivity = { status: res.status, ok: res.ok };
    } catch (e: any) {
      results.hf_connectivity = { error: e?.message, code: e?.code };
    }

    // Test 2: Inference API
    try {
      const res = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: 'a simple logo', parameters: { width: 512, height: 512 } }),
        signal: AbortSignal.timeout(30000),
      });
      results.hf_inference = {
        status: res.status,
        ok: res.ok,
        contentType: res.headers.get('content-type'),
        body: res.ok ? 'IMAGE' : await res.text().then(t => t.slice(0, 300)).catch(() => 'unknown'),
      };
    } catch (e: any) {
      results.hf_inference = { error: e?.message, code: e?.code, cause: e?.cause?.code };
    }

    // Test 3: Router API
    try {
      const res = await fetch('https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: 'a simple logo' }),
        signal: AbortSignal.timeout(30000),
      });
      results.hf_router = {
        status: res.status,
        ok: res.ok,
        body: res.ok ? 'IMAGE' : await res.text().then(t => t.slice(0, 300)).catch(() => 'unknown'),
      };
    } catch (e: any) {
      results.hf_router = { error: e?.message, code: e?.code, cause: e?.cause?.code };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
