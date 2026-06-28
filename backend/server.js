const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err)
})

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason)
})

const pool = require('./shared/db/pool')

const authRoutes = require('./routes/authRoutes')
const proposalRoutes = require('./routes/proposalRoutes')
const hireRoutes = require('./routes/hireRoutes')
const escrowRoutes = require('./routes/escrowRoutes')
const jobRoutes = require('./routes/jobRoutes')
const adminRoutes = require('./routes/adminRoutes')
const profileRoutes = require('./routes/profileRoutes')
const chapaRoutes = require('./routes/chapaRoutes')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/hire', hireRoutes)
app.use('/api/escrow', escrowRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/chapa', chapaRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 4000

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
