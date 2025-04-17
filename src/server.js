/**
 * The starting point of the application.
 *
 * @author Julia Lind
 * @version 1.0.0
 */
import fs from 'fs/promises'
import { connectDB } from './config/mongoose.js'
import { createApp } from './config/create-app.js'
// to be exported for testing purposes
let app, connection, server

try {
  // Connect to MongoDB.
  connection = await connectDB(process.env.DB_CONNECTION_STRING)
  process.env.ACCESS_TOKEN_SECRET = await fs.readFile(process.env.AUTH_TOKEN_SECRET_PATH, 'utf-8')

  const app = createApp()

  // Starts the HTTP server listening for connections.
  server = app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}

export { app, connection, server }
