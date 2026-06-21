const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../src/middleware');
const adminQueries = require('../queries/adminQueries');

// All admin routes require a valid JWT AND the admin role
router.use(authMiddleware, adminOnly);

// ── Stats ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Dashboard summary counts
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await adminQueries.getDashboardStats();
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Users ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await adminQueries.getAllUsers();
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Get a single user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await adminQueries.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role
 * Body: { role: 'client' | 'freelancer' | 'admin' }
 */
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });

    const user = await adminQueries.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await adminQueries.updateUserRole(req.params.id, role);
    res.json({ message: 'User role updated', user: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await adminQueries.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await adminQueries.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Jobs ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/jobs
 * List all jobs with client info
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await adminQueries.getAllJobs();
    res.json({ count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/jobs/:id
 * Delete a job
 */
router.delete('/jobs/:id', async (req, res) => {
  try {
    const deleted = await adminQueries.deleteJob(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Escrow ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/escrow
 * List all escrow transactions
 */
router.get('/escrow', async (req, res) => {
  try {
    const transactions = await adminQueries.getAllEscrow();
    res.json({ count: transactions.length, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/escrow/:id/status
 * Override an escrow transaction status
 * Body: { status: 'pending_deposit' | 'locked' | 'work_submitted' | 'disputed' | 'approved' | 'rejected' }
 */
router.patch('/escrow/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const updated = await adminQueries.updateEscrowStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Escrow transaction not found' });

    res.json({ message: 'Escrow status updated', transaction: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Disputes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/disputes
 * List all disputes
 */
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await adminQueries.getAllDisputes();
    res.json({ count: disputes.length, disputes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/disputes/:id/decision
 * Resolve a dispute with an admin decision
 * Body: { decision: 'release_to_freelancer' | 'refund_client' | 'split' | any text }
 */
router.patch('/disputes/:id/decision', async (req, res) => {
  try {
    const { decision } = req.body;
    if (!decision) return res.status(400).json({ error: 'decision is required' });

    const resolved = await adminQueries.resolveDispute(req.params.id, decision);
    if (!resolved) return res.status(404).json({ error: 'Dispute not found' });

    res.json({ message: 'Dispute resolved', dispute: resolved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
