'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    fetchDisputes();
  }, []);

  async function fetchDisputes() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/disputes/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function parseReason(raw) {
    const reasonMatch = raw.match(/^Reason: (.+)/m);
    const descMatch = raw.match(/Description: (.+)/m);
    const evidenceMatch = raw.match(/Evidence: (.+)/m);
    return {
      reason: reasonMatch ? reasonMatch[1] : raw,
      description: descMatch ? descMatch[1] : '',
      evidence: evidenceMatch ? evidenceMatch[1] : null,
    };
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500 text-sm font-semibold">Loading disputes...</p>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Disputes</h1>
          <p className="text-gray-500 text-sm">Raise and track dispute resolutions.</p>
        </div>
        <Link
          href="/disputes/new"
          className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Raise Dispute
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">{error}</div>
      )}

      {disputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No disputes yet.
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => {
            const parsed = parseReason(d.reason);
            return (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900">{d.job_title || 'Job'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${d.decision ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {d.decision ? 'Resolved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Escrow: {d.escrow_id?.substring(0, 8)}... — {d.amount} Birr
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg">
                        <span className="font-medium text-gray-700">Reason: </span>{parsed.reason}
                      </p>
                      {parsed.description && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                          <span className="font-medium text-gray-700">Description: </span>{parsed.description}
                        </p>
                      )}
                      {parsed.evidence && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/uploads/${parsed.evidence}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C6A9] hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          View Evidence
                        </a>
                      )}
                    </div>
                    {d.decision && (
                      <div className={`mt-2 p-2.5 rounded-lg border ${d.decision === 'refund_client' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                        <p className={`text-xs font-medium ${d.decision === 'refund_client' ? 'text-blue-700' : 'text-green-700'}`}>
                          {d.decision === 'refund_client' ? '✓ Refunded — Payment returned to client' :
                           d.decision === 'release_to_freelancer' ? '✓ Released — Payment sent to freelancer' :
                           d.decision === 'reject' ? '✓ Rejected — Funds released as originally planned' :
                           `Decision: ${d.decision}`}
                        </p>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/escrow/${d.escrow_id}`}
                    className="text-xs text-[#00C6A9] font-semibold hover:underline shrink-0 ml-4"
                  >
                    View Escrow
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
