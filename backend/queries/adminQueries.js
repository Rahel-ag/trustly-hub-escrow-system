const pool = require('../shared/db/pool');

// ── Users ────────────────────────────────────────────────────────────────────

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, email, role, created_at FROM users ORDER BY created_at DESC`
  );
  return result.rows;
};

const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, email, role, created_at FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
};

const updateUserRole = async (userId, role) => {
  const validRoles = ['client', 'freelancer', 'admin'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }
  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, email, role, created_at`,
    [role, userId]
  );
  return result.rows[0];
};

const deleteUser = async (userId) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id`,
    [userId]
  );
  return result.rows[0];
};

// ── Jobs ─────────────────────────────────────────────────────────────────────

const getAllJobs = async () => {
  const result = await pool.query(
    `SELECT j.id, j.title, j.description, j.budget, j.status, j.client_id,
            u.email AS client_email
     FROM jobs j
     JOIN users u ON j.client_id = u.id
     ORDER BY j.id DESC`
  );
  return result.rows;
};

const deleteJob = async (jobId) => {
  const result = await pool.query(
    `DELETE FROM jobs WHERE id = $1 RETURNING id`,
    [jobId]
  );
  return result.rows[0];
};

// ── Escrow ───────────────────────────────────────────────────────────────────

const getAllEscrow = async () => {
  const result = await pool.query(
    `SELECT e.id, e.job_id, e.amount, e.status, e.created_at,
            c.email AS client_email,
            f.email AS freelancer_email,
            j.title  AS job_title
     FROM escrow_transactions e
     JOIN users c ON e.client_id     = c.id
     JOIN users f ON e.freelancer_id = f.id
     JOIN jobs  j ON e.job_id        = j.id
     ORDER BY e.created_at DESC`
  );
  return result.rows;
};

const updateEscrowStatus = async (escrowId, status) => {
  const validStatuses = [
    'pending_deposit', 'locked', 'work_submitted',
    'disputed', 'approved', 'rejected',
  ];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  const result = await pool.query(
    `UPDATE escrow_transactions SET status = $1 WHERE id = $2
     RETURNING id, job_id, amount, status, created_at`,
    [status, escrowId]
  );
  return result.rows[0];
};

// ── Disputes ─────────────────────────────────────────────────────────────────

const getAllDisputes = async () => {
  const result = await pool.query(
    `SELECT d.id, d.escrow_id, d.reason, d.decision, d.flagged_by,
            u.email AS flagged_by_email,
            e.amount, e.status AS escrow_status
     FROM disputes d
     JOIN users               u ON d.flagged_by = u.id
     JOIN escrow_transactions e ON d.escrow_id  = e.id
     ORDER BY d.id DESC`
  );
  return result.rows;
};

const resolveDispute = async (disputeId, decision) => {
  if (!decision || decision.trim() === '') {
    throw new Error('Decision text is required');
  }
  const result = await pool.query(
    `UPDATE disputes SET decision = $1 WHERE id = $2
     RETURNING id, escrow_id, reason, decision, flagged_by`,
    [decision, disputeId]
  );
  return result.rows[0];
};

// ── Stats ─────────────────────────────────────────────────────────────────────

const getDashboardStats = async () => {
  const [users, jobs, escrow, disputes] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE role = 'client')     AS clients,
                       COUNT(*) FILTER (WHERE role = 'freelancer') AS freelancers,
                       COUNT(*) FILTER (WHERE role = 'admin')      AS admins
                FROM users`),
    pool.query(`SELECT COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE status = 'open')   AS open,
                       COUNT(*) FILTER (WHERE status = 'closed') AS closed
                FROM jobs`),
    pool.query(`SELECT COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE status = 'pending_deposit') AS pending,
                       COUNT(*) FILTER (WHERE status = 'locked')          AS locked,
                       COUNT(*) FILTER (WHERE status = 'approved')        AS approved,
                       COUNT(*) FILTER (WHERE status = 'disputed')        AS disputed,
                       COALESCE(SUM(amount), 0)                           AS total_value
                FROM escrow_transactions`),
    pool.query(`SELECT COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE decision IS NULL)     AS pending,
                       COUNT(*) FILTER (WHERE decision IS NOT NULL) AS resolved
                FROM disputes`),
  ]);

  return {
    users:    users.rows[0],
    jobs:     jobs.rows[0],
    escrow:   escrow.rows[0],
    disputes: disputes.rows[0],
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllJobs,
  deleteJob,
  getAllEscrow,
  updateEscrowStatus,
  getAllDisputes,
  resolveDispute,
  getDashboardStats,
};
