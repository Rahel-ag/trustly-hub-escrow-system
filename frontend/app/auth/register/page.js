'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState('buyer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/auth/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <span className="text-2xl font-bold tracking-wide">
            Trustly<span className="text-blue-400">Hub</span>
          </span>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Start Your<br />Journey Now!
          </h2>
          <p className="text-gray-300 text-base leading-relaxed max-w-xs mx-auto">
            Secure your work, collaborate with confidence,<br />and get paid without worry.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="flex items-end justify-center gap-4 w-full">
          <div
            className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center w-28"
            style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(96,165,250,0.35)' }}
          >
            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Team<br />Collaboration</p>
          </div>

          <div
            className="flex flex-col items-center gap-2 rounded-xl px-5 py-6 text-center w-32 -mb-2"
            style={{ background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(167,139,250,0.4)', boxShadow: '0 0 24px rgba(139,92,246,0.35)' }}
          >
            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Secure<br />&amp; Reliable</p>
          </div>

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
        <div className="w-full max-w-lg">

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-5">Create an account</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <p className="text-sm text-gray-500 mb-2">I AM A...</p>
              <div className="grid grid-cols-2 gap-4">
                {/* Buyer */}
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`flex flex-col items-center gap-1 py-4 px-3 rounded-xl border-2 text-sm font-semibold transition
                    ${role === 'buyer'
                      ? 'border-green-400 bg-teal-50 text-gray-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300'}`}
                >
                  <svg className={`w-6 h-6 ${role === 'buyer' ? 'text-teal-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8M7 13h10m0 0l1.6 8M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  <span>Buyer/Client</span>
                  <span className="text-xs font-normal text-gray-400">I&apos;m hiring or purchasing</span>
                </button>

                {/* Seller */}
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`flex flex-col items-center gap-1 py-4 px-3 rounded-xl border-2 text-sm font-semibold transition
                    ${role === 'seller'
                      ? 'border-blue-400 bg-blue-50 text-gray-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300'}`}
                >
                  <svg className={`w-6 h-6 ${role === 'seller' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Seller/Freelancer</span>
                  <span className="text-xs font-normal text-gray-400">I&apos;m delivering work</span>
                </button>
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-snug cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-blue-500 hover:underline">Terms and Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-500 hover:underline">privacy policy</a>
                , including the escrow fund handling agreement.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg text-sm transition duration-200 shadow-md"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-700 font-semibold transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
