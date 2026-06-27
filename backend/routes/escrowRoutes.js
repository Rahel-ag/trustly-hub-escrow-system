const express = require('express');
const router = express.Router();
const escrowQueries = require('../queries/escrowQueries');
const pool = require('../shared/db/pool');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config — store uploaded work files in backend/uploads/
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// JWT verification middleware
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

// GET /api/escrow/my
router.get('/my', verifyToken, async (req, res) => {
  try {
    const escrows = await escrowQueries.getEscrowsByUser(req.user.id);
    res.json({ escrows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/escrow/job/:jobId
router.get('/job/:jobId', verifyToken, async (req, res) => {
  try {
    const escrow = await escrowQueries.getEscrowByJob(req.params.jobId);
    if (!escrow) return res.status(404).json({ error: 'Escrow not found for this job' });
    res.json({ escrow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/deposit — deposit by jobId (frontend-facing)
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { jobId, amount } = req.body;
    if (!jobId || !amount) return res.status(400).json({ error: 'jobId and amount required' });

    const escrow = await escrowQueries.getEscrowByJob(jobId);
    if (!escrow) return res.status(404).json({ error: 'Escrow not found for this job' });

    if (req.user.id !== escrow.client_id) {
      return res.status(403).json({ error: 'Only client can deposit funds' });
    }

    const updated = await escrowQueries.depositFunds(escrow.id, amount);
    res.json({ message: 'Funds deposited successfully', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot deposit')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/escrow/disputes/my — get disputes for current user
router.get('/disputes/my', verifyToken, async (req, res) => {
  try {
    const disputes = await escrowQueries.getDisputesByUser(req.user.id);
    res.json({ disputes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/escrow/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    // Verify user is involved in this escrow
    if (req.user.id !== escrow.client_id && req.user.id !== escrow.freelancer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(escrow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/deposit
router.post('/:id/deposit', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    // Only client can deposit
    if (req.user.id !== escrow.client_id) {
      return res.status(403).json({ error: 'Only client can deposit funds' });
    }
    
    const updated = await escrowQueries.depositFunds(id);
    res.json({ message: 'Funds deposited successfully', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot deposit')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/submit-work
router.post('/:id/submit-work', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);

    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

    if (req.user.id !== escrow.freelancer_id) {
      return res.status(403).json({ error: 'Only freelancer can submit work' });
    }

    const message = req.body.message || '';
    const fileName = req.file ? req.file.filename : null;

    const updated = await escrowQueries.submitWork(id, { message, fileName });
    await pool.query(
      'UPDATE jobs SET work_submitted = true, escrow_status = $1 WHERE id = $2',
      ['submitted', escrow.job_id]
    );
    res.json({ message: 'Work submitted successfully', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot submit')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/submit — frontend-facing alias for submit-work
router.post('/:id/submit', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);

    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

    if (req.user.id !== escrow.freelancer_id) {
      return res.status(403).json({ error: 'Only freelancer can submit work' });
    }

    const message = req.body.message || '';
    const fileName = req.file ? req.file.filename : null;

    const updated = await escrowQueries.submitWork(id, { message, fileName });
    await pool.query(
      'UPDATE jobs SET work_submitted = true, escrow_status = $1 WHERE id = $2',
      ['submitted', escrow.job_id]
    );
    res.json({ message: 'Work submitted successfully', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot submit')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/approve
router.post('/:id/approve', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    // Only client can approve
    if (req.user.id !== escrow.client_id) {
      return res.status(403).json({ error: 'Only client can approve work' });
    }
    
    const updated = await escrowQueries.releaseEscrow(id);
    res.json({ message: 'Work approved, funds released', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot release')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/reject
router.post('/:id/reject', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    // Only client can reject
    if (req.user.id !== escrow.client_id) {
      return res.status(403).json({ error: 'Only client can reject work' });
    }
    
    const updated = await escrowQueries.disputeEscrow(id);
    res.json({ message: 'Work rejected', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot dispute')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/release — frontend-facing alias for approve
router.post('/:id/release', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);

    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

    if (req.user.id !== escrow.client_id) {
      return res.status(403).json({ error: 'Only client can release payment' });
    }

    const updated = await escrowQueries.releaseEscrow(id);
    res.json({ message: 'Payment released successfully', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot release')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/escrow/:id/dispute — raise dispute with reason, description, optional evidence
const disputeUpload = multer({ storage });
router.post('/:id/dispute', verifyToken, disputeUpload.single('evidence'), async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);

    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

    if (req.user.id !== escrow.client_id && req.user.id !== escrow.freelancer_id) {
      return res.status(403).json({ error: 'Only parties involved can dispute' });
    }

    const reason = req.body.reason || 'Not specified';
    const description = req.body.description || '';
    const evidenceFile = req.file ? req.file.filename : null;

    const fullReason = evidenceFile
      ? `Reason: ${reason}\nDescription: ${description}\nEvidence: ${evidenceFile}`
      : `Reason: ${reason}\nDescription: ${description}`;

    await pool.query(
      'INSERT INTO disputes (escrow_id, reason, flagged_by) VALUES ($1, $2, $3)',
      [id, fullReason, req.user.id]
    );

    const updated = await escrowQueries.disputeEscrow(id);
    res.json({ message: 'Dispute raised successfully', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot dispute')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;