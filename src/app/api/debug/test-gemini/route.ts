import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: 'GEMINI_API_KEY not configured',
                hint: 'Add GEMINI_API_KEY to .env.local'
            }, { status: 500 });
        }

        // Test the API key with a simple request
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

        const result = await model.generateContent('Say "API key works!" in JSON format: {"message": "..."}');
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            status: 'success',
            message: 'Gemini API key is valid',
            testResponse: text,
            apiKeyPrefix: apiKey.substring(0, 10) + '...'
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Gemini API test failed',
            message: error.message,
            details: error.toString()
        }, { status: 500 });
    }
}
