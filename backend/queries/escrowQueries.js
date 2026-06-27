const pool = require('../shared/db/pool');

// Get escrow by ID
const getEscrowById = async (escrowId) => {
  const query = 'SELECT * FROM escrow_transactions WHERE id = $1';
  const result = await pool.query(query, [escrowId]);
  return result.rows[0];
};

// Deposit (pending_deposit → funded)
const depositFunds = async (escrowId, amount) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'pending_deposit') {
    throw new Error(`Cannot deposit: current status is ${escrow.status}`);
  }

  if (amount) {
    const query = 'UPDATE escrow_transactions SET status = $1, amount = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, ['funded', amount, escrowId]);
    return result.rows[0];
  } else {
    const query = 'UPDATE escrow_transactions SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, ['funded', escrowId]);
    return result.rows[0];
  }
};

// Submit work (funded → submitted, or re-submit from submitted)
const submitWork = async (escrowId, { message, fileName } = {}) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'funded' && escrow.status !== 'submitted') {
    throw new Error(`Cannot submit work: current status is ${escrow.status}`);
  }

  const query = 'UPDATE escrow_transactions SET status = $1, submission_message = $2, submitted_file_name = $3 WHERE id = $4 RETURNING *';
  const result = await pool.query(query, ['submitted', message || null, fileName || null, escrowId]);
  return result.rows[0];
};

// Release (submitted → released)
const releaseEscrow = async (escrowId) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'submitted') {
    throw new Error(`Cannot release: current status is ${escrow.status}`);
  }

  const query = 'UPDATE escrow_transactions SET status = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, ['released', escrowId]);
  return result.rows[0];
};

// Dispute (funded or submitted → disputed)
const disputeEscrow = async (escrowId) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (!['funded', 'submitted'].includes(escrow.status)) {
    throw new Error(`Cannot dispute: current status is ${escrow.status}`);
  }

  const query = 'UPDATE escrow_transactions SET status = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, ['disputed', escrowId]);
  return result.rows[0];
};

// Get escrow by job ID
const getEscrowByJob = async (jobId) => {
  const query = 'SELECT * FROM escrow_transactions WHERE job_id = $1';
  const result = await pool.query(query, [jobId]);
  return result.rows[0] || null;
};

// List escrows by user (as client or freelancer)
const getEscrowsByUser = async (userId) => {
  const query = 'SELECT * FROM escrow_transactions WHERE client_id = $1 OR freelancer_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Get disputes involving the user (as client or freelancer)
const getDisputesByUser = async (userId) => {
  const query = `
    SELECT d.id, d.escrow_id, d.reason, d.decision, d.flagged_by,
           e.job_id, e.amount, e.status AS escrow_status,
           j.title AS job_title
    FROM disputes d
    JOIN escrow_transactions e ON d.escrow_id = e.id
    JOIN jobs j ON e.job_id = j.id
    WHERE e.client_id = $1 OR e.freelancer_id = $1
    ORDER BY d.id DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  getEscrowById,
  getEscrowByJob,
  getEscrowsByUser,
  depositFunds,
  submitWork,
  releaseEscrow,
  disputeEscrow,
  getDisputesByUser
};