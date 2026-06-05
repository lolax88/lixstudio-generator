import { NextRequest, NextResponse } from 'next/server';

// 6 Style prompts
const STYLE_PROMPTS: Record<string, string> = {
  tech: 'highly detailed, sharp focus, minimalist, clean, sleek, neutral color palette with subtle accents, clean lines, flat design.',
  flashy: 'flashy, attention grabbing, bold, futuristic, eye-catching, vibrant neon colors with metallic, shiny, glossy accents.',
  modern: 'modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors, strategic negative space.',
  playful: 'playful, lighthearted, bright bold colors, rounded shapes, lively, fun, approachable.',
  abstract: 'abstract, artistic, creative, unique shapes, patterns, textures, visually interesting and wild.',
  minimal: 'minimal, simple, timeless, versatile, single color logo, negative space, flat design, light, soft, subtle.',
};

function buildPrompt(brandName: string, style: string, primaryColor: string, backgroundColor: string, industry: string, additionalInfo?: string) {
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.modern;
  return `A single logo, high-quality, award-winning professional design, made for both digital and print media, only contains a few vector shapes, ${stylePrompt} Primary color is ${primaryColor} and background color is ${backgroundColor}. The company name is "${brandName}", make sure to include the company name in the logo. Industry: ${industry}. ${additionalInfo ? `Additional info: ${additionalInfo}` : ''}`;
}

// Try generating with Together AI
async function tryTogetherAI(prompt: string, apiKey: string): Promise<{ image: string; provider: string } | null> {
  try {
    const res = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1.1-pro',
        prompt,
        width: 1024,
        height: 1024,
        steps: 28,
        n: 1,
        response_format: 'b64_json',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    return b64 ? { image: `data:image/png;base64,${b64}`, provider: 'together-ai' } : null;
  } catch { return null; }
}

// Try generating with Hugging Face
async function tryHuggingFace(prompt: string, apiKey: string): Promise<{ image: string; provider: string } | null> {
  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
  ];
  for (const model of models) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt, parameters: { width: 1024, height: 1024 } }),
      });
      if (res.ok) {
        const blob = await res.arrayBuffer();
        const b64 = Buffer.from(blob).toString('base64');
        const ct = res.headers.get('content-type') || 'image/png';
        return { image: `data:${ct};base64,${b64}`, provider: `huggingface/${model.split('/')[1]}` };
      }
    } catch { continue; }
  }
  return null;
}

// Try generating with Pollinations.ai (free, no key)
// Try generating with Google AI Studio (Gemini 2.0 Flash)
async function tryGoogleAI(prompt: string, apiKey: string): Promise<{ image: string; provider: string } | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate a professional logo: ${prompt}` }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        return { image: `data:${mime};base64,${part.inlineData.data}`, provider: 'google-ai-studio' };
      }
    }
    return null;
  } catch { return null; }
}

async function tryPollinations(prompt: string): Promise<{ image: string; provider: string } | null> {
  try {
    const encoded = encodeURIComponent(prompt);
    const res = await fetch(`https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true`, {
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;
    const blob = await res.arrayBuffer();
    const b64 = Buffer.from(blob).toString('base64');
    return { image: `data:image/png;base64,${b64}`, provider: 'pollinations' };
  } catch { return null; }
}

// Collect all available keys from env (supports HF_TOKEN, HF_TOKEN_2, HF_TOKEN_3, etc.)
function getEnvKeys(prefix: string): string[] {
  const keys: string[] = [];
  // Check base key
  const base = process.env[prefix];
  if (base) keys.push(base);
  // Check numbered keys (prefix_2, prefix_3, ... up to 10)
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`${prefix}_${i}`];
    if (k) keys.push(k);
  }
  return keys;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userAPIKey, userHFKey, userGoogleKey, brandName, industry, style, primaryColor, backgroundColor, additionalInfo } = body;

    if (!brandName) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const prompt = buildPrompt(brandName, style, primaryColor || '#7C3AED', backgroundColor || '#FFFFFF', industry || 'tech', additionalInfo);

    // Build fallback chain: user keys → server keys → free fallback
    // Each entry: { type, key?, fn }
    type Attempt = { label: string; fn: () => Promise<{ image: string; provider: string } | null> };
    const attempts: Attempt[] = [];

    // 1. User's Together AI key (BYOK)
    if (userAPIKey) {
      attempts.push({ label: 'user-together', fn: () => tryTogetherAI(prompt, userAPIKey) });
    }

    // 2. Server Together AI keys (TOGETHER_API_KEY, TOGETHER_API_KEY_2, ...)
    for (const key of getEnvKeys('TOGETHER_API_KEY')) {
      attempts.push({ label: `server-together-${key.slice(-4)}`, fn: () => tryTogetherAI(prompt, key) });
    }

    // 3. User's Hugging Face key (BYOK)
    if (userHFKey) {
      attempts.push({ label: 'user-hf', fn: () => tryHuggingFace(prompt, userHFKey) });
    }

    // 4. User's Google AI Studio key (BYOK)
    if (userGoogleKey) {
      attempts.push({ label: 'user-google', fn: () => tryGoogleAI(prompt, userGoogleKey) });
    }

    // 5. Server Hugging Face keys (HF_TOKEN, HF_TOKEN_2, ...)
    for (const key of getEnvKeys('HF_TOKEN')) {
      attempts.push({ label: `server-hf-${key.slice(-4)}`, fn: () => tryHuggingFace(prompt, key) });
    }

    // 5. Server Google AI Studio keys (GOOGLE_AI_KEY, GOOGLE_AI_KEY_2, ...)
    for (const key of getEnvKeys('GOOGLE_AI_KEY')) {
      attempts.push({ label: `server-google-${key.slice(-4)}`, fn: () => tryGoogleAI(prompt, key) });
    }

    // 6. Pollinations.ai (free, no key)
    attempts.push({ label: 'pollinations', fn: () => tryPollinations(prompt) });

    // Execute fallback chain
    const errors: string[] = [];
    for (const attempt of attempts) {
      const result = await attempt.fn();
      if (result) {
        return NextResponse.json({
          image: result.image,
          provider: result.provider,
          fallbackDepth: attempts.indexOf(attempt) + 1,
          totalAttempts: attempts.length,
        });
      }
      errors.push(attempt.label);
    }

    return NextResponse.json(
      {
        error: 'All providers failed. Add your own API key for reliable generation.',
        tried: errors,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
