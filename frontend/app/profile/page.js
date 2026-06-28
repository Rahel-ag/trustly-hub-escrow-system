'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '../components/DashboardSidebar';
import AuthGuard from '../components/AuthGuard';

// ── helper: decode JWT payload ────────────────────────────────────────────────
function parseToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// ── Info row inside Account Information card ──────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: '#e6faf4' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
      </div>
    </div>
  );
}

// ── Edit Profile modal ────────────────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    phone:    user.phone    || '',
    bio:      user.bio      || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Update failed');
      }
      const data = await res.json();
      onSave(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Edit Profile</h2>
        <p className="text-xs text-gray-400 mb-6">Update your account information</p>

        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bio / Skills</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition disabled:opacity-60"
              style={{ background: '#00c896' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Payout card ───────────────────────────────────────────────────────────────
function PayoutCard({ payout, onSave }) {
  const [open, setOpen]       = useState(false);
  const [method, setMethod]   = useState(payout?.method || 'chapa');
  const [account, setAccount] = useState(payout?.account || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/payout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method, account }),
      });
      if (res.ok) {
        const data = await res.json();
        onSave(data.payout);
        setSaved(true);
        setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  const methodLabels = { chapa: 'Chapa Wallet', telebirr: 'Telebirr', cbe: 'CBE Birr' };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Payout Configuration</h2>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal-400 text-teal-600 hover:bg-teal-50 transition"
        >
          {open ? 'Cancel' : payout ? 'Edit' : 'Connect'}
        </button>
      </div>

      {!open && payout && (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400">Connected via</p>
            <p className="text-sm font-semibold text-gray-800">{methodLabels[payout.method]} — {payout.account}</p>
          </div>
        </div>
      )}

      {!open && !payout && (
        <p className="text-sm text-gray-400">No payout method connected yet.</p>
      )}

      {open && (
        <div className="space-y-3 mt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none bg-white"
            >
              <option value="chapa">Chapa Wallet</option>
              <option value="telebirr">Telebirr</option>
              <option value="cbe">CBE Birr</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number / Phone</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="e.g. 0911234567"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading || !account}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition disabled:opacity-60"
            style={{ background: '#00c896' }}
          >
            {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Payout Method'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Metrics cards ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '20' }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  const [user,        setUser]        = useState(null);
  const [payout,      setPayout]      = useState(null);
  const [metrics,     setMetrics]     = useState(null);
  const [editOpen,    setEditOpen]    = useState(false);
  const [loading,     setLoading]     = useState(true);

  // ── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = parseToken(token);
    if (!decoded) return;

    // Fetch full profile from API
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setPayout(data.payout || null);
        } else {
          // Fallback to token data if API not ready
          setUser({
            id:        decoded.id,
            email:     decoded.email,
            role:      decoded.role,
            fullName:  decoded.fullName || decoded.email?.split('@')[0],
            createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
          });
        }

        // Fetch metrics
        const mRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          setMetrics(mData.metrics);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const role        = user?.role || 'client';
  const roleLabel   = role.charAt(0).toUpperCase() + role.slice(1);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'N/A';

  // Role-based metrics
  const clientMetrics = [
    { label: 'Jobs Posted',    value: metrics?.jobsPosted,    icon: '💼', color: '#6366f1' },
    { label: 'Active Escrow',  value: metrics?.activeEscrow,  icon: '🔒', color: '#f59e0b' },
    { label: 'Total Spent',    value: metrics?.totalSpent ? `$${metrics.totalSpent}` : '0', icon: '💰', color: '#10b981' },
  ];

  const freelancerMetrics = [
    { label: 'Proposals Sent',  value: metrics?.proposalsSent,  icon: '📨', color: '#6366f1' },
    { label: 'Jobs Completed',  value: metrics?.jobsCompleted,  icon: '✅', color: '#10b981' },
    { label: 'Total Earned',    value: metrics?.totalEarned ? `$${metrics.totalEarned}` : '0', icon: '💰', color: '#f59e0b' },
  ];

  const metricsToShow = role === 'freelancer' ? freelancerMetrics : clientMetrics;

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-xs text-gray-400 mt-0.5">View and manage your account information.</p>
          </div>
          {/* User badge top-right */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800 leading-none">{displayName}</p>
              <p className="text-xs text-gray-400">{roleLabel} ▾</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 py-6 space-y-5">

          {/* ── Profile header card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 border-4 border-white shadow">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>

            {/* Name + role */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <span
                className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: '#e6faf4', color: '#00a87a' }}
              >
                {roleLabel}
              </span>
              <p className="text-xs text-gray-400 mt-1.5">Member since {memberSince}.</p>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: '#00c896' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* ── Two column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Account Information</h2>
              <InfoRow
                label="Full Name"
                value={displayName}
                icon={
                  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <InfoRow
                label="Email Address"
                value={user?.email}
                icon={
                  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              <InfoRow
                label="Role"
                value={roleLabel}
                icon={
                  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              {user?.phone && (
                <InfoRow
                  label="Phone"
                  value={user.phone}
                  icon={
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
              )}
              {user?.bio && (
                <InfoRow
                  label="Bio / Skills"
                  value={user.bio}
                  icon={
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
              )}
            </div>

            {/* Payout */}
            <PayoutCard payout={payout} onSave={setPayout} />
          </div>

          {/* ── Metrics ── */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">
              {role === 'freelancer' ? 'My Activity' : 'My Transactions'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {metricsToShow.map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => { setUser((u) => ({ ...u, ...updated })); setEditOpen(false); }}
        />
      )}
    </div>
    </AuthGuard>
  );
}
