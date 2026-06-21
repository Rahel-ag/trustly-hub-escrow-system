const express = require('express');
const router = express.Router();
const jobsController = require('./jobsController');
const authMiddleware = require('../../src/middleware/authMiddleware');
const { roleGuard } = require('../../src/middleware/roleGuard');

router.get('/my', authMiddleware, roleGuard('client'), jobsController.getMyJobs);
router.get('/', jobsController.listJobs);
router.get('/:id', jobsController.getJobById);
router.post('/', authMiddleware, roleGuard('client'), jobsController.createJob);
router.patch('/:id/status', authMiddleware, roleGuard('client'), jobsController.updateJobStatus);

module.exports = router;