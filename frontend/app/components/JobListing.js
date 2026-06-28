'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_FILTERS = {
  searchQuery: '',
  sortBy: 'newest',
  sidebarCategory: 'all',
  minBudget: '',
  maxBudget: '',
  jobTypes: { fixedPrice: true, hourly: false },
  experienceLevels: { entry: false, intermediate: false, expert: false },
  skillsInput: '',
};

export default function JobListing() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_FILTERS.searchQuery);
  const [sortBy, setSortBy] = useState(DEFAULT_FILTERS.sortBy);
  const [sidebarCategory, setSidebarCategory] = useState(DEFAULT_FILTERS.sidebarCategory);
  const [minBudget, setMinBudget] = useState(DEFAULT_FILTERS.minBudget);
  const [maxBudget, setMaxBudget] = useState(DEFAULT_FILTERS.maxBudget);
  const [jobTypes, setJobTypes] = useState(DEFAULT_FILTERS.jobTypes);
  const [experienceLevels, setExperienceLevels] = useState(DEFAULT_FILTERS.experienceLevels);
  const [skillsInput, setSkillsInput] = useState(DEFAULT_FILTERS.skillsInput);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setJobs(data.data?.jobs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clearAllFilters = () => {
    setSearchQuery(DEFAULT_FILTERS.searchQuery);
    setSortBy(DEFAULT_FILTERS.sortBy);
    setSidebarCategory(DEFAULT_FILTERS.sidebarCategory);
    setMinBudget('');
    setMaxBudget('');
    setJobTypes({ ...DEFAULT_FILTERS.jobTypes });
    setExperienceLevels({ ...DEFAULT_FILTERS.experienceLevels });
    setSkillsInput(DEFAULT_FILTERS.skillsInput);
  };

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

  return (
    <div className="flex-1 flex flex-col p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Job Listings</h1>
        <p className="text-sm text-gray-500">Find the perfect job and grow your freelance career</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search jobs by title, skill, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white text-black placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00C6A9]"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-500">Sort by</span>
          <span className="text-gray-300">|</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-transparent text-sm text-black font-medium focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-6">
        <div className="flex-1 flex flex-col gap-4">
          {loading ? (
            <p className="text-gray-400 text-xs font-semibold text-center py-12">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No jobs posted yet.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-xs text-gray-500 max-w-lg leading-relaxed">{job.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right shrink-0">
                  <span className="text-sm font-bold text-[#00C6A9]">{job.budget} Birr</span>
                  <span className="text-xs font-semibold text-[#00C6A9]">Fixed Price</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {timeAgo(job.created_at)}
                  </div>
                  <button
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="text-xs font-semibold text-[#00C6A9] border border-[#00C6A9] rounded-full px-5 py-1.5 hover:bg-[#00C6A9] hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="w-[280px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-900">Filters</h2>
            <button type="button" onClick={clearAllFilters} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              clear all
            </button>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-900 mb-2">Category</label>
            <div className="relative">
              <select
                value={sidebarCategory}
                onChange={(e) => setSidebarCategory(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-[#00C6A9]"
              >
                <option value="all">All categories</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
              </select>
              <svg className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-900 mb-2">Budget</label>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Min" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} style={{ color: '#000000' }} className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs placeholder:text-gray-400 focus:outline-none" />
              <span className="text-xs text-gray-400">to</span>
              <input type="text" placeholder="Max" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} style={{ color: '#000000' }} className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs placeholder:text-gray-400 focus:outline-none" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-900 mb-2">Job Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={jobTypes.fixedPrice} onChange={(e) => setJobTypes((prev) => ({ ...prev, fixedPrice: e.target.checked }))} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                <span className="text-xs text-gray-700 font-medium">Fixed Price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={jobTypes.hourly} onChange={(e) => setJobTypes((prev) => ({ ...prev, hourly: e.target.checked }))} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                <span className="text-xs text-gray-700">Hourly</span>
              </label>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-900 mb-2">Experience Level</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={experienceLevels.entry} onChange={(e) => setExperienceLevels((prev) => ({ ...prev, entry: e.target.checked }))} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                <span className="text-xs text-gray-700">Entry Level</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={experienceLevels.intermediate} onChange={(e) => setExperienceLevels((prev) => ({ ...prev, intermediate: e.target.checked }))} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                <span className="text-xs text-gray-700">Intermediate</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={experienceLevels.expert} onChange={(e) => setExperienceLevels((prev) => ({ ...prev, expert: e.target.checked }))} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                <span className="text-xs text-gray-700">Expert</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-900 mb-2">Skills</label>
            <input type="text" placeholder="Add a Skill" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none" />
            <div className="text-[10px] text-gray-400 mb-2">Popular skills:</div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium cursor-pointer">React</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium cursor-pointer">Node.js</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium cursor-pointer">Python</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-[#00C6A9] hover:bg-[#00b096] text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
