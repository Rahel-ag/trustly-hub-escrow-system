const pool = require('../shared/db/pool');

const createProposal = async (jobId, freelancerId, coverLetter, bidPrice) => {
  const query = `
    INSERT INTO proposals (job_id, freelancer_id, message, cover_letter, bid_price, status)
    VALUES ($1, $2, $3, $3, $4, 'pending')
    RETURNING id, job_id, freelancer_id, message, cover_letter, bid_price, status;
  `;

  const result = await pool.query(query, [
    jobId,
    freelancerId,
    coverLetter,
    bidPrice || null,
  ]);

  return result.rows[0];
};

const getProposalsByJob = async (jobId) => {
  const query = `
    SELECT
      p.id,
      p.job_id,
      p.freelancer_id,
      p.message,
      COALESCE(p.cover_letter, p.message) as cover_letter,
      p.bid_price,
      p.status,
      u.email as freelancer_email,
      u.name as freelancer_name
    FROM proposals p
    JOIN users u ON p.freelancer_id = u.id
    WHERE p.job_id = $1
    ORDER BY p.id DESC;
  `;

  const result = await pool.query(query, [jobId]);
  return result.rows;
};

const getProposalsByFreelancer = async (freelancerId) => {
  const query = `
    SELECT
      p.id,
      p.job_id,
      p.freelancer_id,
      p.message,
      p.status,
      j.title as job_title,
      j.budget
    FROM proposals p
    JOIN jobs j ON p.job_id = j.id
    WHERE p.freelancer_id = $1
    ORDER BY p.id DESC;
  `;

  const result = await pool.query(query, [freelancerId]);
  return result.rows;
};

const getProposalById = async (proposalId) => {
  const query = `
    SELECT
      p.id,
      p.job_id,
      p.freelancer_id,
      p.message,
      p.status,
      u.email as freelancer_email,
      j.title as job_title,
      j.client_id
    FROM proposals p
    JOIN users u ON p.freelancer_id = u.id
    JOIN jobs j ON p.job_id = j.id
    WHERE p.id = $1;
  `;

  const result = await pool.query(query, [proposalId]);
  return result.rows[0];
};

const updateProposalStatus = async (proposalId, status) => {
  const validStatuses = ['pending', 'accepted', 'rejected'];

  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    );
  }

  const query = `
    UPDATE proposals
    SET status = $1
    WHERE id = $2
    RETURNING id, job_id, freelancer_id, message, status;
  `;

  const result = await pool.query(query, [status, proposalId]);
  return result.rows[0];
};

const deleteProposal = async (proposalId) => {
  const query = 'DELETE FROM proposals WHERE id = $1 RETURNING id;';

  const result = await pool.query(query, [proposalId]);
  return result.rows[0];
};

const checkExistingProposal = async (jobId, freelancerId) => {
  const query = `
    SELECT id
    FROM proposals
    WHERE job_id = $1
      AND freelancer_id = $2;
  `;

  const result = await pool.query(query, [jobId, freelancerId]);
  return result.rows.length > 0;
};

module.exports = {
  createProposal,
  getProposalsByJob,
  getProposalsByFreelancer,
  getProposalById,
  updateProposalStatus,
  deleteProposal,
  checkExistingProposal,
};