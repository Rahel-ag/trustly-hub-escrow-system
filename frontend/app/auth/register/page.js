 'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState('Client'); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
const handleRoleSelect = (selectedRole) => {
  setRole(selectedRole);
};


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
      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: `${firstName} ${lastName}`.trim(), email, phone, password, role }),
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
    <div className="flex min-h-screen bg-white">
      
      <div
        className="hidden lg:flex lg:w-5/12 h-screen sticky top-0 flex-col items-center justify-between py-12 px-10 text-white"
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
            style={{ width: 'auto', height: 'auto' }}
          />
          <span className="text-2xl font-bold tracking-wide">
            Trustly<span style={{ color: '#00e699' }}>Hub</span>
          </span>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Start Your<br />
            <span className="text-[#59a5ff]">Journey</span><br />
            <span className="text-[#00e699]">Now!</span>
          </h2>
          <p className="text-gray-300 text-base leading-relaxed max-w-xs mx-auto">
            Secure your work, collaborate with confidence,<br />and get paid without worry.
          </p>
        </div>
        <div className="flex items-end justify-center gap-4 w-full">
          {/* Card 1: Team Collaboration */}
          <div 
            className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center w-28" 
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Team<br />Collaboration</p>
          </div>
          
          {/* Card 2: Secure & Reliable */}
          <div 
            className="flex flex-col items-center gap-2 rounded-xl px-5 py-6 text-center w-32 -mb-2" 
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 0 24px rgba(99,102,241,0.2)' }}
          >
            <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Secure<br />&amp; Reliable</p>
          </div>

          {/* Card 3: Get Paid On Time */}
          <div 
            className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center w-28" 
            style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }}
          >
            <svg className="w-8 h-8 text-pink-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-300 leading-tight">Get Paid<br />On Time</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Registration Form) ── */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center py-8 px-6 sm:px-12 lg:px-20 xl:px-24 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg my-auto">
          
          {/* Logo for Mobile Devices */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-6">
            <Image
              src="/logo.png"
              alt="TrustlyHub logo"
              width={48}
              height={48}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
            <span className="text-2xl font-bold tracking-wide text-gray-900">
              Trustly<span style={{ color: '#00e699' }}>Hub</span>
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1 text-center lg:text-left">
            Create your account
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center lg:text-left">
            Sign up today to manage your transactions securely.
          </p>

          {/* Error Alert Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
           <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Buyer/Seller Role Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Buyer Button */}
              <button 
                type="button" 
                onClick={() => handleRoleSelect('Client')} 
                className={`flex flex-col items-center gap-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition cursor-pointer ${
                  role === 'Client' 
                    ? 'border-[#00e699] bg-[#e6fbf4] text-gray-900' 
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <svg className={`w-5 h-5 ${role === 'Client' ? 'text-[#00e699]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8M7 13h10m0 0l1.6 8M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                <span className="mt-1 text-xs sm:text-sm font-bold">Buyer / Client</span>
                <span className="text-[10px] font-normal text-gray-400 hidden sm:inline">I want to hire & buy</span>
              </button>

              {/* Seller Button */}
              <button 
                type="button" 
                onClick={() => handleRoleSelect('Freelancer')} 
                className={`flex flex-col items-center gap-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition cursor-pointer ${
                  role === 'Freelancer' 
                    ? 'border-[#00e699] bg-[#e6fbf4] text-gray-900' 
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <svg className={`w-5 h-5 ${role === 'Freelancer' ? 'text-[#00e699]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="mt-1 text-xs sm:text-sm font-bold">Seller / Freelancer</span>
                <span className="text-[10px] font-normal text-gray-400 hidden sm:inline">I want to deliver work</span>
              </button>
            </div>

            {/* Fields Grid (First Name & Last Name) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                <input 
                  type="text"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
             {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email"
                required
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Passwords Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-2 pt-1 pb-1">
              <input
                id="agreed"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 accent-blue-500 cursor-pointer"
              />
              <label htmlFor="agreed" className="text-xs text-gray-500 leading-snug">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-500 hover:text-blue-700 hover:underline font-semibold">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-500 hover:text-blue-700 hover:underline font-semibold">Privacy Policy</Link>.
              </label>
            </div>
             {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-base tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:bg-gray-400 disabled:transform-none disabled:brightness-100 shadow-md cursor-pointer" 
              style={{ background: 'linear-gradient(90deg, #0ba385 0%, #075747 100%)' }}
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 opacity-90 transform rotate-45 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A1 1 0 014.54 1.94l17 7a1 1 0 010 1.854l-17 7a1 1 0 01-1.27-1.187L6 12zm0 0h7.5" />
                  </svg>
                  <span>Create account</span>
                </>
              )}
            </button>
          </form>

          {/* Sign In Redirect Link  */}
          <p className="text-center text-gray-500 text-sm mt-4">
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