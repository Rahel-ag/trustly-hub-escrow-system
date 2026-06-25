const pool = require('../shared/db/pool');

// Get escrow by ID
const getEscrowById = async (escrowId) => {
  const query = 'SELECT * FROM escrow_transactions WHERE id = $1';
  const result = await pool.query(query, [escrowId]);
  return result.rows[0];
};

// Deposit (pending_deposit → locked)
const depositFunds = async (escrowId) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'pending_deposit') {
    throw new Error(`Cannot deposit: current status is ${escrow.status}`);
  }
  
  const query = 'UPDATE escrow_transactions SET status = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, ['locked', escrowId]);
  return result.rows[0];
};

// Submit work (locked → work_submitted)
const submitWork = async (escrowId) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'locked') {
    throw new Error(`Cannot submit work: current status is ${escrow.status}`);
  }
  
  const query = 'UPDATE escrow_transactions SET status = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, ['work_submitted', escrowId]);
  return result.rows[0];
};

// Approve (work_submitted → approved)
const approveEscrow = async (escrowId) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'work_submitted') {
    throw new Error(`Cannot approve: current status is ${escrow.status}`);
  }
  
  const query = 'UPDATE escrow_transactions SET status = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, ['approved', escrowId]);
  return result.rows[0];
};

// Reject (work_submitted → rejected)
const rejectEscrow = async (escrowId) => {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'work_submitted') {
    throw new Error(`Cannot reject: current status is ${escrow.status}`);
  }
  
  const query = 'UPDATE escrow_transactions SET status = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, ['rejected', escrowId]);
  return result.rows[0];
};

module.exports = {
  getEscrowById,
  depositFunds,
  submitWork,
  approveEscrow,
  rejectEscrow
};