'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DISPUTE_REASONS = [
  'Work not delivered',
  'Poor quality',
  'Unauthorized charge',
  'Missed deadline',
  'Incomplete work',
  'Communication breakdown',
  'Other',
];

export default function RaiseDisputePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEscrow = searchParams.get('escrowId');

  const [escrows, setEscrows] = useState([]);
  const [selectedEscrow, setSelectedEscrow] = useState(preselectedEscrow || '');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;
    fetchEscrows();
  }, []);

  async function fetchEscrows() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEscrows(data.escrows?.filter(e => e.status === 'funded' || e.status === 'submitted') || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('reason', reason);
      formData.append('description', description);
      if (file) formData.append('evidence', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/${selectedEscrow}/dispute`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to raise dispute');

      setSuccess('Dispute raised. Admin will review your case.');
      setTimeout(() => router.push('/disputes'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500 text-sm font-semibold">Loading...</p>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/disputes" className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Raise a Dispute</h1>
        </div>
        <p className="text-gray-500 text-sm ml-8">We&apos;ll review your case and respond shortly.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">{error}</div>
      )}
      {success && (
        <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-xs font-medium">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Escrow Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Transaction</label>
          <select
            value={selectedEscrow}
            onChange={(e) => setSelectedEscrow(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 bg-white"
            required
          >
            <option value="">— Select an active escrow —</option>
            {escrows.map((e) => (
              <option key={e.id} value={e.id}>
                {e.amount} Birr — {e.id?.substring(0, 8)}... ({e.status})
              </option>
            ))}
          </select>
          {escrows.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">No active escrows available to dispute.</p>
          )}
        </div>

        {/* Reason Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 bg-white"
            required
          >
            <option value="">— Select a reason —</option>
            {DISPUTE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what happened in detail..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none"
            required
          />
        </div>

        {/* Evidence Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Evidence (optional)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-red-300 transition cursor-pointer" onClick={() => document.getElementById('evidence-file').click()}>
            <input
              id="evidence-file"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.zip"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 font-medium">{file.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-red-500 hover:text-red-700 text-xs font-semibold ml-2">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs text-gray-400 mt-1">Click to upload screenshots, documents, etc.</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || escrows.length === 0}
          className="w-full bg-red-500 text-white text-sm font-bold py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </form>
    </main>
  );
}
