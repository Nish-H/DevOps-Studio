// Real Claude AI API Integration
// Provides actual Claude AI responses instead of demo mode

interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ClaudeResponse {
  content: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

class ClaudeAPIClient {
  private apiKey: string | null = null
  private apiUrl = 'https://api.anthropic.com/v1/messages'
  
  constructor() {
    // Check for API key in localStorage or environment
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('claude-api-key') || null
    }
  }

  setApiKey(key: string) {
    this.apiKey = key
    if (typeof window !== 'undefined') {
      localStorage.setItem('claude-api-key', key)
    }
  }

  getApiKey(): string | null {
    return this.apiKey
  }

  clearApiKey() {
    this.apiKey = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('claude-api-key')
    }
  }

  async sendMessage(messages: ClaudeMessage[]): Promise<ClaudeResponse> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Please set your API key first.')
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4096,
          messages: messages.filter(m => m.role !== 'system'),
          system: messages.find(m => m.role === 'system')?.content || 'You are Claude, a helpful AI assistant created by Anthropic.'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Claude API Error: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return {
        content: data.content[0]?.text || 'Sorry, I received an empty response.',
        usage: data.usage
      }
    } catch (error) {
      console.error('Claude API Error:', error)
      throw error
    }
  }

  // Test connection with a simple message
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage([
        { role: 'user', content: 'Hello! Please respond with just "Connection successful"' }
      ])
      return response.content.includes('Connection successful')
    } catch (error) {
      console.error('Claude API connection test failed:', error)
      return false
    }
  }

  // Get available models (mock for now, extend later)
  getAvailableModels(): string[] {
    return [
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-opus-20240229'
    ]
  }
}

// Singleton instance
export const claudeAPI = new ClaudeAPIClient()

// Utility function for streaming responses (future enhancement)
export async function* streamClaudeResponse(messages: ClaudeMessage[]): AsyncGenerator<string> {
  // For now, just yield the full response
  // In future, implement real streaming
  try {
    const response = await claudeAPI.sendMessage(messages)
    yield response.content
  } catch (error) {
    yield `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
  }
}

// Demo mode fallback for when API key is not available
export function getDemoResponse(userMessage: string): string {
  const demoResponses = [
    `I understand you said: "${userMessage}". I'm currently in demo mode. To enable real Claude AI responses, please configure your API key in the settings.`,
    `Thanks for your message: "${userMessage}". For full Claude AI functionality, add your Anthropic API key to unlock real conversations.`,
    `I received: "${userMessage}". This is a simulated response. Set up your Claude API key to access the real AI assistant.`,
    `You asked: "${userMessage}". I'm running in demo mode. Configure your Anthropic API key for actual Claude AI responses.`
  ]
  
  return demoResponses[Math.floor(Math.random() * demoResponses.length)]
}

// Check if real Claude AI is available
export function isRealClaudeAvailable(): boolean {
  return claudeAPI.getApiKey() !== null
}