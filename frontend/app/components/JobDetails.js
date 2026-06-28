'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobDetails({ jobId }) {
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setJob(data.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `posted ${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `posted ${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return `posted ${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
        <p className="text-gray-400 text-xs font-semibold">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-10 py-5 bg-[#E8EDF0] border-b border-gray-200/60">
        <button
          type="button"
          onClick={() => router.push('/jobs')}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#00C6A9] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex items-center gap-3"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">User</p>
              <p className="text-xs text-gray-500">Freelancer</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-14 py-10">
        <div className="flex items-start gap-6">
          <div className="flex-1 bg-white p-8 min-h-[750px]">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">Client</p>
                  <p className="text-sm text-gray-500">Client</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{timeAgo(job.created_at)}</span>
                  <span className="text-gray-300">|</span>
                  <span>Fixed Price</span>
                </div>
                <span className="text-[#0D7BA5] bg-[#D8D0D0] px-5 py-1 rounded-full text-sm capitalize">
                  {job.status}
                </span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4">{job.title}</h1>

            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-900 mb-3">Job Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
            </div>
          </div>

          <div className="w-[300px] shrink-0 bg-white p-8">
            <h2 className="text-base font-bold text-gray-900 mb-6">Job Summary</h2>

            <div className="space-y-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Budget</p>
                  <p className="text-sm font-bold text-[#00C6A9]">{job.budget} Birr</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Escrow Protected</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Payment will be held in escrow and released after you approve the work.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push(`/jobs/${job.id}/apply`)}
                className="w-full flex items-center justify-center gap-2 bg-[#00C6A9] hover:bg-[#00b096] text-white text-sm font-bold py-3 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
