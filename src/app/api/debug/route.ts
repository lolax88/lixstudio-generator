import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // Test Google AI with different approaches
  const googleKey = process.env.GOOGLE_AI_KEY;
  if (googleKey) {
    // Approach 1: gemini-2.0-flash-exp with v1 (text only, no image)
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say hello' }] }],
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      results.google_v1_text = {
        status: res.status,
        ok: res.ok,
        hasContent: !!data?.candidates?.[0]?.content?.parts?.[0]?.text,
        error: data?.error?.message,
      };
    } catch (e: any) {
      results.google_v1_text = { error: e?.message };
    }

    // Approach 2: gemini-2.0-flash-exp with v1beta + image config
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Generate an image of a simple coffee cup logo' }] }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      results.google_v1beta_image = {
        status: res.status,
        ok: res.ok,
        hasImage: data?.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData),
        error: data?.error?.message,
      };
    } catch (e: any) {
      results.google_v1beta_image = { error: e?.message };
    }

    // Approach 3: Imagen 3 API
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: 'A simple coffee cup logo, minimal design' }],
            parameters: { sampleCount: 1 },
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      results.google_imagen = {
        status: res.status,
        ok: res.ok,
        hasImage: !!data?.predictions?.[0]?.bytesBase64Encoded,
        error: data?.error?.message,
      };
    } catch (e: any) {
      results.google_imagen = { error: e?.message };
    }

    // Approach 4: List available models
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`
      );
      const data = await res.json().catch(() => ({}));
      const models = data?.models?.map((m: any) => ({
        name: m.name,
        methods: m.supportedGenerationMethods,
      })) || [];
      results.available_models = {
        count: models.length,
        imageModels: models.filter((m: any) => 
          m.methods?.includes('generateContent') && 
          (m.name.includes('imagen') || m.name.includes('image'))
        ).map((m: any) => m.name),
      };
    } catch (e: any) {
      results.available_models = { error: e?.message };
    }
  } else {
    results.google = { error: 'No GOOGLE_AI_KEY' };
  }

  return NextResponse.json(results, { status: 200 });
}
