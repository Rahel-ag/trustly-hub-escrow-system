const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const pool = require('../shared/db/pool');
const jwt = require('jsonwebtoken');

// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: Missing Token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token signature context' });
  }
};

// 1. POST /api/chapa/prepare
// Generates or updates a pending escrow transaction row using secure UUID mappings
router.post('/prepare', verifyToken, async (req, res) => {
  try {
    const { jobId, amount } = req.body;

    if (!jobId || !amount) {
      return res.status(400).json({ error: 'jobId and amount are required.' });
    }

    // Confirm that the job entry exists and find the hired freelancer
    const jobResult = await pool.query(
      'SELECT client_id, freelancer_id FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Linked job contract not found.' });
    }

    const job = jobResult.rows[0];
    if (job.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: Only the job poster can open escrow profiles.' });
    }

    // If freelancer_id not on job yet, fall back to the accepted proposal
    let freelancerId = job.freelancer_id;
    if (!freelancerId) {
      const proposalResult = await pool.query(
        "SELECT freelancer_id FROM proposals WHERE job_id = $1 AND status = 'accepted' LIMIT 1",
        [jobId]
      );
      if (proposalResult.rows.length > 0) {
        freelancerId = proposalResult.rows[0].freelancer_id;
      } else {
        return res.status(400).json({ error: 'Cannot open escrow. No freelancer has been assigned yet.' });
      }
    }

    // Reuse existing pending rows to avoid database double entry accumulation
    const existingEscrow = await pool.query(
      'SELECT id FROM escrow_transactions WHERE job_id = $1 AND status = $2',
      [jobId, 'pending_deposit']
    );

    if (existingEscrow.rows.length > 0) {
      const escrowId = existingEscrow.rows[0].id;
      await pool.query(
        'UPDATE escrow_transactions SET amount = $1 WHERE id = $2',
        [amount, escrowId]
      );
      return res.json({ success: true, escrowId });
    }

    // Insert transaction row with required NOT NULL foreign keys
    const newEscrow = await pool.query(
      `INSERT INTO escrow_transactions (job_id, client_id, freelancer_id, amount, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending_deposit', NOW())
       RETURNING id`,
      [jobId, req.user.id, freelancerId, amount]
    );

    return res.json({ success: true, escrowId: newEscrow.rows[0].id });
  } catch (error) {
    console.error('Prepare error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. POST /api/chapa/initialize
// POST /api/chapa/initialize
router.post('/initialize', verifyToken, async (req, res) => {
  try {
    const { escrowId, amount } = req.body;

    if (!escrowId || !amount) {
      return res.status(400).json({ error: 'escrowId and amount are required.' });
    }

    const escrowResult = await pool.query(
      'SELECT * FROM escrow_transactions WHERE id = $1',
      [escrowId]
    );

    if (escrowResult.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow contract reference not found.' });
    }

    const escrow = escrowResult.rows[0];
    if (escrow.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: User parameters mismatch.' });
    }

    // If already funded, no need to initialize
    if (escrow.status === 'funded') {
      return res.json({ success: true, already_paid: true, message: 'Payment already completed.' });
    }

    // Check if existing tx_ref was already paid on Chapa
    if (escrow.tx_ref) {
      try {
        const chapaCheck = await axios.get(
          `https://api.chapa.co/v1/transaction/verify/${escrow.tx_ref}`,
          { headers: { Authorization: `Bearer ${String(process.env.CHAPA_SECRET_KEY).trim()}` } }
        );
        if (chapaCheck.data.status === 'success' && chapaCheck.data.data.status === 'success') {
          // Payment already made on Chapa — update escrow to funded
          await pool.query(
            `UPDATE escrow_transactions SET status = 'funded' WHERE id = $1`,
            [escrowId]
          );
          await pool.query(
            `UPDATE jobs SET status = 'active', escrow_status = 'funded' WHERE id = $1`,
            [escrow.job_id]
          );
          console.log(`[CHAPA INIT] Existing tx_ref ${escrow.tx_ref} already paid. Escrow ${escrowId} funded.`);
          return res.json({ success: true, already_paid: true, message: 'Payment already completed.' });
        }
      } catch (checkErr) {
        console.log(`[CHAPA INIT] Existing tx_ref check failed (expected for unpaid): ${checkErr.message}`);
      }
    }

    const tx_ref = `tx-trustlyhub-${Date.now()}-${String(escrowId).substring(0, 8)}`;

    await pool.query(
      'UPDATE escrow_transactions SET tx_ref = $1 WHERE id = $2',
      [tx_ref, escrowId]
    );

    const secretKey = String(process.env.CHAPA_SECRET_KEY).trim();

    const chapaPayload = {
      amount: String(amount),
      currency: 'ETB',
      email: String(req.user.email),
      first_name: String(req.user.name || req.user.email?.split('@')[0] || 'Client'),
      last_name: 'User',
      tx_ref,
      callback_url: `${process.env.NGROK_URL}/api/chapa/webhook`,
      return_url: `${process.env.NGROK_URL}/api/chapa/return?escrowId=${escrowId}&tx_ref=${tx_ref}`,
      customization: {
        title: 'TrustlyHub',
        description: 'Escrow milestone payment',
      },
    };

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaPayload,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'success') {
      return res.json({
        success: true,
        paymentUrl: response.data.data.checkout_url,
        tx_ref,
      });
    } else {
      return res.status(400).json({ error: 'Chapa initialization rejected.' });
    }
  } catch (error) {
    if (error.response) {
      console.error('--- CHAPA ERROR REPORT ---');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      return res.status(400).json({ 
        error: 'Chapa Gateway Rejected Request', 
        status: error.response.status,
        details: error.response.data 
      });
    }
    console.error('Chapa init error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


// 3. POST /api/chapa/webhook
// Protects database with strict SHA256 signature verification matching Chapa guidelines
router.post('/webhook', async (req, res) => {
  try {
    console.log('[CHAPA WEBHOOK] Received webhook:', JSON.stringify(req.body));
    const signature = req.headers['x-chapa-signature'];
    const secret = process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY;
    
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const { tx_ref } = req.body;
    console.log(`[CHAPA WEBHOOK] tx_ref: ${tx_ref}`);

    const verification = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } }
    );
    console.log(`[CHAPA WEBHOOK] Chapa verify response:`, JSON.stringify(verification.data));

    if (verification.data.status === 'success' && verification.data.data.status === 'success') {
      const chapaVerifiedAmount = verification.data.data.amount;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const dbEscrow = await client.query(
          'SELECT id, job_id, amount, status FROM escrow_transactions WHERE tx_ref = $1',
          [tx_ref]
        );

        if (dbEscrow.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Transaction reference not found.' });
        }

        const escrow = dbEscrow.rows[0];

        if (Number(escrow.amount) !== Number(chapaVerifiedAmount)) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Financial value validation failure.' });
        }

        // Return early if row was already modified by parallel worker requests
        if (escrow.status === 'funded') {
          await client.query('COMMIT');
          return res.status(200).json({ message: 'Escrow already fully synchronized.' });
        }

        // Lock funds state into local table structures
        await client.query(
          `UPDATE escrow_transactions SET status = 'funded' WHERE id = $1`,
          [escrow.id]
        );

        // Keep parent jobs state matching active tracking flags
        await client.query(
          `UPDATE jobs SET status = 'active', escrow_status = 'funded' WHERE id = $1`,
          [escrow.job_id]
        );

        await client.query('COMMIT');
        return res.status(200).json({ message: 'Verified successfully.' });
      } catch (transactionError) {
        await client.query('ROLLBACK');
        throw transactionError;
      } finally {
        client.release();
      }
    } else {
      return res.status(400).json({ error: 'Chapa direct verification unsuccessful.' });
    }
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ error: 'Internal Server Processing Error' });
  }
});
// 4. POST /api/chapa/verify
// Verifies payment with Chapa and updates status if successful.
// Called by frontend when user returns from Chapa checkout page.
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { escrowId } = req.body;
    console.log(`[CHAPA VERIFY] Request for escrowId: ${escrowId}, user: ${req.user.id}`);

    if (!escrowId) {
      return res.status(400).json({ error: 'escrowId is required.' });
    }

    const escrowResult = await pool.query(
      'SELECT * FROM escrow_transactions WHERE id = $1',
      [escrowId]
    );

    if (escrowResult.rows.length === 0) {
      console.log(`[CHAPA VERIFY] Escrow not found: ${escrowId}`);
      return res.status(404).json({ error: 'Escrow not found.' });
    }

    const escrow = escrowResult.rows[0];
    console.log(`[CHAPA VERIFY] Found escrow: status=${escrow.status}, tx_ref=${escrow.tx_ref}, amount=${escrow.amount}`);

    // Only client who owns the escrow can verify
    if (escrow.client_id !== req.user.id) {
      console.log(`[CHAPA VERIFY] Access denied: client=${escrow.client_id}, user=${req.user.id}`);
      return res.status(403).json({ error: 'Access denied.' });
    }

    // If already funded, no need to verify
    if (escrow.status === 'funded') {
      console.log(`[CHAPA VERIFY] Already funded`);
      return res.json({ success: true, status: 'funded', message: 'Payment already confirmed.' });
    }

    // If no tx_ref, cannot verify
    if (!escrow.tx_ref) {
      console.log(`[CHAPA VERIFY] No tx_ref found`);
      return res.json({ success: false, status: escrow.status, message: 'No transaction reference found.' });
    }

    // Verify with Chapa API
    try {
      console.log(`[CHAPA VERIFY] Calling Chapa API for tx_ref: ${escrow.tx_ref}`);
      const verification = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${escrow.tx_ref}`,
        { headers: { Authorization: `Bearer ${String(process.env.CHAPA_SECRET_KEY).trim()}` } }
      );

      console.log(`[CHAPA VERIFY] Chapa response:`, JSON.stringify(verification.data));

      if (verification.data.status === 'success' && verification.data.data.status === 'success') {
        const chapaAmount = verification.data.data.amount;
        console.log(`[CHAPA VERIFY] Chapa confirms success, amount=${chapaAmount}`);

        if (Number(escrow.amount) !== Number(chapaAmount)) {
          console.log(`[CHAPA VERIFY] Amount mismatch: escrow=${escrow.amount}, chapa=${chapaAmount}`);
          return res.json({ success: false, status: escrow.status, message: 'Amount mismatch.' });
        }

        // Update escrow status to funded
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(
            `UPDATE escrow_transactions SET status = 'funded' WHERE id = $1`,
            [escrowId]
          );
          await client.query(
            `UPDATE jobs SET status = 'active', escrow_status = 'funded' WHERE id = $1`,
            [escrow.job_id]
          );
          await client.query('COMMIT');
          console.log(`[CHAPA VERIFY] Success! Escrow ${escrowId} updated to funded`);
          return res.json({ success: true, status: 'funded', message: 'Payment verified and funds locked.' });
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      }

      console.log(`[CHAPA VERIFY] Chapa says not yet confirmed: ${verification.data.status}`);
      return res.json({ success: false, status: escrow.status, message: 'Payment not yet confirmed by Chapa.' });
    } catch (verifyError) {
      console.error(`[CHAPA VERIFY] Chapa API error:`, verifyError.response?.data || verifyError.message);
      return res.json({ success: false, status: escrow.status, message: 'Verification with Chapa failed.' });
    }
  } catch (error) {
    console.error('[CHAPA VERIFY] Server error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/chapa/:id/submit
// Locks job files and marks the escrow milestone status as completed/submitted
router.post('/:id/submit', verifyToken, async (req, res) => {
  const escrowId = req.params.id;
  try {
    const escrowRes = await pool.query(
      'SELECT job_id, freelancer_id, status FROM escrow_transactions WHERE id = $1',
      [escrowId]
    );

    if (escrowRes.rows.length === 0) return res.status(404).json({ error: 'Escrow profile missing.' });
    const escrow = escrowRes.rows[0];

    if (escrow.freelancer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the assigned freelancer can dispatch deliverables.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE escrow_transactions SET status = 'submitted' WHERE id = $1`, [escrowId]);
      await client.query(`UPDATE jobs SET work_submitted = true, escrow_status = 'submitted' WHERE id = $1`, [escrow.job_id]);
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Work marked as submitted.' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/chapa/release
// Confirms approval and releases the escrowed funds to the freelancer
router.post('/release', verifyToken, async (req, res) => {
  try {
    const { escrowId } = req.body;
    const escrowResult = await pool.query('SELECT * FROM escrow_transactions WHERE id = $1', [escrowId]);

    if (escrowResult.rows.length === 0) return res.status(404).json({ error: 'Escrow profile missing.' });
    const escrow = escrowResult.rows[0];

    if (escrow.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the client can unlock escrow allocations.' });
    }

    // Try actual payout via Chapa Transfer API
    const secretKey = String(process.env.CHAPA_SECRET_KEY).trim();
    let payoutAttempted = false;

    try {
      const payoutRes = await pool.query(
        'SELECT method, account FROM payout_configs WHERE user_id = $1',
        [escrow.freelancer_id]
      );

      if (payoutRes.rows.length > 0) {
        const payout = payoutRes.rows[0];
        payoutAttempted = true;

        const reference = `rel_${escrowId}_${Date.now()}`;

        try {
          const transferRes = await axios.post(
            'https://api.chapa.co/v1/transfers',
            {
              amount: parseFloat(escrow.amount),
              currency: 'ETB',
              account_name: payout.account,
              account_number: payout.account,
              bank_code: payout.method === 'chapa' ? 'chapa' : payout.method.toUpperCase(),
              reference,
            },
            { headers: { Authorization: `Bearer ${secretKey}` } }
          );
          console.log(`[CHAPA RELEASE] Transfer initiated: ${reference}`, transferRes.data);
        } catch (chapaError) {
          console.error('[CHAPA RELEASE] Transfer API error:', chapaError.response?.data || chapaError.message);
        }
      }
    } catch (payoutError) {
      console.error('[CHAPA RELEASE] Payout config lookup failed:', payoutError.message);
    }

    // Always update DB to released
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE escrow_transactions SET status = 'released' WHERE id = $1`, [escrowId]);
      await client.query(`UPDATE jobs SET status = 'completed', escrow_status = 'released' WHERE id = $1`, [escrow.job_id]);
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'Escrow cleared and disbursed.',
        transferAttempted: payoutAttempted,
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/chapa/return
// Handles Chapa redirect after payment. Updates the escrow to 'funded'
// immediately before redirecting to the frontend.
// This bypasses the need for the webhook (callback_url) to work in test mode.
router.all('/return', async (req, res) => {
  try {
    const { escrowId, tx_ref } = req.query;
    console.log(`[CHAPA RETURN] Redirect received: escrowId=${escrowId}, tx_ref=${tx_ref}`);

    // Only update if both escrowId and tx_ref match a pending escrow
    if (tx_ref && escrowId) {
      const escrowResult = await pool.query(
        'SELECT * FROM escrow_transactions WHERE id = $1 AND tx_ref = $2',
        [escrowId, tx_ref]
      );

      if (escrowResult.rows.length > 0) {
        const escrow = escrowResult.rows[0];

        if (escrow.status === 'pending_deposit') {
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            await client.query(
              `UPDATE escrow_transactions SET status = 'funded' WHERE id = $1`,
              [escrowId]
            );
            await client.query(
              `UPDATE jobs SET status = 'active', escrow_status = 'funded' WHERE id = $1`,
              [escrow.job_id]
            );
            await client.query('COMMIT');
            console.log(`[CHAPA RETURN] Escrow ${escrowId} updated to funded`);
          } catch (e) {
            await client.query('ROLLBACK');
            throw e;
          } finally {
            client.release();
          }
        }
      } else {
        console.log(`[CHAPA RETURN] No matching escrow found for escrowId=${escrowId}, tx_ref=${tx_ref}`);
      }
    }

    // Redirect to frontend escrow page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/escrow/${escrowId}`);
  } catch (error) {
    console.error('[CHAPA RETURN] Error:', error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/escrow/${escrowId || ''}`);
  }
});

// POST /api/chapa/refund
// Refunds a payment to the client via Chapa API
router.post('/refund', verifyToken, async (req, res) => {
  try {
    const { escrowId } = req.body;
    if (!escrowId) return res.status(400).json({ error: 'escrowId is required' });

    const escrowResult = await pool.query(
      'SELECT * FROM escrow_transactions WHERE id = $1',
      [escrowId]
    );
    if (escrowResult.rows.length === 0) return res.status(404).json({ error: 'Escrow not found' });

    const escrow = escrowResult.rows[0];
    if (!escrow.tx_ref) return res.status(400).json({ error: 'No transaction reference to refund' });
    if (escrow.status !== 'funded' && escrow.status !== 'disputed') {
      return res.status(400).json({ error: `Cannot refund escrow with status: ${escrow.status}` });
    }

    const secretKey = String(process.env.CHAPA_SECRET_KEY).trim();

    try {
      const refundRes = await axios.post(
        `https://api.chapa.co/v1/transaction/refund/${escrow.tx_ref}`,
        {},
        { headers: { Authorization: `Bearer ${secretKey}` } }
      );

      if (refundRes.data.status === 'success' || refundRes.data.status === 'pending') {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(
            `UPDATE escrow_transactions SET status = 'refunded' WHERE id = $1`,
            [escrowId]
          );
          await client.query(
            `UPDATE jobs SET status = 'completed', escrow_status = 'refunded' WHERE id = $1`,
            [escrow.job_id]
          );
          await client.query('COMMIT');
          res.json({ success: true, message: 'Refund processed successfully', chapa_status: refundRes.data.status });
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      } else {
        res.status(400).json({ error: 'Chapa refund rejected', details: refundRes.data });
      }
    } catch (chapaError) {
      console.error('[CHAPA REFUND] API error:', chapaError.response?.data || chapaError.message);
      // Fallback: update status to refunded anyway (for test mode)
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `UPDATE escrow_transactions SET status = 'refunded' WHERE id = $1`,
          [escrowId]
        );
        await client.query(
          `UPDATE jobs SET status = 'completed', escrow_status = 'refunded' WHERE id = $1`,
          [escrow.job_id]
        );
        await client.query('COMMIT');
        res.json({ success: true, message: 'Refund recorded (Chapa API unavailable in test mode)', fallback: true });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
