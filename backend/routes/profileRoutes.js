const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../src/middleware');
const pool = require('../shared/db/pool');

// All profile routes require authentication
router.use(authMiddleware);

// ── GET /api/profile ──────────────────────────────────────────────────────────
// Returns the logged-in user's profile + payout config
router.get('/', async (req, res) => {
  try {
    const userRes = await pool.query(
      `SELECT id, email, role, full_name, phone, bio, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];

    // Fetch payout config if table exists
    let payout = null;
    try {
      const payoutRes = await pool.query(
        `SELECT method, account FROM payout_configs WHERE user_id = $1`,
        [req.user.id]
      );
      if (payoutRes.rows.length > 0) payout = payoutRes.rows[0];
    } catch (_) {
      // payout_configs table may not exist yet
    }

    res.json({
      user: {
        id:        user.id,
        email:     user.email,
        role:      user.role,
        fullName:  user.full_name,
        phone:     user.phone,
        bio:       user.bio,
        createdAt: user.created_at,
      },
      payout,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/profile ────────────────────────────────────────────────────────
// Update name, phone, bio
router.patch('/', async (req, res) => {
  try {
    const { fullName, phone, bio } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone     = COALESCE($2, phone),
           bio       = COALESCE($3, bio)
       WHERE id = $4
       RETURNING id, email, role, full_name, phone, bio, created_at`,
      [fullName || null, phone || null, bio || null, req.user.id]
    );

    const u = result.rows[0];
    res.json({
      message: 'Profile updated',
      user: {
        id:        u.id,
        email:     u.email,
        role:      u.role,
        fullName:  u.full_name,
        phone:     u.phone,
        bio:       u.bio,
        createdAt: u.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/profile/payout ─────────────────────────────────────────────────
// Upsert payout method (Chapa, Telebirr, CBE)
router.patch('/payout', async (req, res) => {
  try {
    const { method, account } = req.body;

    const validMethods = ['chapa', 'telebirr', 'cbe'];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({ error: `method must be one of: ${validMethods.join(', ')}` });
    }
    if (!account || account.trim() === '') {
      return res.status(400).json({ error: 'account is required' });
    }

    // Upsert — insert or update if already exists
    const result = await pool.query(
      `INSERT INTO payout_configs (user_id, method, account)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
         SET method  = EXCLUDED.method,
             account = EXCLUDED.account
       RETURNING method, account`,
      [req.user.id, method, account]
    );

    res.json({ message: 'Payout method saved', payout: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/profile/metrics ──────────────────────────────────────────────────
// Role-based stats cards
router.get('/metrics', async (req, res) => {
  try {
    const { id, role } = req.user;
    let metrics = {};

    if (role === 'freelancer') {
      const [proposals, completed, earned] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM proposals WHERE freelancer_id = $1`, [id]),
        pool.query(`SELECT COUNT(*) FROM escrow_transactions WHERE freelancer_id = $1 AND status = 'approved'`, [id]),
        pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM escrow_transactions WHERE freelancer_id = $1 AND status = 'approved'`, [id]),
      ]);
      metrics = {
        proposalsSent: parseInt(proposals.rows[0].count),
        jobsCompleted: parseInt(completed.rows[0].count),
        totalEarned:   parseFloat(earned.rows[0].total),
      };
    } else {
      // client or admin
      const [jobs, activeEscrow, spent] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM jobs WHERE client_id = $1`, [id]),
        pool.query(`SELECT COUNT(*) FROM escrow_transactions WHERE client_id = $1 AND status IN ('locked','work_submitted','disputed')`, [id]),
        pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM escrow_transactions WHERE client_id = $1 AND status = 'approved'`, [id]),
      ]);
      metrics = {
        jobsPosted:   parseInt(jobs.rows[0].count),
        activeEscrow: parseInt(activeEscrow.rows[0].count),
        totalSpent:   parseFloat(spent.rows[0].total),
      };
    }

    res.json({ metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
