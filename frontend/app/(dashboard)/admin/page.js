'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500 text-sm font-semibold">Loading admin panel...</p>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats?.users?.total || 0, sub: `${stats?.users?.clients || 0} clients · ${stats?.users?.freelancers || 0} freelancers`, color: 'bg-indigo-500' },
    { label: 'Total Jobs', value: stats?.jobs?.total || 0, sub: `${stats?.jobs?.open || 0} open · ${stats?.jobs?.closed || 0} closed`, color: 'bg-blue-500' },
    { label: 'Escrow Value', value: `${parseFloat(stats?.escrow?.total_value || 0).toLocaleString()} Birr`, sub: `${stats?.escrow?.total || 0} transactions`, color: 'bg-teal-500' },
    { label: 'Pending Disputes', value: stats?.disputes?.pending || 0, sub: `${stats?.disputes?.resolved || 0} resolved`, color: 'bg-red-500' },
  ];

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${card.color}`} />
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Escrow Status Breakdown</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Pending Deposit</span><span className="font-semibold">{stats?.escrow?.pending || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Locked / Funded</span><span className="font-semibold">{stats?.escrow?.locked || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Approved / Released</span><span className="font-semibold">{stats?.escrow?.approved || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Disputed</span><span className="font-semibold text-red-600">{stats?.escrow?.disputed || 0}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Dispute Status</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Pending Review</span><span className="font-semibold text-amber-600">{stats?.disputes?.pending || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Resolved</span><span className="font-semibold text-green-600">{stats?.disputes?.resolved || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold text-gray-900">{stats?.disputes?.total || 0}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
