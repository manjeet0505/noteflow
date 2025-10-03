import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    const info = {
      hasKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      model: modelName,
    }

    // Perform a very small probe call
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: modelName })
    const result = await model.generateContent('Ping. Respond with the single word: Pong.')
    const response = await result.response

    return NextResponse.json({
      ok: true,
      info,
      result: { model: result.model, text: result.text },
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown error',
      hasKey: !!process.env.GEMINI_API_KEY,
    }, { status: 500 })
  }
}


