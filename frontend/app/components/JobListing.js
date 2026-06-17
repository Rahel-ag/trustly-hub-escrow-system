'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';


const DEFAULT_FILTERS = {
  searchQuery: '',
  topCategory: 'all',
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
  const [searchQuery, setSearchQuery] = useState(DEFAULT_FILTERS.searchQuery);
  const [topCategory, setTopCategory] = useState(DEFAULT_FILTERS.topCategory);
  const [sortBy, setSortBy] = useState(DEFAULT_FILTERS.sortBy);
  const [sidebarCategory, setSidebarCategory] = useState(DEFAULT_FILTERS.sidebarCategory);
  const [minBudget, setMinBudget] = useState(DEFAULT_FILTERS.minBudget);
  const [maxBudget, setMaxBudget] = useState(DEFAULT_FILTERS.maxBudget);
  const [jobTypes, setJobTypes] = useState(DEFAULT_FILTERS.jobTypes);
  const [experienceLevels, setExperienceLevels] = useState(DEFAULT_FILTERS.experienceLevels);
  const [skillsInput, setSkillsInput] = useState(DEFAULT_FILTERS.skillsInput);
  const [filterKey, setFilterKey] = useState(0);

  const clearAllFilters = () => {
    setSearchQuery(DEFAULT_FILTERS.searchQuery);
    setTopCategory(DEFAULT_FILTERS.topCategory);
    setSortBy(DEFAULT_FILTERS.sortBy);
    setSidebarCategory(DEFAULT_FILTERS.sidebarCategory);
    setMinBudget('');
    setMaxBudget('');
    setFilterKey((key) => key + 1);
    setJobTypes({ ...DEFAULT_FILTERS.jobTypes });
    setExperienceLevels({ ...DEFAULT_FILTERS.experienceLevels });
    setSkillsInput(DEFAULT_FILTERS.skillsInput);
  };

  // Mock data for the job list matching the design
  const jobs = [
    {
      id: 1,
      title: 'Modern Website redesign',
      desc: 'We need a modern and responsive website redesign for our company. The site must be fast, SEO-friendly and mobile...',
      price: '15,000-20,000birr',
      type: 'Fixed Price',
      time: 'posted 5 hr ago',
      icon: 'monitor'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      desc: 'Looking for an experienced developer to build a cross-platform mobile app for iOS and Android. The app is for...',
      price: '35,000-50,000birr',
      type: 'Fixed Price',
      time: 'posted 1 day ago',
      icon: 'mobile'
    },
    {
      id: 3,
      title: 'Video Editing',
      desc: 'We are looking for a creative and detail-oriented Video Editor to join our project. The ideal candidate should be able to transform raw footage into...',
      price: '3000-5000birr',
      type: 'Fixed Price',
      time: 'posted 1 hr ago',
      icon: 'video'
    },
    {
      id: 4,
      title: 'E-Commerce Website',
      desc: 'Build a fully function e-commerce website with product pages, cart, checkout and payment integration.',
      price: '40,000-70,000birr',
      type: 'Fixed Price',
      time: 'posted a week ago',
      icon: 'cart'
    }
  ];
  

  // Helper function to render the correct SVG icon based on job type
  const renderIcon = (type) => {
    switch (type) {
      case 'monitor':
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'mobile':
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'cart':
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F7F9] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#0A1D27] text-white flex flex-col justify-between select-none shrink-0">
        <div>
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center py-6">
            <img 
              src="/logo.png" 
              alt="TrustlyHub Logo" 
              className="w-[180px] h-auto object-contain select-none" 
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 px-4 mt-4">
            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button className="flex items-center gap-3 px-4 py-3 bg-[#113A42] text-white rounded-lg border-l-4 border-[#00C6A9]">
              <svg className="w-5 h-5 text-[#00C6A9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Jobs</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">My Applications</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-medium">Active Work</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="font-medium">Payment</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 mb-4">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg w-full border-t border-gray-700/50 pt-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto p-10">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Job Listings</h1>
          <p className="text-sm text-gray-500">Find the perfect job and grow your freelance career</p>
        </div>

        {/* Search & Sort Bar */}
<div className="flex items-center gap-4 mb-8">

  <div className="relative flex-1">
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      type="text"
      placeholder="Search jobs by title, skill, or keyword..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-white text-black placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00C6A9]"  
    />
  </div>

  <div className="relative w-[200px]">
    <select
      value={topCategory}
      onChange={(e) => setTopCategory(e.target.value)}
      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-black focus:outline-none"
    >
      <option value="all">All Categories</option>
      <option value="web">Web Development</option>
      <option value="design">Design</option>
      <option value="mobile">Mobile Development</option>
      <option value="video">Video Editing</option>
    </select>

    <svg
      className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
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

        <div className="text-sm font-semibold text-gray-900 mb-4">58 jobs found</div>

        {/* Content & Filters Grid */}
        <div className="flex items-start gap-6">
          
          {/* LEFT COLUMN: Job List */}
          <div className="flex-1 flex flex-col gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                
                {/* Left side: Icon & Info */}
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {renderIcon(job.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                      <span className="bg-indigo-50 text-indigo-500 text-[10px] font-bold px-2 py-0.5 rounded">Featured</span>
                    </div>
                    <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
                      {job.desc}
                    </p>
                  </div>
                </div>

                {/* Right side: Meta & Action */}
                <div className="flex flex-col items-end gap-1 text-right shrink-0">
                  <span className="text-sm font-bold text-[#00C6A9]">{job.price}</span>
                  <span className="text-xs font-semibold text-[#00C6A9]">{job.type}</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.time}
                  </div>
                 <button 
  onClick={() => router.push(`/jobs/${job.id}`)}
  className="text-xs font-semibold text-[#00C6A9] border border-[#00C6A9] rounded-full px-5 py-1.5 hover:bg-[#00C6A9] hover:text-white transition-colors"
>
  View Details
</button>
                </div>
              </div>
            ))}

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-center gap-4 mt-6 text-sm font-medium text-gray-500">
              <button className="hover:text-[#00C6A9]">&lt;</button>
              <button className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center">1</button>
              <button className="hover:text-[#00C6A9]">2</button>
              <button className="hover:text-[#00C6A9]">3</button>
              <span>...</span>
              <button className="hover:text-[#00C6A9]">5</button>
              <button className="hover:text-[#00C6A9]">&gt;</button>
            </div>
          </div>

          {/* RIGHT COLUMN: Filters Sidebar */}
          <div className="w-[280px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-900">Filters</h2>
             <button
  type="button"
  onClick={clearAllFilters}
  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
