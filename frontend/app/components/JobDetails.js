'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const jobs = [
  {
    id: 1,
    title: 'Modern Website Redesign',
    client: 'Sarah Johnson',
    posted: 'Posted 5 hours ago',
    jobType: 'Fixed price job',
    status: 'Open',
    description: 'We are seeking a talented and experienced Web Designer/Developer to completely redesign our company website. Our current website is outdated and lacks modern UI/UX principles. We need a responsive, fast-loading website that works seamlessly across all devices. The new design should include a modern homepage, about us page, services showcase, portfolio section, contact form, and blog integration. We want the site to reflect our brand identity with a professional and clean aesthetic. The project should be completed within 30 days with regular progress updates.',
    requirements: [
      'Proven experience in modern website design and development',
      'Strong knowledge of HTML, CSS, JavaScript, and responsive design',
      'Experience with frameworks like React, Vue.js, or Next.js',
      'Portfolio demonstrating previous web design projects',
      'Understanding of SEO best practices',
      'Experience with CMS platforms',
      'Ability to optimize website performance and loading speed',
    ],
    skills: ['Web Design', 'UI/UX Design', 'React', 'Responsive Design', 'HTML/CSS', 'JavaScript', 'Figma', 'SEO'],
    budget: '15,000-20,000birr',
    budgetType: 'Fixed Price',
    deadline: '30 Jun 2026',
  },

  {
    id: 2,
    title: 'Mobile App Development',
    client: 'Michael Smith',
    posted: 'Posted 1 day ago',
    jobType: 'Fixed price job',
    status: 'Open',
    description: 'We are looking for an experienced Mobile App Developer to build a cross-platform mobile application for iOS and Android. The app is a social networking platform that allows users to connect with friends, share photos and videos, and chat in real-time. The app requires user authentication, push notifications, in-app messaging, photo upload functionality, and social media integration. We need a developer who can work with native APIs, implement smooth animations, and ensure the app performs optimally on various devices. The project includes API integration with our backend servers and database design for user management.',
    requirements: [
      'Proven Flutter or React Native experience with published apps',
      'Knowledge of RESTful APIs and backend integration',
      'Experience with Firebase for real-time database and authentication',
      'Understanding of state management (Provider, Redux, or similar)',
      'Experience with push notifications and background services',
      'Knowledge of app store deployment (Google Play and Apple App Store)',
      'Strong debugging and problem-solving skills',
      'Experience with version control systems (Git)',
    ],
    skills: ['Flutter', 'React Native', 'Firebase', 'Dart', 'API Integration', 'Mobile UI/UX', 'Git', 'Agile Development'],
    budget: '35,000-50,000birr',
    budgetType: 'Fixed Price',
    deadline: '25 Jun 2026',
  },

  {
    id: 3,
    title: 'Video Editing & Post-Production',
    client: 'John Doe',
    posted: 'Posted 2 days ago',
    jobType: 'Fixed price job',
    status: 'Open',
    description: 'We are looking for a creative and detail-oriented Video Editor to handle post-production work for our marketing videos and promotional content. The project involves cutting and assembling raw footage, color grading, adding transitions, background music, and visual effects. We need the videos to have a professional look with smooth cuts, engaging motion graphics, and brand-consistent branding. The editor should be comfortable working with corporate video content and creating videos suitable for social media platforms. The deliverables should include multiple versions optimized for different platforms (YouTube, Instagram, Facebook) with various aspect ratios.',
    requirements: [
      'Expert proficiency in Adobe Premiere Pro and After Effects',
      'Knowledge of color grading and color correction techniques',
      'Experience with motion graphics and animation',
      'Strong understanding of video pacing and storytelling',
      'Experience creating social media optimized content',
      'Knowledge of audio editing and mixing',
      'Ability to work with 4K and high-resolution footage',
      'Portfolio demonstrating previous video editing work',
    ],
    skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Color Grading', 'Motion Graphics', 'DaVinci Resolve', 'Audio Editing', 'Social Media Content'],
    budget: '3000-5000birr',
    budgetType: 'Fixed Price',
    deadline: '15 Jun 2026',
  },

  {
    id: 4,
    title: 'E-Commerce Platform Development',
    client: 'Emma Wilson',
    posted: 'Posted 3 hours ago',
    jobType: 'Time and materials job',
    status: 'Open',
    description: 'We need a full-stack developer to build a comprehensive e-commerce platform from scratch. The platform should include product catalog management, shopping cart functionality, secure payment gateway integration, user accounts with order history, and an admin dashboard for managing inventory and orders. The application needs to support multiple payment methods, implement email notifications for orders, and include search and filtering capabilities. Security is crucial - we need SSL encryption, secure authentication, and PCI compliance. The project will be ongoing with potential future enhancements and maintenance.',
    requirements: [
      'Full-stack development experience with Node.js or Python backend',
      'Strong frontend skills with React or Vue.js',
      'Experience with payment gateway integration (Stripe, PayPal)',
      'Database design experience (MySQL, PostgreSQL, or MongoDB)',
      'Understanding of e-commerce best practices',
      'Security implementation knowledge',
      'Experience with deployment and hosting',
      'Knowledge of SEO for e-commerce sites',
    ],
    skills: ['Full Stack Development', 'React', 'Node.js', 'MongoDB', 'Payment Integration', 'E-Commerce', 'AWS', 'Docker'],
    budget: '25,000-40,000birr',
    budgetType: 'Hourly Rate',
    deadline: '20 Jul 2026',
  },
];

