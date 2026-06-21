const pool = require('../../shared/db/pool');

async function createJob({ title, description, budget, client_id }) {
  const result = await pool.query(
    `INSERT INTO jobs (title, description, budget, client_id, status)
     VALUES ($1, $2, $3, $4, 'open')
     RETURNING *`,
    [title, description, budget, client_id]
  );
  return result.rows[0];
}

async function listJobs({ page = 1, limit = 10, status = 'open', search = '' }) {
  const offset = (page - 1) * limit;
  const searchFilter = search ? `AND (j.title ILIKE $4 OR j.description ILIKE $4)` : '';
  const params = search ? [status, limit, offset, `%${search}%`] : [status, limit, offset];

  const jobsQuery = `
    SELECT j.id, j.title, j.description, j.budget, j.status,
           u.id AS client_id, u.email AS client_email, COUNT(p.id) AS proposal_count
    FROM jobs j
    JOIN users u ON u.id = j.client_id
    LEFT JOIN proposals p ON p.job_id = j.id
    WHERE j.status = $1 ${searchFilter}
    GROUP BY j.id, u.id, u.email
    ORDER BY j.id DESC
    LIMIT $2 OFFSET $3
  `;

  const countParams = search ? [status, `%${search}%`] : [status];
  const countQuery = `SELECT COUNT(*) FROM jobs j WHERE j.status = $1 ${search ? `AND (j.title ILIKE $2 OR j.description ILIKE $2)` : ''}`;

  const [jobsResult, countResult] = await Promise.all([
    pool.query(jobsQuery, params),
    pool.query(countQuery, countParams),
  ]);

  return {
    jobs: jobsResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit),
  };
}

async function getJobById(jobId) {
  const result = await pool.query(
    `SELECT j.id, j.title, j.description, j.budget, j.status,
            u.id AS client_id, u.email AS client_email, COUNT(p.id) AS proposal_count
     FROM jobs j
     JOIN users u ON u.id = j.client_id
     LEFT JOIN proposals p ON p.job_id = j.id
     WHERE j.id = $1
     GROUP BY j.id, u.id, u.email`,
    [jobId]
  );
  return result.rows[0] || null;
}

async function updateJobStatus(jobId, status, clientId) {
  const result = await pool.query(
    `UPDATE jobs SET status = $1 WHERE id = $2 AND client_id = $3 RETURNING *`,
    [status, jobId, clientId]
  );
  return result.rows[0] || null;
}

async function getJobsByClient(clientId) {
  const result = await pool.query(
    `SELECT j.id, j.title, j.description, j.budget, j.status, COUNT(p.id) AS proposal_count
     FROM jobs j
     LEFT JOIN proposals p ON p.job_id = j.id
     WHERE j.client_id = $1
     GROUP BY j.id
     ORDER BY j.id DESC`,
    [clientId]
  );
  return result.rows;
}

module.exports = { createJob, listJobs, getJobById, updateJobStatus, getJobsByClient };