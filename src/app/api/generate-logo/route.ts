import { NextRequest, NextResponse } from 'next/server';

// 6 Style prompts
const STYLE_PROMPTS: Record<string, string> = {
  tech:
    'highly detailed, sharp focus, minimalist, clean, sleek, neutral color palette with subtle accents, clean lines, flat design.',
  flashy:
    'flashy, attention grabbing, bold, futuristic, eye-catching, vibrant neon colors with metallic, shiny, glossy accents.',
  modern:
    'modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors, strategic negative space.',
  playful:
    'playful, lighthearted, bright bold colors, rounded shapes, lively, fun, approachable.',
  abstract:
    'abstract, artistic, creative, unique shapes, patterns, textures, visually interesting and wild.',
  minimal:
    'minimal, simple, timeless, versatile, single color logo, negative space, flat design, light, soft, subtle.',
};

// Build the logo prompt
function buildPrompt(
  brandName: string,
  style: string,
  primaryColor: string,
  backgroundColor: string,
  industry: string,
  additionalInfo?: string
) {
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.modern;
  return `A single logo, high-quality, award-winning professional design, made for both digital and print media, only contains a few vector shapes, ${stylePrompt} Primary color is ${primaryColor} and background color is ${backgroundColor}. The company name is "${brandName}", make sure to include the company name in the logo. Industry: ${industry}. ${additionalInfo ? `Additional info: ${additionalInfo}` : ''}`;
}

// Provider 1: Together AI (BYOK or server key)
async function generateWithTogetherAI(
  prompt: string,
  apiKey: string
): Promise<string | null> {
  try {
    const res = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch {
    return null;
  }
}

// Provider 2: Hugging Face Inference API (FREE with token)
async function generateWithHuggingFace(
  prompt: string,
  apiKey: string
): Promise<string | null> {
  try {
    // Use FLUX.1-schnell (free, fast) or stable-diffusion-xl
    const models = [
      'black-forest-labs/FLUX.1-schnell',
      'stabilityai/stable-diffusion-xl-base-1.0',
    ];

    for (const model of models) {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width: 1024,
              height: 1024,
            },
          }),
        }
      );

      if (res.ok) {
        const blob = await res.arrayBuffer();
        const b64 = Buffer.from(blob).toString('base64');
        const contentType = res.headers.get('content-type') || 'image/png';
        return `data:${contentType};base64,${b64}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Provider 3: Pollinations.ai (FREE, no key needed)
async function generateWithPollinations(
  prompt: string
): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt);
    const res = await fetch(
      `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true`,
      { signal: AbortSignal.timeout(60000) }
    );

    if (!res.ok) return null;

    const blob = await res.arrayBuffer();
    const b64 = Buffer.from(blob).toString('base64');
    return `data:image/png;base64,${b64}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userAPIKey,
      userHFKey,
      brandName,
      industry,
      style,
      primaryColor,
      backgroundColor,
      additionalInfo,
    } = body;

    if (!brandName) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const prompt = buildPrompt(
      brandName,
      style,
      primaryColor || '#7C3AED',
      backgroundColor || '#FFFFFF',
      industry || 'tech',
      additionalInfo
    );

    let image: string | null = null;
    let provider = '';

    // Priority 1: User's Together AI key (BYOK)
    if (userAPIKey && !image) {
      image = await generateWithTogetherAI(prompt, userAPIKey);
      if (image) provider = 'together-ai (your key)';
    }

    // Priority 2: Server Together AI key
    if (!image && process.env.TOGETHER_API_KEY) {
      image = await generateWithTogetherAI(prompt, process.env.TOGETHER_API_KEY);
      if (image) provider = 'together-ai (server)';
    }

    // Priority 3: User's Hugging Face key (FREE)
    if (userHFKey && !image) {
      image = await generateWithHuggingFace(prompt, userHFKey);
      if (image) provider = 'huggingface (your key)';
    }

    // Priority 4: Server Hugging Face key
    if (!image && process.env.HF_TOKEN) {
      image = await generateWithHuggingFace(prompt, process.env.HF_TOKEN);
      if (image) provider = 'huggingface (server)';
    }

    // Priority 5: Pollinations.ai (FREE, no key)
    if (!image) {
      image = await generateWithPollinations(prompt);
      if (image) provider = 'pollinations (free)';
    }

    if (!image) {
      return NextResponse.json(
        {
          error:
            'All AI providers failed. Please add your own API key (Together AI or Hugging Face) for reliable generation.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ image, provider });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
