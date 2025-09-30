'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { api } from '../../lib/api'
import { CreateTodoDto, UpdateTodoDto } from '../../types'

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string
  
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required')
  }

  try {
    const todoData: CreateTodoDto = {
      title: title.trim()
    }
    
    await api.todos.create(todoData)
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to create todo:', error)
    throw new Error('Failed to create todo')
  }
}

export async function toggleTodo(id: number, completed: boolean) {
  try {
    const updateData: UpdateTodoDto = {
      completed: !completed
    }
    
    await api.todos.update(id, updateData)
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to toggle todo:', error)
    throw new Error('Failed to toggle todo')
  }
}

export async function deleteTodo(id: number) {
  try {
    await api.todos.delete(id)
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to delete todo:', error)
    throw new Error('Failed to delete todo')
  }
}