export default function JobDetails({ jobId }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const job = jobs.find(j => j.id === parseInt(jobId)) || {
    title: "Test Job",
    description: "Test Description",
    requirements: [],
    skills: [],
    client: "Test Client",
    posted: "Today",
    jobType: "Fixed",
    status: "Open",
    budget: "1000",
    budgetType: "Fixed",
    deadline: "Tomorrow",
  };

  return (
    <div className="flex h-screen bg-[#F4F7F9] font-sans">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#0A1D27] text-white flex flex-col justify-between select-none shrink-0">
        <div>
          <div className="flex flex-col items-center justify-center py-6">
            <img
              src="/logo.png"
              alt="TrustlyHub Logo"
              className="w-[180px] h-auto object-contain select-none"
            />
          </div>

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

        <div className="p-4 mb-4">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg w-full border-t border-gray-700/50 pt-6">
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
                <p className="text-sm font-semibold text-gray-900">Jhon Doe</p>
                <p className="text-xs text-gray-500">Freelancer</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
                <img src="/avatar.png" alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            </button>
          </div>
        </div>

        <div className="px-14 py-10">
          <div className="flex items-start gap-6">
            {/* Left: Job Details Card */}
            <div className="flex-1 bg-white rounded-none border-0 p-8 min-h-[750px]">
              {/* Client Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{job.client}</p>
                    <p className="text-sm text-gray-500">Client</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{job.posted}</span>
                    <span className="text-gray-300">|</span>
                    <span>{job.jobType}</span>
                  </div>
                  <span className="text-[#0D7BA5] bg-[#D8D0D0] px-5 py-1 rounded-full text-sm">
                    {job.status}
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-900 mb-3">Job Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
              </div>

              {/* Requirements */}
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-[#00C6A9] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4">Skills and Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[#3927FF] bg-[#D8D0D0] px-4 py-1 rounded-md text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Job Summary Card */}
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
                    <p className="text-sm font-bold text-[#00C6A9]">{job.budget}</p>
                    <p className="text-xs font-semibold text-[#00C6A9]">{job.budgetType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Deadline</p>
                    <p className="text-sm font-bold text-gray-900">{job.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Job Type</p>
                    <p className="text-sm font-bold text-gray-900">{job.budgetType}</p>
                  </div>
                </div>
              </div>

              {/* Escrow Protection */}
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

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-[#00C6A9] hover:bg-[#00b096] text-white text-sm font-bold py-3 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Apply Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved((saved) => !saved)}
                  className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl border transition-colors ${
                    isSaved
                      ? 'border-[#00C6A9] text-[#00C6A9] bg-[#21B7A7]/5'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}