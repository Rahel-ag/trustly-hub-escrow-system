'use client';

import Link from 'next/link';
import Image from 'next/image';
import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-between py-12 px-10 text-white"
        style={{ background: 'linear-gradient(160deg, #0b1a2e 0%, #0d3b4f 50%, #0b2a3a 100%)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="TrustlyHub logo"
            width={96}
            height={96}
            className="drop-shadow-lg"
            priority
          />
          <span className="text-2xl font-bold tracking-wide">TrustlyHub</span>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Work Securely.
            <br />
            <span className="text-blue-400">Collaborate</span>
            <br />
            <span className="text-green-400">Confidently.</span>
          </h2>
          <p className="text-gray-300 text-base leading-relaxed max-w-xs mx-auto">
            Secure your work, collaborate with confidence,<br />and get paid without worry.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="flex items-end justify-center gap-4 w-full">
          {/* Team Collaboration */}
          <div
            className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center w-28"
            style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(96,165,250,0.35)' }}
          >
            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Team<br />Collaboration</p>
          </div>

          {/* Shield / Secure — larger, center */}
          <div
            className="flex flex-col items-center gap-2 rounded-xl px-5 py-6 text-center w-32 -mb-2"
            style={{ background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(167,139,250,0.4)', boxShadow: '0 0 24px rgba(139,92,246,0.35)' }}
          >
            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Secure<br />&amp; Reliable</p>
          </div>

          {/* Get Paid */}
          <div
            className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center w-28"
            style={{ background: 'rgba(236,72,153,0.18)', border: '1px solid rgba(244,114,182,0.35)' }}
          >
            <svg className="w-8 h-8 text-pink-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Get Paid<br />On Time</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 px-8 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <p className="text-blue-500 font-semibold text-sm mb-1">welcome back! 👋</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Log in to your account</h1>
            <p className="text-gray-400 text-sm">Enter your details below to continue</p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3 text-gray-400 text-xs">or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Google Button */}
         <button
           type="button"
           className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition shadow-sm"
         >
           Continue with Google
         </button>

          {/* Sign Up */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-500 hover:text-blue-700 font-semibold transition">
              Sign up
            </Link>
          </p>

          {/* Landing page preview */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Check Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
