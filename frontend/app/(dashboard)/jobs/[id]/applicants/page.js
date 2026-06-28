'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 4;

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

// ── Icons ──────────────────────────────────────────────────────────────────

function UserIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  const d = direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';
  return (
    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Avatar() {
  return (
    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
      <UserIcon className="w-4 h-4 text-white" />
    </div>
  );
}

function JobSummaryCard({ job, proposalCount }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-12 flex items-center gap-5 shadow-sm">
      <div className="w-[52px] h-[52px] bg-[#E1F3F1] rounded-xl flex items-center justify-center">
        <svg className="w-6 h-6 text-[#149B84]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-xl text-black mb-1.5">{job.title || 'Website Redesign Project'}</p>
        <div className="flex items-center gap-3 text-xs text-black font-medium">
          <span>💼 Budget: {job.budget || '2000'} Birr</span>
          <span className="text-gray-300">•</span>
          <span>📅 Posted a Day ago</span>
          <span className="text-gray-300">•</span>
          <span>👥 Applicants: {proposalCount}</span>
        </div>
      </div>
    </div>
  );
}

function CoverLetterModal({ proposal, onClose }) {
  if (!proposal?.cover_letter) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20" />
      <div
        className="relative bg-white rounded-xl border border-gray-200 shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-black">{proposal.freelancer_name || 'Freelancer'}'s Cover Letter</p>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition p-1">
            <CloseIcon />
          </button>
        </div>
        <p className="text-black text-sm leading-relaxed whitespace-pre-wrap">{proposal.cover_letter}</p>
      </div>
    </div>
  );
}

function ActionCell({ prop, job, hiring, amounts, setAmounts, onHire, jobFilled }) {
  if (prop.status === 'accepted') {
    return (
      <span className="px-5 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full inline-block">
        Hired
      </span>
    );
  }
  if (jobFilled) {
    return (
      <span className="px-5 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-full inline-block">
        Filled
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2 justify-center">
      <input
        type="number"
        placeholder={prop.bid_price || job?.budget || 'Amount'}
        defaultValue={prop.bid_price || job?.budget || ''}
        onChange={(e) => setAmounts((prev) => ({ ...prev, [prop.id]: e.target.value }))}
        className="w-24 text-center border border-gray-200 rounded-lg py-2 text-sm font-medium outline-none focus:border-[#24C6D1]"
      />
      <button
        onClick={() => onHire(prop.id)}
        disabled={hiring !== null}
        className="bg-[#24C6D1] hover:bg-[#1eb3bd] disabled:bg-gray-200 text-white font-bold text-sm py-2.5 px-5 rounded-[8px] transition-all min-w-[90px]"
      >
        {hiring === prop.id ? '...' : 'Hire'}
      </button>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-black disabled:text-gray-300 font-bold transition p-1"
      >
        <ChevronIcon direction="left" />
      </button>

      <div className="flex items-center gap-5 text-sm font-bold">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`transition ${
              currentPage === pageNum
                ? 'text-black font-extrabold underline underline-offset-4'
                : 'text-gray-400'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-black disabled:text-gray-300 font-bold transition p-1"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = getToken();

  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiring, setHiring] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [jobRes, propRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/job/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [jobData, propData] = await Promise.all([jobRes.json(), propRes.json()]);
      setJob(jobData.data);
      setProposals(propData.proposals || []);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleHire(proposalId) {
    setHiring(proposalId);
    try {
      const prop = proposals.find((p) => p.id === proposalId);
      const amount = amounts[proposalId] || prop?.bid_price || job?.budget;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hire/proposals/${proposalId}/accept`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: parseFloat(amount) }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to hire');
      router.push(`/escrow/deposit?jobId=${data.escrow.job_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setHiring(null);
    }
  }

  // Pagination
  const totalPages = Math.ceil(proposals.length / ITEMS_PER_PAGE);
  const currentProposals = proposals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const jobFilled = proposals.some((p) => p.status === 'accepted');
  const expandedProposal = proposals.find((p) => p.id === expandedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 w-full">
        <p className="text-gray-500 font-medium">Loading applicants...</p>
      </div>
    );
  }

  return (
    <main className="p-12 max-w-7xl w-full mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-black hover:opacity-70 text-sm font-bold transition"
        >
          <ArrowLeftIcon />
          Back to Jobs
        </button>

        <div className="flex items-center gap-2 cursor-pointer group">
          <Avatar />
          <div className="text-[11px] leading-tight">
            <p className="font-bold text-black flex items-center gap-1">
              Jhon Doe <span className="text-[8px] font-normal group-hover:translate-y-0.5 transition-transform">▼</span>
            </p>
            <p className="text-gray-500 font-medium">Client</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-[32px] font-bold text-black tracking-tight mb-2">Applicants For Your Job</h1>
      <p className="text-[#8E9CA5] text-sm font-medium mb-8">
        Review proposals and hire the best freelancer for your job.
      </p>

      {job && <JobSummaryCard job={job} proposalCount={proposals.length} />}

      {error && <p className="text-red-500 mb-6 font-semibold">{error}</p>}

      {expandedProposal && (
        <CoverLetterModal proposal={expandedProposal} onClose={() => setExpandedId(null)} />
      )}

      <h2 className="text-2xl font-bold text-black mb-8">All Applicants ({proposals.length})</h2>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl py-24 flex flex-col items-center justify-center border border-gray-100/60 shadow-sm">
          <p className="text-gray-400 text-lg font-medium">No proposals yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100/40 mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-black text-sm font-bold">
                  <th className="py-5 px-8 w-[20%]">Applicants</th>
                  <th className="py-5 px-6 w-[50%]">Proposal</th>
                  <th className="py-5 px-6 w-[13%]">Bid Amount</th>
                  <th className="py-5 px-8 w-[17%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {currentProposals.map((prop) => (
                  <tr key={prop.id} className="align-middle">

                    {/* Applicant */}
                    <td className="py-6 px-8 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar />
                        <p className="font-bold text-black">{prop.freelancer_name || 'Freelancer'}</p>
                      </div>
                    </td>

                    {/* Proposal */}
                    <td className="py-6 px-6">
                      <p className="text-black font-medium text-sm leading-relaxed max-w-lg">
                        {prop.cover_letter
                          ? truncate(prop.cover_letter, 60)
                          : 'No cover letter provided.'}
                      </p>
                      {prop.cover_letter?.length > 60 && (
                        <button
                          onClick={() => setExpandedId(expandedId === prop.id ? null : prop.id)}
                          className="text-[#24C6D1] text-xs font-semibold mt-2 px-2.5 py-2.5 border border-[#24C6D1] rounded-lg hover:bg-[#24C6D1]/5 transition leading-none"
                        >
                          {expandedId === prop.id ? '▲ Show less' : '▼ Read more'}
                        </button>
                      )}
                    </td>

                    {/* Bid */}
                    <td className="py-6 px-6 whitespace-nowrap">
                      <span className="font-bold text-[#149B84] text-base">
                        {prop.bid_price || job?.budget || '—'} Birr
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-6 px-8 whitespace-nowrap text-center">
                      <ActionCell
                        prop={prop}
                        job={job}
                        hiring={hiring}
                        amounts={amounts}
                        setAmounts={setAmounts}
                        onHire={handleHire}
                        jobFilled={jobFilled}
                      />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </main>
  );
}