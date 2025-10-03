export function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.trim().length < 10) {
    throw new Error('OPENROUTER_API_KEY missing or invalid')
  }
  const model = (process.env.OPENROUTER_MODEL && process.env.OPENROUTER_MODEL.trim()) || 'openai/gpt-4o-mini'
  return { apiKey, model }
}

export async function openRouterChat(messages, { temperature = 0.3, max_tokens = 800 } = {}) {
  const { apiKey, model } = getOpenRouterConfig()
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    })
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`OpenRouter HTTP ${response.status}: ${errText || response.statusText}`)
  }

  const json = await response.json()
  const text = json?.choices?.[0]?.message?.content || ''
  if (!text) {
    throw new Error('OpenRouter returned empty content')
  }
  return { model, text }
}


