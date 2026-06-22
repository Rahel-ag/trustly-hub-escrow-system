'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elsie } from 'next/font/google';

export default function ReviewApprovePage() {
  const { id } = useParams();
  const router = useRouter();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    fetchEscrow();
  }, [id]);

  async function fetchEscrow() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/job/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load escrow');
      setEscrow(data.escrow);
  } catch (err) {
  if (err.message.includes('Unexpected token') || err.message.includes('JSON')) {
    setError(''); // Keep this empty to hide the red banner until the route is ready
  } else {
    setError(err.message);
  }
 } finally {
  setLoading(false);
  }
}


  async function handleApprove() {
    setActing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/${escrow.id}/release`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to release payment');
      setSuccess('Payment released successfully!');
      setEscrow((prev) => ({ ...prev, status: 'released' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    setActing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/${escrow.id}/dispute`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to raise dispute');
      setSuccess('Dispute raised successfully.');
      setEscrow((prev) => ({ ...prev, status: 'disputed' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActing(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push('/jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
            J
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">Jhon Doe</p>
            <p className="text-gray-500 text-xs">Client ▾</p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review & Approve Work</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}

      {!escrow ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No escrow found for this job.
        </div>
      ) : (
        <div className="max-w-2xl flex flex-col gap-6">

          {/* Submitted Work */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Submitted Work</h2>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted deliverable</p>
                  <p className="text-xs text-gray-400">Escrow amount: {escrow.amount} Birr</p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-[#00C6A9] border border-[#00C6A9] rounded-lg px-3 py-1.5 hover:bg-[#00C6A9] hover:text-white transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Freelancer Message */}
          <div className="bg-white rounded-xl border-2 border-blue-400 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Freelancer Message</h2>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 text-center leading-relaxed mb-3">
              Hi please find the completed work as per the requirements<br />
              let me know if any changes are needed.<br />
              Thank you!
            </div>
            <p className="text-xs text-gray-400">
              Submitted on {new Date(escrow.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>

          {/* Actions */}
          {escrow.status === 'funded' && (
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#00C6A9] text-[#00C6A9] font-semibold text-sm hover:bg-[#00C6A9] hover:text-white transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {acting ? 'Processing...' : 'Approve & Release Payment'}
              </button>
              <button
                onClick={handleReject}
                disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-400 text-red-500 font-semibold text-sm hover:bg-red-500 hover:text-white transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                {acting ? 'Processing...' : 'Reject Work'}
              </button>
            </div>
          )}

          {escrow.status === 'released' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center text-green-600 font-semibold text-sm">
              ✓ Payment has been released to the freelancer.
            </div>
          )}

          {escrow.status === 'disputed' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-600 font-semibold text-sm">
              ⚠ Dispute raised. Admin will review this case.
            </div>
          )}
        </div>
      )}
    </main>
  );
}