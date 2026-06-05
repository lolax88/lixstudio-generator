import { NextRequest, NextResponse } from 'next/server';

// 6 Style prompts adapted from Nutlope/logocreator
const STYLE_PROMPTS: Record<string, string> = {
  tech:
    'highly detailed, sharp focus, cinematic, photorealistic, minimalist, clean, sleek, neutral color palette with subtle accents, clean lines, shadows, and flat.',
  flashy:
    'flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.',
  modern:
    'modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.',
  playful:
    'playful, lighthearted, bright bold colors, rounded shapes, lively, fun, approachable.',
  abstract:
    'abstract, artistic, creative, unique shapes, patterns, and textures to create a visually interesting and wild logo.',
  minimal:
    'minimal, simple, timeless, versatile, single color logo, use negative space, flat design with minimal details, light, soft, and subtle.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userAPIKey,
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

    // BYOK: use user's API key if provided, otherwise use server key
    const apiKey = userAPIKey || process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key. Enter your Together AI key or contact support.' },
        { status: 403 }
      );
    }

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.modern;

    const prompt = `A single logo, high-quality, award-winning professional design, made for both digital and print media, only contains a few vector shapes, ${stylePrompt}

Primary color is ${primaryColor} and background color is ${backgroundColor}. The company name is "${brandName}", make sure to include the company name in the logo. Industry: ${industry}. ${additionalInfo ? `Additional info: ${additionalInfo}` : ''}`;

    const response = await fetch(
      'https://api.together.xyz/v1/images/generations',
      {
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI error:', errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Check your Together AI key.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'AI generation failed. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;

    if (!b64) {
      return NextResponse.json({ error: 'No image generated' }, { status: 502 });
    }

    return NextResponse.json({
      image: `data:image/png;base64,${b64}`,
      provider: 'together-ai',
      model: 'flux-1.1-pro',
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
