'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ApplyForJob() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState('');

  const [coverLetter, setCoverLetter] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  async function fetchJob() {
    setLoadingJob(true);
    setJobError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load job.');

      const data = await res.json();
      setJob(data.job || data.data || null);
    } catch (err) {
      setJobError(err.message || 'Failed to load job.');
    } finally {
      setLoadingJob(false);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          coverLetter,
          bidPrice: parseFloat(bidPrice),
        }),
      });

      if (response.ok) {
        router.push('/jobs');
      } else {
        const data = await response.json().catch(() => ({}));
        console.error('Proposal error:', data.message || 'Error submitting proposal');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 font-medium">Loading job...</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 font-medium">{jobError || 'Job not found'}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      
        
        {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col px-12 py-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 mb-1">Apply for Job</h1>
            <p className="text-gray-500 text-sm">Submit your proposal and bid securely</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.76-3.58-5-8-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Jhon Doe</p>
              <p className="text-xs text-gray-500">Freelancer</p>
            </div>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Job Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
          <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{job.description || job.desc}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-teal-600">Budget: {job.budget || job.price} Birr</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-8 pt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{job.time || job.postedAt || 'recently'}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Deadline: {job.deadline}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{job.type || job.budgetType || 'Fixed Price'}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* Cover Letter Section */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Cover Letter</h3>
            <p className="text-gray-500 text-sm mb-3">
              Introduce yourself and explain why you're the best fit for this project
            </p>

            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write your proposal here ..."
              className="w-full h-56 p-4 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Bid Price Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your Bid Price</h3>
            <p className="text-gray-500 text-sm mb-3">
              Enter the amount you will work for this project
            </p>

            <div className="flex items-center justify-between gap-6">
              <div className="flex gap-0 flex-1 max-w-md">
                <div className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-l-xl border border-r-0 border-gray-200 text-sm flex items-center">
                  Birr
                </div>
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  placeholder="Enter your proposed price"
                  className="flex-1 px-4 py-3 border border-gray-200 bg-white rounded-r-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(to right, #14b8a6, #0e6b63)',
                  opacity: isSubmitting ? 0.5 : 1,
                  color: '#ffffff',
                }}
                className="font-bold py-3.5 px-10 rounded-xl flex items-center gap-2 transition-opacity text-sm whitespace-nowrap shadow-sm hover:opacity-90"
              >
                <svg className="w-4 h-4" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 20l18-8L3 4v6l13 2-13 2v6z" />
                </svg>
                <span style={{ color: '#ffffff' }}>{isSubmitting ? 'Submitting...' : 'Submit Proposal'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}