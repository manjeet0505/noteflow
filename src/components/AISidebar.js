'use client'

import { useState } from 'react'

export default function AISidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hi! I\'m your writing assistant. I can help guide you on how to use this website and provide tips for writing better notes on any topic. Ask me anything!'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleQuickTip = (topic) => {
    const tipMessages = {
      'getting-started': 'Welcome to your notes app! Here\'s how to get started:\n\n1. Click "Create New Note" to start writing\n2. Use the voice input button 🎙️ to dictate your notes\n3. Try the AI writing tools (Rewrite, Translate, Improve) to enhance your content\n4. Use the Summarize feature to get quick summaries\n\nWhat would you like to know more about?',
      'better-notes': 'Here are tips for writing better notes:\n\n📝 **Structure**: Use clear headings and bullet points\n🎯 **Be Specific**: Include dates, names, and key details\n💡 **Use Keywords**: Highlight important terms\n🔗 **Connect Ideas**: Link related concepts\n📱 **Regular Review**: Revisit and update your notes\n\nWhat type of notes are you planning to write?',
      'study-tips': 'Effective study note techniques:\n\n🧠 **Active Recall**: Write summaries without looking\n📊 **Mind Maps**: Create visual connections\n⏰ **Spaced Repetition**: Review at intervals\n❓ **Question Method**: Turn notes into questions\n🎨 **Visual Aids**: Add diagrams and charts\n\nWhich subject are you studying?'
    }

    const tipMessage = {
      id: Date.now(),
      type: 'assistant',
      content: tipMessages[topic] || 'How can I help you with your note-taking?'
    }
    setMessages(prev => [...prev, tipMessage])
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          message: userMessage.content
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.response
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Sorry, I encountered an error: ${data.message}`
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.'
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Toggle Button - Fixed position */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isOpen ? 'right-80' : 'right-4'
        } bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl`}
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white/10 backdrop-blur-md border-l border-white/20 transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Writing Assistant</h2>
              <p className="text-white/70 text-sm">Your guide to better note-taking</p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 border-b border-white/20">
          <h3 className="text-white font-medium mb-3">Quick Tips</h3>
          <div className="space-y-2">
            <button 
              onClick={() => handleQuickTip('getting-started')}
              className="w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors border border-white/20 text-left"
            >
              🚀 Getting Started
            </button>
            <button 
              onClick={() => handleQuickTip('better-notes')}
              className="w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors border border-white/20 text-left"
            >
              📝 Better Notes Tips
            </button>
            <button 
              onClick={() => handleQuickTip('study-tips')}
              className="w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors border border-white/20 text-left"
            >
              🎓 Study Techniques
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white border border-white/20 p-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="spinner w-4 h-4"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for writing tips or guidance..."
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}
