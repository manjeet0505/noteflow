import { NextResponse } from 'next/server';
import { openRouterChat } from '../../../lib/openrouter';

export async function POST(request) {
  try {
    const { note } = await request.json();

    if (!note || typeof note !== 'string' || note.trim().length < 20) {
      return NextResponse.json(
        { success: false, message: 'Please provide a longer note to summarize.' },
        { status: 400 }
      );
    }

    const prompt = `You are an assistant that summarizes notes into concise, clear bullet points. Summarize the following note into key bullet points:\n\n${note}`;

    console.log('Attempting to call OpenRouter...');
    const { text } = await openRouterChat([
      { role: 'system', content: 'You are a concise summarizer that outputs bullet points.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, max_tokens: 600 })
    const summary = text;

    console.log('Summary generated:', summary.substring(0, 100) + '...');

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.log('Gemini API Error:', error);
    console.log('Error type:', error.constructor?.name);
    console.log('Error cause:', error.cause);

    const message = error?.message || 'Unknown error';

    if (message.includes('fetch failed')) {
      return NextResponse.json(
        { success: false, message: 'Network error: Unable to connect to Gemini API. Please check your internet connection and API key.', error: message },
        { status: 503 }
      );
    }

    if (message.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { success: false, message: 'Invalid Gemini API key. Please check your API key configuration.', error: message },
        { status: 401 }
      );
    }

    if (message.includes('429')) {
      return NextResponse.json(
        { success: false, message: 'Rate limited by Gemini API. Please try again in a moment.', error: message },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Something went wrong during summarization.', error: message },
      { status: 500 }
    );
  }
}