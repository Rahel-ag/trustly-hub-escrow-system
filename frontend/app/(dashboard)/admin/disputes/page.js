'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function parseReason(raw) {
  const reasonMatch = raw?.match(/^Reason: (.+)/m);
  const descMatch = raw?.match(/Description: (.+)/m);
  const evidenceMatch = raw?.match(/Evidence: (.+)/m);
  return {
    reason: reasonMatch ? reasonMatch[1] : raw || '',
    description: descMatch ? descMatch[1] : '',
    evidence: evidenceMatch ? evidenceMatch[1] : null,
  };
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [acting, setActing] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;
    fetchDisputes();
  }, []);

  async function fetchDisputes() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/disputes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load disputes');
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(disputeId, decision) {
    setActing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/disputes/${disputeId}/decision`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      fetchDisputes();
    } catch (err) {
      setError(err.message);
    } finally {
      setActing(false);
    }
  }

  async function handleSaveNotes(disputeId) {
    if (!notesInput.trim()) return;
    setActing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/disputes/${disputeId}/notes`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesInput.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
      setNotesInput('');
      fetchDisputes();
    } catch (err) {
      setError(err.message);
    } finally {
      setActing(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500 text-sm font-semibold">Loading disputes...</p>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dispute Management</h1>
        <p className="text-gray-500 text-sm">Review evidence and make a resolution decision.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">{error}</div>
      )}

      {disputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No disputes to review.</div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const parsed = parseReason(d.reason);
            const isExpanded = expandedId === d.id;
            const isResolved = !!d.decision;
            const flaggedRole = d.flagged_by_role === 'client' ? 'Client' : d.flagged_by_role === 'freelancer' ? 'Freelancer' : d.flagged_by_role;

            return (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Summary Header */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${isResolved ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{d.job_title || 'Unknown Job'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Raised by <span className="font-medium text-gray-600">{d.flagged_by_name || d.flagged_by_email}</span> ({flaggedRole})
                        {d.created_at && ` · ${new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isResolved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {isResolved ? d.decision?.replace(/_/g, ' ') : 'Pending'}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5">
                    {/* Who Raised It */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Flagged By</p>
                        <p className="text-sm font-medium text-gray-900">{d.flagged_by_name || d.flagged_by_email}</p>
                        <p className="text-xs text-gray-500 capitalize">{flaggedRole} · {d.flagged_by_email}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Linked Escrow</p>
                        <p className="text-sm font-medium text-gray-900">{d.amount} Birr</p>
                        <p className="text-xs text-gray-500">ID: {d.escrow_id?.substring(0, 8)}... · Status: {d.escrow_status}</p>
                      </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="text-[10px] text-blue-500 uppercase tracking-wider font-semibold mb-1">Client</p>
                        <p className="text-sm font-medium text-gray-900">{d.client_name || d.client_email}</p>
                        <p className="text-xs text-gray-500">{d.client_email}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <p className="text-[10px] text-green-500 uppercase tracking-wider font-semibold mb-1">Freelancer</p>
                        <p className="text-sm font-medium text-gray-900">{d.freelancer_name || d.freelancer_email}</p>
                        <p className="text-xs text-gray-500">{d.freelancer_email}</p>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex gap-4 text-xs text-gray-400">
                      {d.escrow_created_at && (
                        <p>Escrow created: {new Date(d.escrow_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      )}
                      {d.created_at && (
                        <p>Dispute raised: {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      )}
                    </div>

                    {/* Reason & Description */}
                    <div className="space-y-2">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Reason</p>
                        <p className="text-sm text-gray-800">{parsed.reason}</p>
                      </div>
                      {parsed.description && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Description</p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{parsed.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Evidence */}
                    {parsed.evidence && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-2">Uploaded Evidence</p>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/uploads/${parsed.evidence}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#00C6A9] hover:bg-gray-100 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {parsed.evidence}
                        </a>
                      </div>
                    )}

                    {/* Admin Decision Result */}
                    {d.decision && (
                      <div className={`p-3 rounded-lg border ${d.decision === 'refund_client' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                        <p className={`text-xs font-medium ${d.decision === 'refund_client' ? 'text-blue-700' : 'text-green-700'}`}>
                          {d.decision === 'release_to_freelancer' ? '✓ Funds released to freelancer' :
                           d.decision === 'refund_client' ? '✓ Funds refunded to client' :
                           d.decision === 'reject' ? '✓ Dispute rejected — funds released as originally planned' :
                           d.decision.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}

                    {/* Internal Notes */}
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">Internal Notes</p>
                      {d.internal_notes && (
                        <div className="mb-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                          {d.internal_notes}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a note..."
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00C6A9]/30 focus:border-[#00C6A9]"
                        />
                        <button
                          onClick={() => handleSaveNotes(d.id)}
                          disabled={acting || !notesInput.trim()}
                          className="text-xs font-semibold text-[#00C6A9] border border-[#00C6A9] rounded-lg px-3 py-2 hover:bg-[#00C6A9] hover:text-white transition disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    {!d.decision && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400 font-semibold mb-3">Resolution Actions</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleDecision(d.id, 'release_to_freelancer')}
                            disabled={acting}
                            className="bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                          >
                            Release to Freelancer
                          </button>
                          <button
                            onClick={() => handleDecision(d.id, 'refund_client')}
                            disabled={acting}
                            className="bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                          >
                            Refund Client
                          </button>
                          <button
                            onClick={() => handleDecision(d.id, 'reject')}
                            disabled={acting}
                            className="bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                          >
                            Reject Dispute
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
