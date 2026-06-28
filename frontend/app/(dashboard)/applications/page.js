'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`);
        const data = await res.json();
        setApps([...savedJobs, ...(data.data || [])]);
      } catch (err) {
        console.error(err);
        setApps(JSON.parse(localStorage.getItem('savedJobs') || '[]'));
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const getStatusStyle = (status) =>
    status === 'Submitted'
      ? 'bg-green-50 text-green-600'
      : 'bg-amber-50 text-amber-600';

  if (loading) {
    return <div className="p-10 text-xs text-gray-500">Loading your applications...</div>;
  }

  return (
    <div className="p-10 max-w-5xl mx-auto font-sans">
      <h1 className="text-xl font-bold text-gray-900 mb-1">My Applications</h1>
      <p className="text-xs text-gray-400 mb-8">Track your saved positions and active job applications.</p>

      {apps.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-12 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-4">You haven't applied to or saved any jobs yet.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="bg-[#00C6A9] text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-[#00b096] transition-colors"
          >
            Explore Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-all"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900">{item.jobTitle || 'Video Editor Position'}</h3>
                <p className="text-[11px] text-gray-400 mt-1">Client: {item.clientName || 'Trustly Hub'}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(item.status)}`}>
                  {item.status || 'Saved'}
                </span>
                <button
                  onClick={() => router.push(`/jobs/${item.jobId}`)}
                  className="text-xs text-[#00C6A9] font-bold hover:underline"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}