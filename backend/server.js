const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

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
