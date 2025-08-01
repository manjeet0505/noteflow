import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { note } = await request.json();

    if (!note || typeof note !== 'string' || note.trim().length < 20) {
      return NextResponse.json(
        { success: false, message: 'Please provide a longer note to summarize.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini API Key exists:', !!apiKey);
    console.log('Gemini API Key length:', apiKey?.length);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    // Initialize the Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an assistant that summarizes notes into concise, clear bullet points. Summarize the following note into key bullet points:\n\n${note}`;

    console.log('Attempting to call Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Gemini API call successful');
    
    const response = await result.response;
    const summary = response.text();
    console.log('Summary generated:', summary.substring(0, 100) + '...');

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.log('Gemini API Error:', error);
    console.log('Error type:', error.constructor.name);
    console.log('Error cause:', error.cause);
    
    // Check for specific error types
    if (error.message.includes('fetch failed')) {
      return NextResponse.json(
        { success: false, message: 'Network error: Unable to connect to Gemini API. Please check your internet connection and API key.', error: error.message },
        { status: 503 }
      );
    }
    
    if (error.message.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { success: false, message: 'Invalid Gemini API key. Please check your API key configuration.', error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Something went wrong during summarization.', error: error.message },
      { status: 500 }
    );
  }
}