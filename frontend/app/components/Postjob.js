'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LIMITS = {
  TITLE_WORDS: 10,
  DESC_WORDS: 500,
  SKILL_CHARS: 50,
  MAX_SKILLS: 10,
};

const POPULAR_SKILLS = [
  { name: 'React', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Programming' },
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Flutter', category: 'Mobile' },
];

function truncateToWords(text, maxWords) {
  const words = text.split(' ');
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') : text;
}

function wordCount(text) {
  return text.split(' ').filter(Boolean).length;
}

export default function PostJob() {
  const router = useRouter();

  const [form, setForm] = useState({
    jobTitle: '',
    jobDescription: '',
    budget: '',
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (skillName = null) => {
    const skill = skillName || skillInput.trim();
    if (!skill) return;

    if (selectedSkills.length >= LIMITS.MAX_SKILLS) {
      setError(`Maximum ${LIMITS.MAX_SKILLS} skills allowed`);
      return;
    }

    const alreadyAdded = selectedSkills.some(
      (s) => s.name.toLowerCase() === skill.toLowerCase()
    );
    if (alreadyAdded) return;

    const popular = POPULAR_SKILLS.find(
      (s) => s.name.toLowerCase() === skill.toLowerCase()
    );
    setSelectedSkills([
      ...selectedSkills,
      { name: skill, category: popular?.category || 'Other' },
    ]);
    setSkillInput('');
    setError('');
  };

  const handleRemoveSkill = (skillName) => {
    setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName));
  };

  const handleReset = () => {
    setForm({ jobTitle: '', jobDescription: '', budget: '' });
    setSelectedSkills([]);
    setSkillInput('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: form.jobTitle,
          description: form.jobDescription,
          budget: form.budget,
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

  const isSubmitDisabled =
    loading ||
    !form.jobTitle.trim() ||
    !form.jobDescription.trim() ||
    !form.budget.trim();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>

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
            <p className="text-xs text-gray-500 mb-2">Enter a short and clear title for your job.</p>
            <div className="relative">
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) =>
                  handleChange('jobTitle', truncateToWords(e.target.value, LIMITS.TITLE_WORDS))
                }
                placeholder="Eg. Website Development"
                className="w-full border border-gray-200 rounded-md p-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00C6A9] focus:border-[#00C6A9]"
                required
              />
              <span className="absolute right-3 top-3 text-xs text-gray-400">
                {wordCount(form.jobTitle)}/{LIMITS.TITLE_WORDS} words
              </span>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Describe the job, requirements, and what you're looking for.
            </p>
            <div className="relative">
              <textarea
                value={form.jobDescription}
                onChange={(e) =>
                  handleChange('jobDescription', truncateToWords(e.target.value, LIMITS.DESC_WORDS))
                }
                placeholder="Describe your project in detail."
                rows={5}
                className="w-full border border-gray-200 rounded-md p-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00C6A9] focus:border-[#00C6A9] resize-none"
                required
              />
              <span className="absolute right-3 bottom-3 text-xs text-gray-400">
                {wordCount(form.jobDescription)}/{LIMITS.DESC_WORDS} words
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
              value={form.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
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
            <p className="text-xs text-gray-500 mb-3">
              Add relevant skills to help freelancers find your job. Max {LIMITS.MAX_SKILLS} skills.
            </p>

            {/* Skill Input */}
            <div className="relative mb-1">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => {
                  if (e.target.value.length <= LIMITS.SKILL_CHARS) setSkillInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }
                }}
                placeholder="Eg. React, Node.js"
                disabled={selectedSkills.length >= LIMITS.MAX_SKILLS}
                className="w-full border border-gray-200 rounded-md p-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00C6A9] focus:border-[#00C6A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-3 top-3 text-xs text-gray-400">
                {skillInput.length}/{LIMITS.SKILL_CHARS}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Press Enter to add skill</p>

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
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
            )}

            {/* Popular Skills */}
            {selectedSkills.length < LIMITS.MAX_SKILLS && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Popular skills</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SKILLS.map((skill) => {
                    const isAdded = selectedSkills.some((s) => s.name === skill.name);
                    return (
                      <button
                        key={skill.name}
                        type="button"
                        onClick={() => handleAddSkill(skill.name)}
                        disabled={isAdded}
                        className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                          isAdded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
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
  );
}