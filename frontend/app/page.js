'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navbar from './components/Navbar';

// ── FAQ accordion item ──────────────────────────────────────────────────────
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex items-center justify-between text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-gray-900 font-medium text-sm">{question}</span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold transition"
          style={{ background: open ? '#10b981' : '#10b981' }}
        >
          {open ? '✕' : '✓'}
        </span>
      </button>
      {open && (
        <p className="mt-3 text-gray-500 text-sm leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ════════════════════════════════════════════
          HERO + HOW IT WORKS  (dark background)
      ════════════════════════════════════════════ */}
      <section
        className="pt-20 pb-0"
        style={{ background: 'linear-gradient(160deg, #050f19 0%, #0a2235 55%, #0d3b3b 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start py-16">

          {/* Left — Hero copy */}
          <div className="text-white">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
              Secure<br />Payment<br />With<br />
              <span className="text-green-400">Trustly Hub</span>
            </h1>
            <p className="text-gray-300 text-base leading-relaxed max-w-sm mb-10">
              Handle your funds safely until both parties approve the transaction; where your money is protected every step of the way.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-3.5 rounded-full font-bold text-white text-sm shadow-lg transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 24px rgba(16,185,129,0.45)' }}
            >
              Start Transaction
            </Link>
          </div>

          {/* Right — How it works */}
          <div id="how-it-works">
            <p className="text-green-400 text-sm font-semibold mb-4 text-center">How it works</p>
            <div className="space-y-5">
              {[
                {
                  n: '1',
                  title: 'Buyer Starts Transaction',
                  desc: 'Buyer creates an escrow agreement and seller accepts the invite. Terms are set and agreed before any money movement.',
                },
                {
                  n: '2',
                  title: 'Buyers Deposit Funds',
                  desc: 'Funds are securely held in our escrow account — insured and protected from fraud.',
                },
                {
                  n: '3',
                  title: 'Seller Delivers Services',
                  desc: 'Seller fulfils the agreed task knowing payment is guaranteed upon successful completion.',
                },
                {
                  n: '4',
                  title: 'Funds Released after Approval',
                  desc: 'Buyer confirms and funds are instantly released to seller. Both parties are protected.',
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold text-sm mb-1">{step.title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY CHOOSE US / FEATURES
      ════════════════════════════════════════════ */}
      <section
        id="features"
        className="py-20"
        style={{ background: 'linear-gradient(180deg, #0d3b3b 0%, #0a2a1a 40%, #051510 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-3">Why choose us</p>
          <h2 className="text-white text-3xl font-extrabold mb-4 max-w-md leading-tight">
            The Reliable way to handle transaction
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-12">
            Every feature is crafted to ensure both buyer and seller feels protected and confident throughout the entire transaction life cycle.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Secure Fund holding',
                desc: 'Funds are held in regulated, insured accounts — never touched until both parties agree.',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Instant Releases',
                desc: 'Once approved, funds transfer instantly. No delays, no holding periods, no friction.',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                ),
                title: 'Dispute Resolution',
                desc: 'Our expert team mediates disputes fairly and quickly.',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Real Time tracking',
                desc: 'Monitor every step of your transaction in real time with full transparency.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {f.icon}
                <h3 className="text-white font-bold text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">FAQ</h2>
          <FAQItem
            question="What is Escrow and how does it work?"
            answer="Escrow is a secure arrangement where a neutral third party holds funds until both buyer and seller fulfil their agreed terms. TrustlyHub acts as that trusted intermediary, releasing funds only when both parties confirm the transaction is complete."
          />
          <FAQItem
            question="What happens if there is a dispute?"
            answer="If a dispute arises, our dedicated resolution team steps in to review the evidence from both parties and mediates a fair outcome. We aim to resolve all disputes within 3–5 business days."
          />
          <FAQItem
            question="How long does it take to release fund?"
            answer="Once the buyer approves the delivery, funds are released instantly to the seller. Bank processing may add 1–2 business days depending on your payment method."
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-gray-400 pt-14 pb-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo.png" alt="TrustlyHub" width={28} height={28} />
                <span className="text-white font-bold">TrustlyHub</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                Secure escrow platform build for modern commerce; Trusted for your business.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition">How it works</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Integration</a></li>
                <li><a href="#" className="hover:text-white transition">API docs</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="sm:col-span-2 lg:col-span-2">
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@TrustlyHub.com
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +251-912-214-567
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Megenagna, AA
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mon–Fri, 12pm–12pm
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>2025 TrustlyHub Inc. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition">Privacy policy</a>
              <a href="#" className="hover:text-white transition">Terms of service</a>
              <a href="#" className="hover:text-white transition">Cookie settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
