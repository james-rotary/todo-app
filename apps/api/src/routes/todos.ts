import { Request, Response, Router } from 'express'
import { prisma } from '../lib/prisma'
import { CreateTodoDto, UpdateTodoDto, TodoDto } from '../types'

const router = Router()

// GET /todos - List all todos
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const todoDtos: TodoDto[] = todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString()
    }))

    res.json(todoDtos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})

// POST /todos - Create a new todo
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title }: CreateTodoDto = req.body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ error: 'Title is required and must be a non-empty string' })
      return
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim()
      }
    })

    const todoDto: TodoDto = {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString()
    }

    res.status(201).json(todoDto)
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

// PATCH /todos/:id - Update or toggle a todo
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id!)
    const updates: UpdateTodoDto = req.body

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid todo ID' })
      return
    }

    // Check if todo exists
    const existingTodo = await prisma.todo.findUnique({
      where: { id }
    })

    if (!existingTodo) {
      res.status(404).json({ error: 'Todo not found' })
      return
    }

    // Validate updates
    const updateData: { title?: string; completed?: boolean } = {}
    
    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
        res.status(400).json({ error: 'Title must be a non-empty string' })
        return
      }
      updateData.title = updates.title.trim()
    }
    
    if (updates.completed !== undefined) {
      if (typeof updates.completed !== 'boolean') {
        res.status(400).json({ error: 'Completed must be a boolean' })
        return
      }
      updateData.completed = updates.completed
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData
    })

    const todoDto: TodoDto = {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString()
    }

    res.json(todoDto)
  } catch (error) {
    console.error('Error updating todo:', error)
    res.status(500).json({ error: 'Failed to update todo' })
  }
})

// DELETE /todos/:id - Delete a todo
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id!)

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid todo ID' })
      return
    }

    // Check if todo exists
    const existingTodo = await prisma.todo.findUnique({
      where: { id }
    })

    if (!existingTodo) {
      res.status(404).json({ error: 'Todo not found' })
      return
    }

    await prisma.todo.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting todo:', error)
    res.status(500).json({ error: 'Failed to delete todo' })
  }
})

export default router