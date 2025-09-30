import { api } from '../../lib/api'
import { Todo } from '../../types'
import { createTodo, toggleTodo, deleteTodo } from './actions'

function TodoItem({ todo }: { todo: Todo }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      border: '1px solid #e1e5e9',
      borderRadius: '8px',
      marginBottom: '8px',
      backgroundColor: '#fff'
    }}>
      <form action={toggleTodo.bind(null, todo.id, todo.completed)} style={{ marginRight: '12px' }}>
        <input
          type="checkbox"
          checked={todo.completed}
          readOnly
          style={{ transform: 'scale(1.2)' }}
        />
      </form>
      
      <div style={{ flex: 1 }}>
        <div style={{
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? '#6b7280' : '#111827',
          fontWeight: '500'
        }}>
          {todo.title}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Created: {new Date(todo.createdAt).toLocaleString()}
        </div>
      </div>
      
      <form action={deleteTodo.bind(null, todo.id)}>
        <button
          type="submit"
          style={{
            padding: '6px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Delete
        </button>
      </form>
    </div>
  )
}

function AddTodoForm() {
  return (
    <form action={createTodo} style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          name="title"
          placeholder="Add a new todo..."
          required
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Add Todo
        </button>
      </div>
    </form>
  )
}

export default async function TodosPage() {
  let todos: Todo[] = []
  let error: string | null = null

  try {
    todos = await api.todos.list()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load todos'
    console.error('Failed to fetch todos:', err)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        Todo List
      </h1>
      
      <AddTodoForm />
      
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '24px'
        }}>
          Error: {error}
        </div>
      )}
      
      {todos.length === 0 && !error ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280',
          fontSize: '18px'
        }}>
          No todos yet. Add one above to get started!
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '16px', color: '#6b7280' }}>
            {todos.length} todo{todos.length !== 1 ? 's' : ''} total, {todos.filter(t => t.completed).length} completed
          </div>
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  )
}