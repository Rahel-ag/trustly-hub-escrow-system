const pool = require('./shared/db/pool')
const bcrypt = require('bcrypt')

async function seed() {
  console.log('Seeding database...')

  // (children before parents)
  await pool.query('DELETE FROM disputes')
  await pool.query('DELETE FROM escrow_transactions')
  await pool.query('DELETE FROM proposals')
  await pool.query('DELETE FROM jobs')
  await pool.query('DELETE FROM payout_configs')
  await pool.query('DELETE FROM users')

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('pass123', 10)
  ])

  // ── USERS ──
  const users = await pool.query(`
    INSERT INTO users (id, email, password_hash, role, created_at) VALUES
    (gen_random_uuid(), 'admin@trustlyhub.com', $1, 'admin', NOW()),
    (gen_random_uuid(), 'client1@test.com', $2, 'client', NOW()),
    (gen_random_uuid(), 'client2@test.com', $2, 'client', NOW()),
    (gen_random_uuid(), 'freelancer1@test.com', $2, 'freelancer', NOW()),
    (gen_random_uuid(), 'freelancer2@test.com', $2, 'freelancer', NOW()),
    (gen_random_uuid(), 'freelancer3@test.com', $2, 'freelancer', NOW())
    RETURNING id, email, role
  `, [adminHash, userHash])

  const admin = users.rows.find(u => u.role === 'admin')
  const client1 = users.rows.find(u => u.email === 'client1@test.com')
  const client2 = users.rows.find(u => u.email === 'client2@test.com')
  const freelancer1 = users.rows.find(u => u.email === 'freelancer1@test.com')
  const freelancer2 = users.rows.find(u => u.email === 'freelancer2@test.com')
  const freelancer3 = users.rows.find(u => u.email === 'freelancer3@test.com')

  console.log('Users created:', users.rows.length)

  // ── JOBS ──
  const jobs = await pool.query(`
    INSERT INTO jobs (id, client_id, title, description, budget, status) VALUES
    (gen_random_uuid(), $1, 'Build a logo for my startup', 'Need a clean modern logo for a fintech app. Looking for minimalist style with blue color scheme.', 150, 'open'),
    (gen_random_uuid(), $1, 'Write product landing page copy', 'Need persuasive copy for a SaaS landing page, around 500 words.', 100, 'open'),
    (gen_random_uuid(), $2, 'Build a React dashboard', 'Need a freelancer to build an admin dashboard with charts and tables using React and Tailwind.', 800, 'in_progress'),
    (gen_random_uuid(), $2, 'Fix bugs in Node.js API', 'A few endpoints are returning 500 errors, need someone to debug and fix.', 200, 'in_progress'),
    (gen_random_uuid(), $1, 'Edit a 5 minute promo video', 'Raw footage provided, need editing, color grading and music.', 300, 'completed')
    RETURNING id, title, client_id, status
  `, [client1.id, client2.id])

  console.log('Jobs created:', jobs.rows.length)

  const job1 = jobs.rows[0] // logo - open
  const job2 = jobs.rows[1] // copywriting - open
  const job3 = jobs.rows[2] // dashboard - in_progress (client2)
  const job4 = jobs.rows[3] // bug fix - in_progress (client2)
  const job5 = jobs.rows[4] // video - completed (client1)

  // ── PROPOSALS ──
  const proposals = await pool.query(`
    INSERT INTO proposals (id, job_id, freelancer_id, message, status) VALUES
    (gen_random_uuid(), $1, $6, 'I have 5 years of logo design experience, here is my portfolio link...', 'pending'),
    (gen_random_uuid(), $1, $7, 'I specialize in fintech branding, would love to work on this.', 'pending'),
    (gen_random_uuid(), $2, $7, 'I am a content writer with SaaS experience, can deliver in 2 days.', 'pending'),
    (gen_random_uuid(), $3, $6, 'I have built 10+ React dashboards, here are examples.', 'accepted'),
    (gen_random_uuid(), $4, $8, 'I can debug this today, send me access to the repo.', 'accepted'),
    (gen_random_uuid(), $5, $7, 'I am a video editor with Premiere Pro and DaVinci experience.', 'accepted')
    RETURNING id, job_id, freelancer_id, status
  `, [job1.id, job2.id, job3.id, job4.id, job5.id, freelancer1.id, freelancer2.id, freelancer3.id])

  console.log('Proposals created:', proposals.rows.length)

  // ── ESCROW TRANSACTIONS ──
  const escrows = await pool.query(`
    INSERT INTO escrow_transactions (id, job_id, client_id, freelancer_id, amount, status, created_at) VALUES
    (gen_random_uuid(), $1, $4, $6, 800, 'funded', NOW()),
    (gen_random_uuid(), $2, $4, $7, 200, 'submitted', NOW()),
    (gen_random_uuid(), $3, $5, $8, 300, 'released', NOW())
    RETURNING id, job_id, status
  `, [job3.id, job4.id, job5.id, client2.id, client1.id, freelancer1.id, freelancer3.id, freelancer2.id])

  console.log('Escrow transactions created:', escrows.rows.length)

  // ── DISPUTES (one example) ──
  await pool.query(`
    INSERT INTO disputes (id, escrow_id, reason, flagged_by, decision) VALUES
    (gen_random_uuid(), $1, 'The submitted work does not match what was agreed in the proposal. Missing 2 of the requested features.', $2, NULL)
  `, [escrows.rows[1].id, client2.id])

  console.log('Disputes created: 1')

  console.log('')
  console.log('Seed complete! Login with any of these:')
  console.log('Admin:       admin@trustlyhub.com / admin123')
  console.log('Client 1:    client1@test.com / pass123')
  console.log('Client 2:    client2@test.com / pass123')
  console.log('Freelancer1: freelancer1@test.com / pass123')
  console.log('Freelancer2: freelancer2@test.com / pass123')
  console.log('Freelancer3: freelancer3@test.com / pass123')

  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
