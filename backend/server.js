const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Routes
const authRoutes = require('./routes/authRoutes')
const proposalRoutes = require('./routes/proposalRoutes')
const hireRoutes = require('./routes/hireRoutes')
const escrowRoutes = require('./routes/escrowRoutes') 
const jobRoutes = require('./routes/jobRoutes');
const app = express()
app.use(cors())
app.use(express.json())

// Mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/hire', hireRoutes)
app.use('/api/escrow', escrowRoutes)
app.use('/api/jobs', jobRoutes);

app.use('/api/chapa', require('./routes/chapaRoutes'));


app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

// Central error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})