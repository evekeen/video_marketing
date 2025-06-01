import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { z } from 'zod';

const scenariosListFormat = z.object({
  scenarios: z.array(z.object({
    title: z.string(),
    description: z.string()
  }))
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productDescription, problem, targetAudience } = await request.json();

    const prompt = `Generate 20 distinct, 10-second Instagram Reel scenarios to promote a product. Use the following inputs:

<Product Description>
${productDescription}
</Product Description>

<Problem it solves>
${problem}
</Problem it solves>

<Target Audience>
${targetAudience}
</Target Audience>

Requirements for each scenario:
    - Grabs attention immediately (catastrophic or extraordinary event);
    - Centers on someone from the target audience;    
    - Fits a 5-second format short one action clip;
    - Varies in action and style.

Output format for each scenario:
N. Title: Detailed description of the scene and action

Ensure diverse approaches and keep every scenario focused on the user's pain point and a dramatic hook.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a creative social media marketing expert specializing in Instagram Reels."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: zodResponseFormat(scenariosListFormat, 'scenarios')
    });

    const content = completion.choices[0].message.content || '';
    const scenarios = JSON.parse(content);

    return NextResponse.json({ 
      scenarios: scenarios.scenarios.map((scenario: any, index: number) => ({
        id: index + 1,
        title: scenario.title,
        description: scenario.description,
        selected: false
      }))
    });
  } catch (error) {
    console.error('Error generating scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to generate scenarios' },
      { status: 500 }
    );
  }
}