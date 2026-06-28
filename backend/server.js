const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const express = require('express')
const path = require('path')
const cors = require('cors')
require('dotenv').config()
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err)
})

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason)
})

const pool = require('./db') // <-- add this

// Routes
const authRoutes = require('./routes/authRoutes')
const proposalRoutes = require('./routes/proposalRoutes')
const hireRoutes = require('./routes/hireRoutes')
const escrowRoutes = require('./routes/escrowRoutes')
const jobRoutes = require('./routes/jobRoutes')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/hire', hireRoutes)
app.use('/api/escrow', escrowRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/chapa', require('./routes/chapaRoutes'))
app.use('/api/profile', require('./routes/profileRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

// 404 handler — return JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Central error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 4000

// Connect to DB first, then start server
pool.connect()
  .then(client => {
    client.release()
    console.log('Database connected')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  })
  setInterval(() => {}, 1 << 30)
