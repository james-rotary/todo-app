import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { healthCheck, readinessCheck } from './health'
import todosRouter from './routes/todos'
import { errorHandler } from './middleware/error'
import { prisma } from './lib/prisma'

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

// Health endpoints
app.get('/healthz', healthCheck)
app.get('/readyz', readinessCheck)

// API routes
app.use('/todos', todosRouter)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

let server: ReturnType<typeof app.listen>

const startServer = async (): Promise<void> => {
  try {
    // Ensure database connection
    await prisma.$connect()
    console.log('Connected to database')

    server = app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/healthz`)
      console.log(`Readiness check: http://localhost:${PORT}/readyz`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  console.log('Shutting down gracefully...')
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed')
    })
  }
  
  await prisma.$disconnect()
  console.log('Database disconnected')
  
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Start the server
startServer()