>
  clear all
</button>
            </div>

            {/* Category Filter */}
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

            {/* Budget Filter */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-900 mb-2">Budget</label>
              <div className="flex items-center gap-2">
                <input
  type="text"
  placeholder="Min"
  value={minBudget}
  onChange={(e) => setMinBudget(e.target.value)}
  style={{ color: '#000000' }}
  className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs placeholder:text-gray-400 focus:outline-none"
/>
                <span className="text-xs text-gray-400">to</span>
                <input
  type="text"
  placeholder="Max"
  value={maxBudget}
  onChange={(e) => setMaxBudget(e.target.value)}
  style={{ color: '#000000' }}
  className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs placeholder:text-gray-400 focus:outline-none"
/>
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-900 mb-2">Job Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jobTypes.fixedPrice}
                    onChange={(e) => setJobTypes((prev) => ({ ...prev, fixedPrice: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700 font-medium">Fixed Price</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jobTypes.hourly}
                    onChange={(e) => setJobTypes((prev) => ({ ...prev, hourly: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700">Hourly</span>
                </label>
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-900 mb-2">Experience Level</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={experienceLevels.entry}
                    onChange={(e) => setExperienceLevels((prev) => ({ ...prev, entry: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700">Entry Level</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={experienceLevels.intermediate}
                    onChange={(e) => setExperienceLevels((prev) => ({ ...prev, intermediate: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700">Intermediate</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={experienceLevels.expert}
                    onChange={(e) => setExperienceLevels((prev) => ({ ...prev, expert: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700">Expert</span>
                </label>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-900 mb-2">Skills</label>
              <input
                type="text"
                placeholder="Add a Skill"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none"
              />
              <div className="text-[10px] text-gray-400 mb-2">Popular skills:</div>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium cursor-pointer">React</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium cursor-pointer">Node.js</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium cursor-pointer">Python</span>
              </div>
            </div>

            {/* Apply Button */}
            <button className="w-full flex items-center justify-center gap-2 bg-[#00C6A9] hover:bg-[#00b096] text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filters
            </button>
            
          </div>
        </div>

      </main>
    </div>
  );
}