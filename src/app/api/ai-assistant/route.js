import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { action, content, language, message } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required (rewrite, translate, improve, chat)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini API Key exists:', !!apiKey);
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    // Initialize the Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';

    switch (action) {
      case 'rewrite':
        if (!content || content.trim().length < 10) {
          return NextResponse.json(
            { success: false, message: 'Please provide content to rewrite (minimum 10 characters).' },
            { status: 400 }
          );
        }
        prompt = `Rewrite the following text to make it clearer, more engaging, and better structured while maintaining the original meaning:\n\n${content}`;
        break;

      case 'translate':
        if (!content || content.trim().length < 5) {
          return NextResponse.json(
            { success: false, message: 'Please provide content to translate (minimum 5 characters).' },
            { status: 400 }
          );
        }
        if (!language) {
          return NextResponse.json(
            { success: false, message: 'Please specify the target language for translation.' },
            { status: 400 }
          );
        }
        prompt = `Translate the following text to ${language}. Only return the translated text:\n\n${content}`;
        break;

      case 'improve':
        if (!content || content.trim().length < 10) {
          return NextResponse.json(
            { success: false, message: 'Please provide content to improve (minimum 10 characters).' },
            { status: 400 }
          );
        }
        prompt = `Analyze the following text and provide specific suggestions for improvement in terms of clarity, structure, grammar, and engagement. Format your response as bullet points:\n\n${content}`;
        break;

      case 'chat':
        if (!message || message.trim().length < 1) {
          return NextResponse.json(
            { success: false, message: 'Please provide a message for the chat.' },
            { status: 400 }
          );
        }
        prompt = `You are a helpful AI assistant for a note-taking app. The user is asking: "${message}". Provide a helpful, concise response. If they're asking about note-taking, writing, or productivity, give specific actionable advice.`;
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action. Supported actions: rewrite, translate, improve, chat' },
          { status: 400 }
        );
    }

    console.log(`Attempting to call Gemini API for action: ${action}`);
    
    // Retry logic for overloaded model
    let retries = 2;
    let result;
    
    while (retries >= 0) {
      try {
        result = await model.generateContent(prompt);
        console.log('Gemini API call successful');
        break;
      } catch (retryError) {
        if (retryError.status === 503 && retries > 0) {
          console.log(`Model overloaded, retrying... (${retries} attempts left)`);
          retries--;
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw retryError; // Re-throw if not 503 or no retries left
      }
    }
    
    const response = await result.response;
    const aiResponse = response.text();
    console.log(`${action} response generated:`, aiResponse.substring(0, 100) + '...');

    return NextResponse.json({ 
      success: true, 
      response: aiResponse,
      action: action 
    });

  } catch (error) {
    console.log('Gemini API Error:', error);
    console.log('Error type:', error.constructor.name);
    
    // Check for specific error types - order matters!
    if (error.status === 503 || error.message.includes('overloaded')) {
      return NextResponse.json(
        { success: false, message: 'AI service is temporarily busy. Please try again in a few moments. 🔄', error: error.message },
        { status: 503 }
      );
    }
    
    if (error.message.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { success: false, message: 'Invalid Gemini API key. Please check your API key configuration.', error: error.message },
        { status: 401 }
      );
    }
    
    if (error.message.includes('fetch failed')) {
      return NextResponse.json(
        { success: false, message: 'Network error: Unable to connect to Gemini API. Please check your internet connection and API key.', error: error.message },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Something went wrong with the AI assistant.', error: error.message },
      { status: 500 }
    );
  }
}
