import { ref } from 'vue'

export function useOpenAI(apiKey: string) {
  const ApiResponse = ref(null)
  const ApiError = ref<Error | null>(null)
  const loading = ref(false)

  const sendRequest = async (prompt: string) => {
    loading.value = true
    ApiError.value = null
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          max_tokens: 100,
        }),
      })
      const result = await response.json()
      ApiResponse.value = result
    } catch (err) {
        ApiError.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return {
    ApiResponse,
    ApiError,
    loading,
    sendRequest,
  }
}
