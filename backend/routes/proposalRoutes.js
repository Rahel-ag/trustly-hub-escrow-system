const express = require('express');
const router = express.Router();
const proposalQueries = require('../queries/proposalQueries');
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

router.post('/', verifyToken, async (req, res) => {
  try {
    const { jobId, coverLetter, bidPrice } = req.body;  // ← match frontend fields
    const freelancerId = req.user.id;

    if (!jobId || !coverLetter) return res.status(400).json({ error: 'Missing required fields' });

    const exists = await proposalQueries.checkExistingProposal(jobId, freelancerId);
    if (exists) return res.status(409).json({ error: 'Already proposed for this job' });

    const proposal = await proposalQueries.createProposal(jobId, freelancerId, coverLetter, bidPrice);
    res.status(201).json({ message: 'Proposal created', proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/job/:jobId', verifyToken, async (req, res) => {
  try {
    const proposals = await proposalQueries.getProposalsByJob(req.params.jobId);
    res.json({ count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-proposals', verifyToken, async (req, res) => {
  try {
    const proposals = await proposalQueries.getProposalsByFreelancer(req.user.id);
    res.json({ count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:proposalId', verifyToken, async (req, res) => {
  try {
    const proposal = await proposalQueries.getProposalById(req.params.proposalId);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:proposalId/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await proposalQueries.getProposalById(req.params.proposalId);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.client_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    const updated = await proposalQueries.updateProposalStatus(req.params.proposalId, status);
    res.json({ message: `Proposal ${status}`, proposal: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:proposalId', verifyToken, async (req, res) => {
  try {
    const proposal = await proposalQueries.getProposalById(req.params.proposalId);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.freelancer_id !== req.user.id && proposal.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await proposalQueries.deleteProposal(req.params.proposalId);
    res.json({ message: 'Proposal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;