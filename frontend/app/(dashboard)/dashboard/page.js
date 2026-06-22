'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalEscrow: 0, activeJobs: 0, completedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [proposals, setProposals] = useState([]);
  const [activeWork, setActiveWork] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    try {
      const user = JSON.parse(atob(token.split('.')[1]));
      setRole(user.role);
      setUserName(user.name || user.email?.split('@')[0] || 'User');;
      if (user.role === 'client') fetchClientData();
      else fetchFreelancerData();
    } catch { router.push('/auth/login'); }
  }, []);

  async function fetchClientData() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const jobList = data.data || [];
      setJobs(jobList);
      setStats({
        totalEscrow: jobList.reduce((sum, j) => sum + Number(j.budget || 0), 0),
        activeJobs: jobList.filter(j => j.status === 'open').length,
        completedJobs: jobList.filter(j => j.status === 'closed' || j.status === 'awarded').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFreelancerData() {
    try {
      const [propRes, jobsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/my-proposals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const propData = await propRes.json();
      const jobsData = await jobsRes.json();
      setProposals(propData.proposals || []);
      setJobs(jobsData.data?.jobs || []);
      setActiveWork((propData.proposals || []).filter(p => p.status === 'accepted'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500">Loading dashboard...</p>
    </div>
  );

  if (role === 'client') return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {userName} 👋</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-gray-500 text-xs">Client ▾</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#00C6A9] rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium opacity-80">Total money held</p>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.totalEscrow} Birr</p>
          <p className="text-xs opacity-70 mt-1">Active escrow</p>
        </div>

        <div className="bg-[#00C6A9] rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium opacity-80">Active Jobs</p>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.activeJobs}</p>
          <p className="text-xs opacity-70 mt-1">In progress</p>
        </div>

        <div className="bg-[#00C6A9] rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium opacity-80">Completed Jobs</p>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.completedJobs}</p>
          <p className="text-xs opacity-70 mt-1">All time</p>
        </div>
      </div>

      {/* Active Jobs */}
      <div className="bg-white rounded-xl border-2 border-blue-400 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Active Jobs</h2>
          <button
            onClick={() => router.push('/post-job')}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#00C6A9] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition"
          >
            + Post new Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No jobs posted yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.budget} Birr · Escrow Hold</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/jobs/${job.id}/applicants`)}
                    className="px-3 py-1.5 bg-[#00C6A9] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition"
                  >
                    View Applicants
                  </button>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Switch to Freelancer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-700">Switch to Freelancer Dashboard?</p>
            <p className="text-xs text-gray-400">Find jobs, apply and manage your work as a freelancer.</p>
          </div>
          <button className="text-xs font-semibold text-[#00C6A9] flex items-center gap-1 hover:underline">
            ⇄ Switch to Freelancer
          </button>
        </div>
      </div>
    </main>
  );

  // Freelancer Dashboard
  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName} 👋</h1>
          <p className="text-gray-500 text-sm">Find jobs, apply and grow your freelance career.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-gray-500 text-xs">Freelancer ▾</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#00C6A9] rounded-xl p-5 text-white">
          <p className="text-xs font-medium opacity-80 mb-2">Available Jobs</p>
          <p className="text-2xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-[#00C6A9] rounded-xl p-5 text-white">
          <p className="text-xs font-medium opacity-80 mb-2">My Applications</p>
          <p className="text-2xl font-bold">{proposals.length}</p>
        </div>
        <div className="bg-[#00C6A9] rounded-xl p-5 text-white">
          <p className="text-xs font-medium opacity-80 mb-2">Active Work</p>
          <p className="text-2xl font-bold">{activeWork.length}</p>
        </div>
        <div className="bg-[#00C6A9] rounded-xl p-5 text-white">
          <p className="text-xs font-medium opacity-80 mb-2">Total Earned</p>
          <p className="text-2xl font-bold">0 Birr</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Available Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Available Jobs</h2>
            <Link href="/jobs" className="text-xs text-[#00C6A9] font-semibold hover:underline">View all Jobs →</Link>
          </div>
          {jobs.slice(0, 4).map((job) => (
            <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.budget} Birr</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="px-3 py-1 bg-[#00C6A9] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition"
              >
                Apply
              </button>
            </div>
          ))}
          <button
            onClick={() => router.push('/jobs')}
            className="mt-4 w-full text-xs text-center text-[#00C6A9] font-semibold hover:underline"
          >
            Browse all Jobs →
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* My Applications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">My Applications</h2>
              <Link href="/applications" className="text-xs text-[#00C6A9] font-semibold hover:underline">View all</Link>
            </div>
            {proposals.length === 0 ? (
              <p className="text-gray-400 text-xs">No applications yet.</p>
            ) : (
              proposals.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <p className="text-sm text-gray-700 truncate max-w-[160px]">{p.job_id}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    p.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{p.status}</span>
                </div>
              ))
            )}
          </div>

          {/* Active Work */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Active Work</h2>
              <Link href="/active-work" className="text-xs text-[#00C6A9] font-semibold hover:underline">View all</Link>
            </div>
            {activeWork.length === 0 ? (
              <p className="text-gray-400 text-xs">No active work yet.</p>
            ) : (
              activeWork.slice(0, 2).map((w) => (
                <div key={w.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{w.job_id}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}