import { Todo, CreateTodoDto, UpdateTodoDto } from '../types'

// Standardized API URL approach:
// - In Kubernetes: Use internal service name for server-side calls
// - In Docker Compose: Use service name for server-side calls  
// - In Browser: Use relative path for client-side calls
function getApiBaseUrl(): string {
  // Server-side rendering (Node.js context)
  if (typeof window === 'undefined') {
    // Use environment-specific internal URL
    return process.env.API_BASE_URL_INTERNAL || 'http://todo-backend:8080'
  }
  // Client-side (browser context) - always use relative path
  return '/api'
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiBaseUrl = getApiBaseUrl()
  const url = `${apiBaseUrl}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Add timeout to prevent hanging
    signal: AbortSignal.timeout(10000), // 10 second timeout
    ...options,
  })

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // Ignore JSON parsing errors
    }
    throw new ApiError(errorMessage, response.status)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

async function fetchApiWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchApi<T>(endpoint, options)
    } catch (error) {
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw error
      }
      
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('All retry attempts failed')
}

export const api = {
  todos: {
    list: (): Promise<Todo[]> => 
      fetchApiWithRetry<Todo[]>('/todos'),
    
    create: (todo: CreateTodoDto): Promise<Todo> =>
      fetchApi<Todo>('/todos', {
        method: 'POST',
        body: JSON.stringify(todo),
      }),
    
    update: (id: number, updates: UpdateTodoDto): Promise<Todo> =>
      fetchApi<Todo>(`/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    
    delete: (id: number): Promise<void> =>
      fetchApi<void>(`/todos/${id}`, {
        method: 'DELETE',
      }),
  },
  
  health: (): Promise<{ status: string; timestamp: string; uptime: number }> =>
    fetchApi<{ status: string; timestamp: string; uptime: number }>('/healthz'),
}