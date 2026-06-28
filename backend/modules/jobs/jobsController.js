const jobsService = require('./jobsService');

async function createJob(req, res) {
  try {
    const { title, description, budget } = req.body;
    const client_id = req.user.id;

    if (!title || !description || !budget)
      return res.status(400).json({ success: false, message: 'Title, description, and budget are required.' });

    if (isNaN(budget) || Number(budget) <= 0)
      return res.status(400).json({ success: false, message: 'Budget must be a positive number.' });

    const job = await jobsService.createJob({
      title: title.trim(),
      description: description.trim(),
      budget: parseFloat(budget),
      client_id,
    });

    return res.status(201).json({ success: true, message: 'Job posted successfully.', data: job });
  } catch (err) {
    console.error('[createJob]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function listJobs(req, res) {
  try {
    const { page = 1, limit = 10, status = 'open', search = '' } = req.query;
    const allowedStatuses = ['open', 'closed', 'awarded'];

    if (!allowedStatuses.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}.` });

    const result = await jobsService.listJobs({
      page: Math.max(1, parseInt(page, 10)),
      limit: Math.min(50, Math.max(1, parseInt(limit, 10))),
      status,
      search: search.trim(),
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[listJobs]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const job = await jobsService.getJobById(id);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    console.error('[getJobById]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function updateJobStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const client_id = req.user.id;
    const allowedStatuses = ['open', 'closed', 'awarded'];

    if (!allowedStatuses.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}.` });

    const updated = await jobsService.updateJobStatus(id, status, client_id);
    if (!updated) return res.status(404).json({ success: false, message: 'Job not found or you do not have permission.' });

    return res.status(200).json({ success: true, message: 'Job status updated.', data: updated });
  } catch (err) {
    console.error('[updateJobStatus]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function getMyJobs(req, res) {
  try {
    const jobs = await jobsService.getJobsByClient(req.user.id);
    return res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    console.error('[getMyJobs]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = { createJob, listJobs, getJobById, updateJobStatus, getMyJobs };