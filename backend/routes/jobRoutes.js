const express = require('express');
const router = express.Router();
const pool = require('../shared/db/pool');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. Post a new job
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    const clientId = req.user.id;

    if (!title || !description || !budget) return res.status(400).json({ error: 'Missing required fields' });

    const newJob = await pool.query(
      'INSERT INTO jobs (title, description, budget, client_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, budget, clientId, 'open']
    );
    res.status(201).json({ message: 'Job posted successfully', job: newJob.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Fetch all open jobs (for freelancer browsing)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs WHERE LOWER(status) = 'open'");
    res.json({ success: true, data: { jobs: result.rows } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Fetch client's own posted jobs
router.get('/my', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE client_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Fetch single job specification data details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Freelancer submit work deliverables endpoint logic pipeline
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const { notes, fileName, fileSize } = req.body;

    const result = await pool.query(
      `UPDATE jobs 
       SET status = 'Awaiting Review',
           work_submitted = TRUE,
           freelancer_notes = $1,
           submitted_file_name = $2,
           submitted_file_size = $3,
           escrow_status = 'Awaiting Approval'
       WHERE id = $4
       RETURNING *`,
      [notes, fileName || 'project_final_delivery.zip', fileSize || '4.2 MB', jobId]
    );

    res.json({ success: true, message: 'Deliverables recorded successfully in database.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
