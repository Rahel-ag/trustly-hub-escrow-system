'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostJob() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const TITLE_MAX = 10;
  const DESC_MAX = 500;
  const SKILL_MAX = 10;

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = skillInput.trim();
      if (value && skills.length < SKILL_MAX && !skills.includes(value)) {
        setSkills((prev) => [...prev, value]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !budget) {
      setError('Title, description, and budget are required.');
      return;
    }

    if (isNaN(budget) || Number(budget) <= 0) {
      setError('Budget must be a positive number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          budget: parseFloat(budget),
          skills,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to post job.');
      }

      alert('Job posted successfully!');
      router.push('/jobs');
    } catch (err) {
      setError(err.message || 'Failed to post job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
           {/* SIDEBAR */}
       <aside className="w-[260px] bg-[#0A1D27] text-white flex flex-col justify-between select-none shrink-0">
        <div>
          <div className="flex flex-col items-center justify-center py-6">
            <img src="/logo.png" alt="TrustlyHub Logo" className="w-[180px] h-auto object-contain select-none" />
          </div>


          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-4 mt-4">
            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-semibold">Dashboard</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 bg-[#1FB6C9] text-white rounded-lg font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Jobs</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="font-semibold">Payments</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold">Profile</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="px-4 pb-6">
          <div className="border-t border-gray-700/50 pt-4">
            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg w-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col px-12 py-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.76-3.58-5-8-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Jhon Doe</p>
              <p className="text-xs text-gray-500">Client</p>
            </div>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-3xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Job Title */}
            <div className="mb-7">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Enter a short and clear title for your Job.</p>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX * 10))}
                  placeholder="E.g. Website Development"
                  className="w-full px-4 py-3 pr-14 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {title.length}/{TITLE_MAX * 10}
                </span>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-7">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Job Description <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Describe the job, requirements, and what you're looking for.</p>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
                  placeholder="Describe your project in detail..."
                  className="w-full h-32 px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 resize-none"
                />
                <span className="absolute right-4 bottom-3 text-xs text-gray-400">
                  {description.length}/{DESC_MAX}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="mb-7">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Budget <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Enter your budget range or fixed amount.</p>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="E.g. 1000 birr"
                className="w-full max-w-xs px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Skills */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-900 mb-1">Skills (optional)</label>
              <p className="text-xs text-gray-500 mb-2">Add relevant skills to help freelancers find your job.</p>
              <div className="relative">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="E.g. Node.js, React"
                  className="w-full px-4 py-3 pr-14 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {skills.length}/{SKILL_MAX}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Press enter after each skill.</p>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-teal-500 hover:text-teal-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(to right, #14b8a6, #0e6b63)',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
                className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition"
              >
                {isSubmitting ? 'Posting...' : 'Post Job'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l18-8L3 4v6l13 2-13 2v6z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}