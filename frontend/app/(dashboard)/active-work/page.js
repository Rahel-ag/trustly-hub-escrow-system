'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActiveWorkPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/active`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load active contracts.');
        return res.json();
      })
      .then(data => setContracts(data.data || []))
      .catch(err => setError(err.message || 'Failed to load active contracts.'))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    switch (status) {
      case 'Hired': return 'bg-blue-50 text-blue-600';
      case 'Awaiting Review': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <p className="text-gray-500 text-xs font-semibold">Loading active contracts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-10 font-sans">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">My Active Work</h1>
        <p className="text-xs text-gray-400">View and manage your ongoing contracts.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-red-600">{error}</p>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-12 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-4">You have no active contracts right now.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="bg-[#00C6A9] text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-[#00b096] transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-all"
            >
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{contract.title}</h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Client: {contract.client_name || 'Trustly Hub'} &middot; Budget: {contract.contract_budget || contract.budget} Birr
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${statusBadge(contract.status)}`}>
                  {contract.status}
                </span>
              </div>
              <button
                onClick={() => router.push(`/active-work/${contract.id}/submit-work`)}
                className="bg-[#00C6A9] hover:bg-[#00b096] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm"
              >
                Submit Work
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
