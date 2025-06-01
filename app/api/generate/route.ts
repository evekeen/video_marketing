import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productDescription, problem, targetAudience } = await request.json();

    const prompt = `Generate 50 unique and creative Instagram Reel scenarios (10 seconds each) to promote the following product:

Product Description: ${productDescription}
Problem it solves: ${problem}
Target Audience: ${targetAudience}

Each scenario should be:
- Engaging and attention-grabbing
- Suitable for a 10-second video format
- Relevant to the target audience
- Show the product's value proposition
- Be diverse in approach (testimonials, demonstrations, before/after, storytelling, etc.)
- Do not try to showcase the product features - they will be inserted separately by hands
- Try to focus on people that are target audience and in the problem space doing something that is relevant
- Something happens that is catasthropic or extraordinary to grab target audience attention

Format each scenario as:
Number. Title: Brief description of the scenario

Please ensure variety in the scenarios to give multiple creative options.`;

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
    });

    const content = completion.choices[0].message.content || '';
    
    const scenarios = content.split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map((line, index) => {
        const match = line.match(/^\d+\.\s*([^:]+):\s*(.+)$/);
        if (match) {
          return {
            id: index + 1,
            title: match[1].trim(),
            description: match[2].trim(),
            selected: false
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error('Error generating scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to generate scenarios' },
      { status: 500 }
    );
  }
}