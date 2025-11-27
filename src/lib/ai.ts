import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface BlocGenerationParams {
    topic: string;
    userBio: string;
    previousDayTopics?: string[];
    continuityReference?: string;
}

export async function generateBloc(params: BlocGenerationParams): Promise<{
    title: string;
    content: string;
    nextDayIdea: string;
}> {
    const { topic, userBio, previousDayTopics, continuityReference } = params;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are an expert content curator creating a personalized daily learning "Bloc" for a user.

USER CONTEXT:
- Bio: ${userBio}
- Topic for today: ${topic}
${continuityReference ? `- Yesterday's learning: ${continuityReference}` : ''}
${previousDayTopics?.length ? `- Recent topics: ${previousDayTopics.join(', ')}` : ''}

REQUIREMENTS:
1. Create engaging, high-quality educational content
2. Estimated reading time: 10 minutes (~1500 words)
3. Personalize based on user's bio and interests
4. If continuity reference exists, subtly connect to yesterday's learning
5. Structure: Introduction, 3-4 main concepts, "Why it matters" section, closing with next-day teaser

TONE:
- Conversational but informative
- Engaging and clear
- Not overly academic
- Inspire curiosity

FORMAT YOUR RESPONSE AS JSON with the following structure:
{
  "title": "Compelling title for the bloc",
  "content": "Full content in markdown format with ## headings for sections, including a '## Why This Matters' section near the end",
  "nextDayIdea": "One-sentence teaser for tomorrow's related topic"
}

Generate the Bloc now.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            title: parsed.title,
            content: parsed.content,
            nextDayIdea: parsed.nextDayIdea,
        };
    } catch (error) {
        console.error('Error generating bloc:', error);
        throw new Error('Failed to generate bloc');
    }
}

export async function regenerateBloc(blocId: string, params: BlocGenerationParams) {
    // Same logic as generateBloc but can be enhanced with retry logic
    return generateBloc(params);
}
