import { Todo, CreateTodoDto, UpdateTodoDto } from '../types'

// Use Docker service name since we're running in containers
const API_BASE_URL = 'http://api:8080'

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
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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

export const api = {
  todos: {
    list: (): Promise<Todo[]> => 
      fetchApi<Todo[]>('/todos'),
    
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