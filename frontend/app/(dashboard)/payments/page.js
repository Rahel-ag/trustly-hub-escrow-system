'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;
    try {
      const user = JSON.parse(atob(token.split('.')[1]));
      setRole(user.role);
      setUserName(user.name || user.email?.split('@')[0] || 'User');
    } catch { return; }
    fetchEscrows();
  }, []);

  async function fetchEscrows() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEscrows(data.escrows || []);
      }
    } catch (err) {
      console.error('Failed to fetch escrows:', err);
    } finally {
      setLoading(false);
    }
  }

  const isFreelancer = role === 'freelancer';

  const stats = {
    total: escrows.reduce((s, e) => {
      if (e.status === 'released') return s + Number(e.amount);
      return s;
    }, 0),
    pending: escrows.filter(e => e.status === 'funded' || e.status === 'submitted').length,
    disputed: escrows.filter(e => e.status === 'disputed').length,
    active: escrows.filter(e => e.status !== 'released' && e.status !== 'refunded' && e.status !== 'pending_deposit' && e.status !== 'disputed').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'funded': return 'bg-teal-100 text-teal-700';
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'released': return 'bg-green-100 text-green-700';
      case 'refunded': return 'bg-blue-100 text-blue-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500 text-sm font-semibold">Loading payments...</p>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Payments</h1>
          <p className="text-gray-500 text-sm">
            {isFreelancer ? 'Your earnings and payment history.' : 'Your spending and payment history.'}
          </p>
        </div>
        <div className="w-9 h-9 bg-[#00C6A9] text-white rounded-full flex items-center justify-center font-semibold text-sm">
          {userName.charAt(0)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            {isFreelancer ? 'Total Earned' : 'Total Spent'}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total.toLocaleString()} Birr</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            {isFreelancer ? 'Pending' : 'Active'}
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.active}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">transactions in progress</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {escrows.filter(e => e.status === 'released' || e.status === 'refunded').length}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">payments released</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Disputed</p>
          <p className={`text-2xl font-bold mt-1 ${stats.disputed > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {stats.disputed}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">need resolution</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Transaction History</h2>
        </div>
        {escrows.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No payment transactions yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Transaction</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">{isFreelancer ? 'Client' : 'Freelancer'}</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {escrows.map((escrow) => (
                <tr key={escrow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-xs truncate max-w-[140px]">
                      {escrow.id?.substring(0, 8)}...
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    {isFreelancer
                      ? escrow.client_id?.substring(0, 8) + '...'
                      : escrow.freelancer_id?.substring(0, 8) + '...'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {escrow.amount} Birr
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${getStatusColor(escrow.status)}`}>
                      {escrow.status === 'pending_deposit' ? 'Pending Deposit' : escrow.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(escrow.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/escrow/${escrow.id}`)}
                      className="text-xs font-semibold text-[#00C6A9] border border-[#00C6A9] rounded-lg px-3 py-1.5 hover:bg-[#00C6A9] hover:text-white transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
