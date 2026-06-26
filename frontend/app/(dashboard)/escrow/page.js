'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EscrowListPage() {
  const router = useRouter();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState({ name: '', role: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { 
      router.push('/auth/login'); 
      return; 
    }

    // Parse user profile from JWT payload dynamically
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      setUserProfile({
        name: decodedPayload.name || decodedPayload.email?.split('@')[0] || 'User',
        role: decodedPayload.role ? decodedPayload.role.charAt(0).toUpperCase() + decodedPayload.role.slice(1) : 'Freelancer'
      });
    } catch (e) {
      console.error("Failed to parse auth token context on escrow list", e);
    }

    fetchEscrows();
  }, []);

  async function fetchEscrows() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok && res.headers.get('content-type')?.includes('json')) {
        const data = await res.json();
        setEscrows(data.escrows || []);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Failed to fetch escrows:', err);
    }
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'funded': return 'bg-teal-100 text-teal-700';
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-700';
      case 'released': return 'bg-green-100 text-green-700';
      case 'refunded': return 'bg-blue-100 text-blue-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500">Loading escrows...</p>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Escrow</h1>
          <p className="text-gray-500 text-sm">Manage your escrow transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00C6A9] text-white rounded-full flex items-center justify-center font-semibold text-sm">
            {userProfile.name.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{userProfile.name}</p>
            <p className="text-gray-500 text-xs">{userProfile.role} ▾</p>
          </div>
        </div>
      </div>

      {escrows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No escrow transactions yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Job</th>
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
                    <p className="font-medium text-blue-500 truncate max-w-[180px]">{escrow.job_id}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {escrow.amount} Birr
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(escrow.status)}`}>
                      {escrow.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(escrow.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {userProfile.role === 'Client' && escrow.status === 'pending_deposit' && (
                      <button
                        onClick={() => router.push(`/escrow/deposit?jobId=${escrow.job_id}`)}
                        className="text-xs font-semibold text-white bg-[#00C6A9] rounded-lg px-3 py-1.5 hover:brightness-110 transition"
                      >
                        Deposit
                      </button>
                    )}
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
        </div>
      )}
    </main>
  );
}
