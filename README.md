# Trustly Hub — Escrow System

A freelance escrow platform where clients can post jobs, hire freelancers, and securely release payments through an escrow flow integrated with Chapa payments.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router, JavaScript) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Payments | Chapa Payment Gateway |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
trustly-hub-escrow-system/
├── frontend/                          # Next.js app
│   ├── app/
│   │   ├── layout.js                  # Root layout
│   │   ├── page.js                    # Landing page
│   │   ├── globals.css
│   │   ├── favicon.ico
│   │   ├── (dashboard)/               # Authenticated routes (group)
│   │   │   ├── layout.js
│   │   │   ├── active-work/
│   │   │   │   ├── page.js
│   │   │   │   └── [id]/submit-work/page.js
│   │   │   ├── admin/
│   │   │   │   ├── page.js
│   │   │   │   ├── disputes/page.js
│   │   │   │   ├── escrows/page.js
│   │   │   │   └── users/page.js
│   │   │   ├── applications/page.js
│   │   │   ├── dashboard/page.js
│   │   │   ├── disputes/
│   │   │   │   ├── page.js
│   │   │   │   └── new/page.js
│   │   │   ├── escrow/
│   │   │   │   ├── page.js
│   │   │   │   ├── deposit/page.js
│   │   │   │   └── [id]/page.js
│   │   │   ├── jobs/
│   │   │   │   ├── page.js
│   │   │   │   └── [id]/
│   │   │   │       ├── page.js
│   │   │   │       ├── applicants/page.js
│   │   │   │       ├── apply/page.js
│   │   │   │       └── review/page.js
│   │   │   ├── payments/page.js
│   │   │   ├── post-job/page.js
│   │   │   └── profile/page.js
│   │   ├── auth/
│   │   │   ├── login/page.js
│   │   │   └── register/page.js
│   │   └── components/
│   │       ├── AuthGuard.js
│   │       ├── DashboardSidebar.js
│   │       ├── JobDetails.js
│   │       ├── JobListing.js
│   │       ├── LoginForm.js
│   │       ├── Navbar.js
│   │       └── Postjob.js
│   ├── jsconfig.json
│   └── package.json
│
├── backend/                           # Node.js + Express
│   ├── server.js                      # Entry point
│   ├── db.js                          # DB initialization / setup
│   ├── seed.js                        # Mock data generator
│   ├── package.json
│   ├── .env                           # Environment variables
│   ├── shared/
│   │   └── db/pool.js                 # PostgreSQL connection pool
│   ├── src/middleware/
│   │   ├── authMiddleware.js          # JWT verification
│   │   ├── roleGuard.js               # Role-based access control
│   │   └── index.js
│   ├── routes/                        # API route handlers
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── proposalRoutes.js
│   │   ├── escrowRoutes.js
│   │   ├── chapaRoutes.js             # Chapa payment integration
│   │   ├── hireRoutes.js
│   │   └── profileRoutes.js
│   ├── modules/jobs/                  # Modular job feature
│   │   ├── jobsController.js
│   │   ├── jobsRouter.js
│   │   └── jobsService.js
│   ├── queries/
│   │   ├── adminQueries.js
│   │   ├── authQueries.js
│   │   ├── escrowQueries.js
│   │   └── proposalQueries.js
│   └── migrations/                    # node-pg-migrate
│       ├── 001_initial_schema.js
│       ├── 002_add_name.js
│       ├── 003_add_tx_ref_to_escrow.js
│       ├── 004_add_contract_tracking.js
│       ├── 005_add_chapa_escrow_statuses.js
│       ├── 006_add_saved_jobs.js
│       ├── 007_add_submission_columns_to_escrow.js
│       └── 008_payout_configs.js
│
├── docker-compose.yml
├── database.json                      # node-pg-migrate configuration
└── README.md
```

---

## Architecture

This project follows a **modular monolith** pattern — one backend, one frontend, one database, with features organized into self-contained modules that don't import from each other directly.

```
Client (browser)
      │
      ▼
Next.js frontend (port 3000)
      │  REST calls
      ▼
Node.js + Express backend (port 4000)
      │
      ├── Auth routes
      ├── Jobs module
      ├── Escrow routes ─────► Chapa Payment Gateway (test mode)
      ├── Disputes routes
      └── Admin routes
      │
      ▼
PostgreSQL (port 5432)
```

---

## Escrow Flow

```
1. Client posts a job
2. Freelancer applies with a proposal
3. Client hires the freelancer → escrow created (status: pending_deposit)
4. Client deposits funds → redirected to Chapa checkout
5. Payment confirmed by Chapa → escrow status: funded
6. Freelancer submits completed work → escrow status: submitted
7. Client reviews the submission:
   - Approves → escrow status: released (Chapa transfer to freelancer)
   - Disputes → escrow status: disputed → admin resolves
```

---

## Getting Started

### Prerequisites
- Docker Desktop installed and running
- Git installed
- A Chapa test account and API keys ([chapa.co](https://chapa.co))
- ngrok installed (for routing Chapa webhooks to your local machine)

### 1. Clone the repo
```bash
git clone https://github.com/ADVFINALPROJ2/trustly-hub-escrow-system.git
cd trustly-hub-escrow-system
```

### 2. Set up environment variables

Create a `.env` file inside `backend/`:
```
DATABASE_URL=postgresql://postgres:54321@db:5432/trustly_hub
JWT_SECRET=your_secret_key_here
PORT=4000
CHAPA_SECRET_KEY=your_chapa_test_secret_key
CHAPA_WEBHOOK_SECRET=your_webhook_secret
NGROK_URL=https://your-ngrok-url.ngrok-free.app
FRONTEND_URL=http://localhost:3000
```

### 3. Start ngrok (in a separate terminal)
```bash
ngrok http 4000
```
Copy the generated URL into `NGROK_URL` in your `.env` file, and set the same URL as your webhook endpoint in your Chapa dashboard:
```
https://your-ngrok-url.ngrok-free.app/api/chapa/webhook
```

### 4. Build and run with Docker
```bash
docker compose up --build -d
```

This starts three containers:
- `frontend` → `http://localhost:3000`
- `backend` → `http://localhost:4000`
- `db` → PostgreSQL on port `5432`

### 5. Run database migrations
```bash
docker compose exec backend npm run migrate:up
```

### 6. Seed the database with mock data
```bash
docker compose exec backend node seed.js
```

This creates test accounts, jobs, proposals, and escrow transactions in various states.


## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@trustlyhub.com | admin123 |
| Client | client1@test.com | pass123 |
| Client | client2@test.com | pass123 |
| Freelancer | freelancer1@test.com | pass123 |
| Freelancer | freelancer2@test.com | pass123 |
| Freelancer | freelancer3@test.com | pass123 |

## Deployment
Frontend (app): https://trustly-hub-escrow-system-52rizfpel.vercel.app
Backend API: https://trustly-hub-escrow-system-production.up.railway.app


## Known Limitations

- Chapa transfer (payout to freelancer) runs in test mode and may be restricted by Chapa's sandbox account settings
- Email notifications are out of scope for this demo
- Pagination is not implemented (demo dataset is small)
