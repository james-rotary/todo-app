export interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

export interface CreateTodoDto {
  title: string
}

export interface UpdateTodoDto {
  title?: string
  completed?: boolean
}