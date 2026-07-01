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

const ensureSchema = async () => {
  const client = await pool.connect()
  try {
    // Check if users table exists
    const { rows } = await client.query(`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')
    `)
    const tablesExist = rows[0].exists

    if (!tablesExist) {
      // Fresh DB — run full migrations
      const { default: Runner } = await import('node-pg-migrate')
      await Runner({
        dbClient: client,
        dir: path.join(__dirname, 'migrations'),
        direction: 'up',
        migrationsTable: 'pgmigrations',
        count: Infinity,
      })
      console.log('Full migrations applied')
    } else {
      // Existing DB — apply only idempotent schema patches

      // Enum values
      await client.query(`
        ALTER TYPE escrow_status ADD VALUE IF NOT EXISTS 'funded';
        ALTER TYPE escrow_status ADD VALUE IF NOT EXISTS 'submitted';
        ALTER TYPE escrow_status ADD VALUE IF NOT EXISTS 'released';
      `).catch(() => {})

      // Columns on escrow_transactions
      await client.query(`
        ALTER TABLE escrow_transactions 
        ADD COLUMN IF NOT EXISTS submission_message TEXT,
        ADD COLUMN IF NOT EXISTS submitted_file_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(255)
      `)

      // Columns on users
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)
      `)

      // Columns on jobs (from migration 004)
      await client.query(`
        ALTER TABLE jobs 
        ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS freelancer_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS contract_budget NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS work_submitted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS freelancer_notes TEXT,
        ADD COLUMN IF NOT EXISTS submitted_file_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS submitted_file_size VARCHAR(50),
        ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(50) DEFAULT 'None'
      `)

      // Columns on proposals (from migration 004)
      await client.query(`
        ALTER TABLE proposals
        ADD COLUMN IF NOT EXISTS bid_price NUMERIC(12,2),
        ADD COLUMN IF NOT EXISTS bid_amount NUMERIC(12,2),
        ADD COLUMN IF NOT EXISTS cover_letter TEXT
      `)

      // Missing tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS payout_configs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          method TEXT NOT NULL,
          account TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)

      await client.query(`
        CREATE TABLE IF NOT EXISTS saved_jobs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, job_id)
        )
      `)

      console.log('Schema patches applied')
    }
  } finally {
    client.release()
  }
}

pool.connect()
  .then(async (client) => {
    client.release()
    console.log('Database connected')
    await ensureSchema()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  })
