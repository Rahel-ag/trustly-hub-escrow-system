'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiring, setHiring] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
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

      const jobData = await jobRes.json();
      const propData = await propRes.json();

      setJob(jobData.data);
      setProposals(propData.proposals || []);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleHire(proposalId) {
    setHiring(proposalId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hire/proposals/${proposalId}/accept`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: job.budget }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to hire');

      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'accepted' } : p))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setHiring(null);
    }
  }

  // Pagination slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProposals = proposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(proposals.length / itemsPerPage);

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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </button>

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="text-[11px] leading-tight">
            <p className="font-bold text-black flex items-center gap-1">
              Jhon Doe <span className="text-[8px] font-normal transition-transform group-hover:translate-y-0.5">▼</span>
            </p>
            <p className="text-gray-500 font-medium">Client</p>
          </div>
        </div>
      </div>

      {/* Page title */}
      <h1 className="text-[32px] font-bold text-black tracking-tight mb-2">Applicants For Your Job</h1>
      <p className="text-[#8E9CA5] text-sm font-medium mb-8">
        Review proposals and hire the best freelancer for your job.
      </p>

      {/* Job summary card */}
      {job && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-12 flex items-center gap-5 shadow-sm">
          <div className="w-[52px] h-[52px] bg-[#E1F3F1] rounded-xl flex items-center justify-center overflow-hidden">
            <svg className="w-6 h-6 text-[#149B84]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold text-xl text-black mb-1.5">{job.title || 'Website Redesign Project'}</p>
            <div className="flex items-center gap-3 text-xs text-black font-medium">
              <span className="flex items-center gap-1">💼 Budget: {job.budget || '2000'} Birr</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">📅 Posted a Day ago</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">👥 Applicants: {proposals.length || 6}</span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mb-6 font-semibold">{error}</p>}

      <h2 className="text-2xl font-bold text-black mb-8">All Applicants ({proposals.length || 6})</h2>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl py-24 flex flex-col items-center justify-center border border-gray-100/60 shadow-sm">
          <p className="text-gray-400 text-lg font-medium">No proposals yet.</p>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100/40 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-black text-sm font-bold">
                  <th className="py-5 px-8 font-bold w-[25%]">Applicants</th>
                  <th className="py-5 px-6 font-bold w-[45%]">Proposal</th>
                  <th className="py-5 px-6 font-bold w-[15%]">Bid Amount</th>
                  <th className="py-5 px-8 font-bold w-[15%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {currentProposals.map((prop) => (
                  <tr key={prop.id} className="align-middle">
                    <td className="py-6 px-8 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                        <div className="leading-tight">
                          <p className="font-bold text-black">{prop.freelancer?.name || 'Michael Brown'}</p>
                          <p className="text-[#718096] text-xs font-medium mt-0.5">
                            {prop.freelancer?.title || 'UI/UX Designer'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-6">
                      <p className="text-black font-medium text-sm leading-relaxed max-w-xl">
                        {prop.coverLetter || 'I have read your requirements carefully and I can design a professional website.'}
                      </p>
                    </td>

                    <td className="py-6 px-6 whitespace-nowrap">
                      <span className="font-bold text-[#149B84] text-base">{prop.bidAmount || '1800'} Birr</span>
                    </td>

                    <td className="py-6 px-8 whitespace-nowrap text-center">
                      {prop.status === 'accepted' ? (
                        <span className="px-5 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full inline-block">
                          Hired
                        </span>
                      ) : (
                        <button
                          onClick={() => handleHire(prop.id)}
                          disabled={hiring !== null}
                          className="bg-[#24C6D1] hover:bg-[#1eb3bd] disabled:bg-gray-200 text-white font-bold text-sm py-2.5 px-6 rounded-[8px] transition-all min-w-[100px]"
                        >
                          {hiring === prop.id ? '...' : 'Hire +'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-black disabled:text-gray-300 font-bold transition p-1"
              >
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-5 text-sm font-bold">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`transition ${
                      currentPage === pageNum ? 'text-black font-extrabold underline underline-offset-4' : 'text-gray-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-black disabled:text-gray-300 font-bold transition p-1"
              >
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}