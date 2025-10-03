import { NextResponse } from 'next/server';
import { openRouterChat } from '../../../lib/openrouter';

export async function POST(request) {
  try {
    const { action, content, language, message, context } = await request.json();
    
    // Handle both 'content' and 'message' parameters for compatibility
    const textContent = content || message;

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required (rewrite, translate, improve, chat)' },
        { status: 400 }
      );
    }

    console.log('Calling OpenRouter for AI assistant...');

    let prompt = '';

    // Local helpers for graceful offline fallbacks
    function cleanWhitespace(text) {
      return (text || '').replace(/\s+/g, ' ').trim();
    }
    function sentenceCase(text) {
      return cleanWhitespace(text)
        .split(/([.!?]+)\s*/)
        .reduce((acc, part, idx, arr) => {
          if (!part) return acc;
          if (/[.!?]+/.test(part)) {
            const prev = acc.pop() || '';
            return acc.concat(prev + part + ' ');
          }
          const trimmed = part.trim();
          if (!trimmed) return acc;
          const cased = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          return acc.concat(cased);
        }, [])
        .join(' ')
        .replace(/\s+([.!?])/g, '$1')
        .trim();
    }

    // Language code normalization for translation (kept for prompt clarity)
    const languageMap = {
      english: 'English', spanish: 'Spanish', french: 'French', german: 'German', italian: 'Italian', portuguese: 'Portuguese',
      russian: 'Russian', chinese: 'Chinese', japanese: 'Japanese', korean: 'Korean', arabic: 'Arabic', hindi: 'Hindi',
      'auto-detect': 'English'
    }
    const normalizedLang = language ? (languageMap[language.toLowerCase()] || language) : undefined

    switch (action) {
      case 'rewrite':
        if (!textContent || textContent.trim().length < 3) {
          return NextResponse.json(
            { success: false, message: 'Please provide content to rewrite (minimum 3 characters).' },
            { status: 400 }
          );
        }
        prompt = `Rewrite the following text. Improve clarity, flow, and correctness. Preserve meaning. Return only the rewritten text, no explanations.\n\n${textContent}`;
        break;

      case 'translate':
        if (!textContent || textContent.trim().length < 2) {
          return NextResponse.json(
            { success: false, message: 'Please provide content to translate (minimum 2 characters).' },
            { status: 400 }
          );
        }
        // If no language specified, auto-detect and suggest appropriate language
        if (!language) {
          prompt = `Translate the following text into English. Provide only the translated text, no notes:\n\n${textContent}`;
        } else {
          prompt = `Translate the following text to ${language}. Provide only the translated text, no notes:\n\n${textContent}`;
        }
        break;

      case 'improve':
        if (!textContent || textContent.trim().length < 3) {
          return NextResponse.json(
            { success: false, message: 'Please provide content to improve (minimum 3 characters).' },
            { status: 400 }
          );
        }
        prompt = `Improve the following text: fix grammar, improve clarity, and make it concise. Provide only the improved text, no explanations:\n\n${textContent}`;
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

    console.log(`Attempting to call OpenRouter for action: ${action}`);

    const { text } = await openRouterChat([
      { role: 'system', content: 'You are a helpful writing assistant for a note-taking app.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.4, max_tokens: 800 })
    const aiResponse = (text || '').trim();

    return NextResponse.json({ 
      success: true, 
      response: aiResponse,
      action: action 
    });

  } catch (error) {
    console.log('OpenRouter Error:', error);
    console.log('Error type:', error.constructor.name);
    
    // Check for specific error types - order matters!
    if (error.status === 503 || (error.message || '').toLowerCase().includes('overloaded')) {
      return NextResponse.json(
        { success: false, message: 'AI service is temporarily busy. Please try again in a few moments. 🔄', error: error.message },
        { status: 503 }
      );
    }
    
    if ((error.message || '').includes('API_KEY_INVALID') || (error.message || '').toLowerCase().includes('unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY.', error: error.message },
        { status: 401 }
      );
    }
    
    if ((error.message || '').includes('fetch failed')) {
      return NextResponse.json(
        { success: false, message: 'Network error: Unable to connect to OpenRouter. Please check your internet connection and API key.', error: error.message },
        { status: 503 }
      );
    }
    
    // Final graceful fallback to avoid 500s
    return NextResponse.json(
      { success: true, response: 'I had trouble reaching the AI service. Please try again shortly.', action: 'error-fallback' },
      { status: 200 }
    );
  }
}
