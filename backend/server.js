const express = require('express');
const cors    = require('cors');
require('dotenv').config();
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

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/jobs',      require('./modules/jobs/jobsRouter'));
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api',           require('./routes/hireRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/profile',   require('./routes/profileRoutes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'TrustlyHub API is running' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
