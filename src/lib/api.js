const API_BASE_URL = '/api/notes'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export const api = {
  async getNotes() {
    try {
      console.log('📝 Fetching notes...')
      const headers = getAuthHeaders()
      console.log('📤 Request headers:', headers)
      
      const response = await fetch(API_BASE_URL, {
        headers,
      })
      console.log('📥 Response status:', response.status)
      
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🚫 Unauthorized, redirecting to login')
          // Redirect to login if unauthorized
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        throw new Error(data.error || 'Failed to fetch notes')
      }
      
      return data.data
    } catch (error) {
      console.error('❌ Error fetching notes:', error)
      throw error
    }
  },

  async createNote(noteData) {
    try {
      console.log('📝 Creating note:', noteData)
      const headers = getAuthHeaders()
      console.log('📤 Request headers:', headers)
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(noteData),
      })
      
      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🚫 Unauthorized, redirecting to login')
          // Redirect to login if unauthorized
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        throw new Error(data.error || 'Failed to create note')
      }
      
      return data.data
    } catch (error) {
      console.error('❌ Error creating note:', error)
      throw error
    }
  },

  async deleteNote(noteId) {
    try {
      console.log('🗑️ Deleting note:', noteId)
      const headers = getAuthHeaders()
      console.log('📤 Request headers:', headers)
      
      const response = await fetch(`${API_BASE_URL}/${noteId}`, {
        method: 'DELETE',
        headers,
      })
      
      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🚫 Unauthorized, redirecting to login')
          // Redirect to login if unauthorized
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        throw new Error(data.error || 'Failed to delete note')
      }
      
      return data
    } catch (error) {
      console.error('❌ Error deleting note:', error)
      throw error
    }
  },

  // Google OAuth API
  async googleAuth(token) {
    try {
      console.log('🔐 Google OAuth API call')
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      
      console.log('📥 Google OAuth response status:', response.status)
      const data = await response.json()
      console.log('📥 Google OAuth response data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed')
      }
      
      return data
    } catch (error) {
      console.error('❌ Google OAuth error:', error)
      throw error
    }
  }
} 