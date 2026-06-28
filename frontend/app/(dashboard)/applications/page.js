'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApplicationsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/my-proposals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProposals(data.proposals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-50 text-green-600';
      case 'rejected': return 'bg-red-50 text-red-500';
      default: return 'bg-amber-50 text-amber-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <p className="text-gray-400 text-xs font-semibold">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-10 font-sans">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">My Applications</h1>
        <p className="text-xs text-gray-400">Track all your job proposals.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-12 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-4">You have not applied to any jobs yet.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="bg-[#00C6A9] text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-[#00b096] transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-all"
            >
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{p.job_title || 'Untitled Job'}</h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Bid: {p.bid_price || p.budget || '—'} Birr
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${statusBadge(p.status)}`}>
                  {p.status === 'accepted' ? 'Hired' : p.status === 'rejected' ? 'Declined' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.status === 'accepted' && (
                  <Link
                    href={`/escrow`}
                    className="text-xs bg-[#00C6A9] text-white font-semibold px-3 py-1.5 rounded hover:bg-[#00b096] transition-colors"
                  >
                    Manage Work
                  </Link>
                )}
                <Link
                  href={`/jobs/${p.job_id}`}
                  className="text-xs text-[#00C6A9] font-semibold hover:underline"
                >
                  View Job
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
