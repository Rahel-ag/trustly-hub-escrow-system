const express = require('express');
const router = express.Router();
const escrowQueries = require('../queries/escrowQueries');
const pool = require('../shared/db/pool');
const jwt = require('jsonwebtoken');

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
router.post('/:id/submit-work', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await escrowQueries.getEscrowById(id);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    // Only freelancer can submit work
    if (req.user.id !== escrow.freelancer_id) {
      return res.status(403).json({ error: 'Only freelancer can submit work' });
    }
    
    const updated = await escrowQueries.submitWork(id);
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
    
    const updated = await escrowQueries.approveEscrow(id);
    res.json({ message: 'Work approved, funds released', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot approve')) {
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
    
    const updated = await escrowQueries.rejectEscrow(id);
    res.json({ message: 'Work rejected', escrow: updated });
  } catch (error) {
    if (error.message.includes('Cannot reject')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;