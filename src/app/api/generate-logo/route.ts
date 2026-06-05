import { NextRequest, NextResponse } from 'next/server';

// Style prompts adapted from Nutlope/logocreator + LixStudio brand
const STYLE_PROMPTS: Record<string, string> = {
  minimal:
    'minimal, simple, timeless, versatile, single color logo, use negative space, flat design with minimal details, light, soft, and subtle.',
  modern:
    'modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.',
  playful:
    'playful, lighthearted, bright bold colors, rounded shapes, lively, fun, approachable.',
  elegant:
    'elegant, sophisticated, refined, luxury feel, serif typography hints, gold or silver accents, premium quality.',
  bold: 'bold, attention grabbing, futuristic, eye-catching, vibrant colors with metallic, shiny, and glossy accents, strong presence.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandName, industry, style, primaryColor, secondaryColor, additionalInfo } = body;

    if (!brandName) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI generation not configured. Set TOGETHER_API_KEY.' },
        { status: 503 }
      );
    }

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.modern;

    const prompt = `A single logo, high-quality, award-winning professional design, made for both digital and print media, only contains a few vector shapes, ${stylePrompt}

Primary color is ${primaryColor} and secondary color is ${secondaryColor}. The company name is "${brandName}", make sure to include the company name in the logo. Industry: ${industry}. ${additionalInfo ? `Additional info: ${additionalInfo}` : ''}`;

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
