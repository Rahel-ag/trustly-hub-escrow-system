'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEscrowsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    fetchEscrows();
  }, []);

  async function fetchEscrows() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/escrow`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load escrows');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'funded': return 'bg-teal-100 text-teal-700';
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'released': return 'bg-green-100 text-green-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500 text-sm font-semibold">Loading escrows...</p>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Escrow Transactions</h1>
        <p className="text-gray-500 text-sm">All escrow transactions across the platform.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">{error}</div>
      )}

      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No escrow transactions.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Job</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Freelancer</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs text-gray-900 font-medium truncate max-w-[150px]">{t.job_title || t.job_id?.substring(0, 8)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{t.client_email}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{t.freelancer_email}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{t.amount} Birr</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${getStatusColor(t.status)}`}>
                      {t.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
