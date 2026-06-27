'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostJob() {
  const router = useRouter();

  // Navigation and UI states
  const [role, setRole] = useState('Client');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Form states
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillsInput, setSkillsInput] = useState('');
  
  // API states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Limits
  const MAX_TITLE_WORDS = 10;
  const MAX_DESC_WORDS = 500;
  const MAX_SKILL_INPUT = 50;
  const MAX_SKILLS = 10;

  // Popular skills with categories
  const popularSkills = [
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Python', category: 'Programming' },
    { name: 'UI/UX Design', category: 'Design' },
    { name: 'Flutter', category: 'Mobile' },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleCancel = () => {
    setJobTitle('');
    setJobDescription('');
    setBudget('');
    setSelectedSkills([]);
    setSkillsInput('');
    setError('');
  };

  // Truncate title to max words
  const truncateTitle = (text, maxWords) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ');
    }
    return text;
  };

  // Handle title change with word limit
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setJobTitle(truncateTitle(value, MAX_TITLE_WORDS));
  };

  // Truncate description to max words
  const truncateDescription = (text, maxWords) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ');
    }
    return text;
  };

  // Handle description change with word limit
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setJobDescription(truncateDescription(value, MAX_DESC_WORDS));
  };

  // Handle skill input - limit characters
  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_SKILL_INPUT) {
      setSkillsInput(value);
    }
  };

  // Add skill on Enter or when user selects from popular
  const handleAddSkill = (skillName = null) => {
    if (selectedSkills.length >= MAX_SKILLS) {
      setError(`Maximum ${MAX_SKILLS} skills allowed`);
      return;
    }

    const skill = skillName || skillsInput.trim();
    
    if (skill && !selectedSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())) {
      // Try to find category from popular skills or use default
      const popular = popularSkills.find(s => s.name.toLowerCase() === skill.toLowerCase());
      const category = popular ? popular.category : 'Other';
      
      setSelectedSkills([...selectedSkills, { name: skill, category }]);
      setSkillsInput('');
      setError('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillName) => {
    setSelectedSkills(selectedSkills.filter(s => s.name !== skillName));
  };

  // Handle Enter key in skill input
  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter' && skillsInput.trim()) {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare skills as comma-separated string
      const skillsStr = selectedSkills.map(s => s.name).join(', ');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          title: jobTitle, 
          description: jobDescription, 
          budget 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to post job');
      }

      router.push('/dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const titleWordCount = jobTitle.split(' ').filter(w => w).length;
  const descWordCount = jobDescription.split(' ').filter(w => w).length;

  return (
    <div className="flex h-screen bg-[#F4F7F9] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#0A1D27] text-white flex flex-col justify-between select-none">
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
              {/* Dashboard Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button className="flex items-center gap-3 px-4 py-3 bg-[#113A42] text-white rounded-lg border-l-4 border-[#00C6A9]">
              {/* Briefcase Icon */}
              <svg className="w-5 h-5 text-[#00C6A9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Jobs</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              {/* Credit Card Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="font-medium">Payment</span>
            </button>

            <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg">
              {/* User Icon */}
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
            {/* Logout Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-10 py-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              {/* Arrow Left */}
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                 <svg className="w-6 h-6 text-gray-400 mt-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Jhon Doe</span>
                <div className="flex items-center text-xs text-gray-500">
                  {role} 
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-10">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => { setRole('Client'); setIsDropdownOpen(false); }}
                >
                  Client
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => { setRole('Freelancer'); setIsDropdownOpen(false); }}
                >
                  Freelancer
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Form Section */}
        <div className="p-10 flex-1 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Job Title */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Enter a short and clear title for your Job.</p>
                <div className="relative">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={handleTitleChange}
                    placeholder="Eg. Website Development"
                    className="w-full border border-gray-200 rounded-md p-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00C6A9] focus:border-[#00C6A9]"
                    required
                  />
                  <span className="absolute right-3 top-3 text-xs text-gray-400">
                    {titleWordCount}/{MAX_TITLE_WORDS} words
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Describe the job, requirements, and what you're looking for.</p>
                <div className="relative">
                  <textarea
                    value={jobDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Describe your project in detail."
                    rows={5}
                    className="w-full border border-gray-200 rounded-md p-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00C6A9] focus:border-[#00C6A9] resize-none"
                    required
                  />
                  <span className="absolute right-3 bottom-3 text-xs text-gray-400">
                    {descWordCount}/{MAX_DESC_WORDS} words
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Budget <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Enter your budget range or fixed amount.</p>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Eg. 1000 birr"
                  className="w-1/2 border border-gray-200 rounded-md p-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00C6A9] focus:border-[#00C6A9]"
                  required
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Skills <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">Add relevant skills to help freelancers find your job. Max {MAX_SKILLS} skills.</p>
                
                {/* Skill Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={handleSkillInputChange}
                      onKeyPress={handleSkillKeyPress}
                      maxLength={MAX_SKILL_INPUT}
                      placeholder="Eg. React, Node.js"
                      disabled={selectedSkills.length >= MAX_SKILLS}
                      className="w-full border border-gray-200 rounded-md p-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00C6A9] focus:border-[#00C6A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-3 text-xs text-gray-400">
                      {skillsInput.length}/{MAX_SKILL_INPUT}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Press Enter to add skill</p>
                </div>

                {/* Selected Skills Tags */}
                {selectedSkills.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <div
                          key={skill.name}
                          className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3 py-2"
                        >
                          <div>
                            <p className="text-xs font-semibold text-teal-700">{skill.name}</p>
                            <p className="text-[10px] text-teal-600">{skill.category}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill.name)}
                            className="text-teal-600 hover:text-teal-800 font-bold ml-1 hover:bg-teal-100 rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Skills */}
                {selectedSkills.length < MAX_SKILLS && (
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-2">Popular skills</div>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map((skill) => (
                        <button
                          key={skill.name}
                          type="button"
                          onClick={() => handleAddSkill(skill.name)}
                          disabled={selectedSkills.some(s => s.name === skill.name)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                            selectedSkills.some(s => s.name === skill.name)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !jobTitle.trim() || !jobDescription.trim() || !budget.trim()}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#00C6A9] hover:bg-[#00b096] rounded-full flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting...' : 'Post Job'}
                  
                  {!loading && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
