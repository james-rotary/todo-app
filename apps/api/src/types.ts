export interface CreateTodoDto {
  title: string
}

export interface UpdateTodoDto {
  title?: string
  completed?: boolean
}

export interface TodoDto {
  id: number
  title: string
  completed: boolean
  createdAt: string
}