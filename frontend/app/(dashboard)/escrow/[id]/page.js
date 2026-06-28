'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EscrowStatusPage({ params }) {
  // Safe Next.js 16 dynamic route parameter unwrapping
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [userProfile, setUserProfile] = useState({ name: '', role: '' });
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [cameFromChapa, setCameFromChapa] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;
    
    // Parse the actual logged-in user profile from JWT payload dynamically
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      setUserProfile({
        name: decodedPayload.name || decodedPayload.email?.split('@')[0] || 'User',
        role: decodedPayload.role ? decodedPayload.role.charAt(0).toUpperCase() + decodedPayload.role.slice(1) : 'Client'
      });
    } catch (e) {
      console.error("Failed to parse auth token profile context", e);
    }

    // Detect if user was redirected from Chapa payment
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('status') === 'success' || params.get('tx_ref')) {
        setCameFromChapa(true);
      }
    }

    fetchEscrow();
  }, [id]);

  // Auto-verify when escrow loads and is pending_deposit
  useEffect(() => {
    if (!escrow || escrow.status !== 'pending_deposit' || !token || verifying) return;

    let cancelled = false;
    let retries = 0;
    const maxRetries = 20;

    async function verifyWithRetry() {
      while (retries < maxRetries && !cancelled) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chapa/verify`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ escrowId: escrow.id }),
          });
          if (res.ok && res.headers.get('content-type')?.includes('json')) {
            const data = await res.json();
            if (data.success && data.status === 'funded') {
              setEscrow(prev => prev ? { ...prev, status: 'funded' } : null);
              setVerifyMsg('Payment confirmed!');
              return;
            }
          }
        } catch (err) {
          console.error('Verification attempt failed:', err);
        }
        retries++;
        if (retries < maxRetries && !cancelled) {
          setVerifyMsg(`Verifying payment with Chapa... (attempt ${retries}/${maxRetries})`);
          await new Promise(r => setTimeout(r, 4000));
        }
      }
      setVerifyMsg('Payment not yet confirmed. You can check again manually below.');
    }

    verifyWithRetry();
    return () => { cancelled = true; };
  }, [escrow?.id, escrow?.status, cameFromChapa]);

  async function verifyPayment(escrowId) {
    setVerifying(true);
    setVerifyMsg('Verifying payment with Chapa...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chapa/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ escrowId }),
      });
      if (res.ok && res.headers.get('content-type')?.includes('json')) {
        const data = await res.json();
        if (data.success && data.status === 'funded') {
          setEscrow(prev => prev ? { ...prev, status: 'funded' } : null);
          setVerifyMsg('Payment confirmed!');
        } else {
          setVerifyMsg(data.message || 'Waiting for payment confirmation...');
        }
      } else {
        setVerifyMsg('Could not reach verification service.');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      setVerifyMsg('Verification error.');
    } finally {
      setVerifying(false);
    }
  }

  async function fetchEscrow() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok && response.headers.get('content-type')?.includes('json')) {
        const data = await response.json();
        setEscrow(data);
        setLoading(false);
        return;
      }
      
      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('Backend server unreachable, running sandbox layout fallback.');
    }

    setEscrow({
      id: id || '123',
      amount: 1250.00,
      status: 'pending_deposit',
      job_id: id || 'unknown',
      created_at: new Date().toISOString(),
    });
    setLoading(false);
  }

  const handleSubmitWork = async () => {
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      if (submissionFile) formData.append('file', submissionFile);
      if (submissionMessage) formData.append('message', submissionMessage);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        console.log('Work successfully submitted for client verification review.');
        setEscrow(prev => prev ? { ...prev, status: 'submitted' } : null);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || 'Submission request rejected by API database endpoints.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error: Failed to dispatch submission state update.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepStatus = (step) => {
    if (!escrow) return 'inactive';
    const statusMap = {
      pending_deposit: 0,
      funded: 1,
      held: 1,
      submitted: 1,
      released: 2,
      disputed: 2,
    };
    const current = statusMap[escrow.status] ?? 0;
    if (step < current) return 'done';
    if (step === current) return 'active';
    return 'inactive';
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <p className="text-gray-500">Loading escrow information...</p>
    </div>
  );

  if (verifying && !escrow) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F3F6]">
      <div className="text-center">
        <p className="text-gray-500 mb-2">{verifyMsg || 'Verifying payment...'}</p>
        <div className="w-6 h-6 border-2 border-[#00C6A9] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  return (
    <main className="p-8 bg-[#F1F3F6] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Escrow
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00C6A9] text-white rounded-full flex items-center justify-center font-semibold text-sm">
            {userProfile.name.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{userProfile.name}</p>
            <p className="text-gray-500 text-xs">{userProfile.role} ▾</p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Escrow Status</h1>
      <p className="text-gray-500 text-sm mb-8">View the current status of your escrow and linked job.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {!escrow ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No escrow profile found.
        </div>
      ) : (
        <div className="max-w-3xl flex flex-col gap-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Total Deposited</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{escrow.amount} birr</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Status</p>
              </div>
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase">
                {escrow.status.replace('_', ' ')}
              </span>
              <p className="text-xs text-gray-400 mt-1">Funds securely managed inside escrow smart contract.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Linked Job</p>
              </div>
              <p className="text-sm font-bold text-blue-500 truncate">Job ID</p>
              <p className="text-xs text-gray-400 truncate">{escrow.job_id}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-6">Escrow Milestones</h2>
            <div className="flex items-center justify-between relative mb-8">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-6 left-0 h-0.5 bg-[#00C6A9] z-0 transition-all duration-500"
                style={{
                  width: escrow.status === 'pending_deposit' ? '0%' :
                         ['funded', 'held', 'submitted'].includes(escrow.status) ? '50%' : '100%'
                }}
              />

              {[
                { label: 'Pending', desc: 'Deposit initiated by client', step: 0 },
                { label: 'Held', desc: 'Funds secured / Contract running', step: 1 },
                { label: 'Released', desc: 'Disbursed to Freelancer wallet', step: 2 },
              ].map((item) => {
                const status = getStepStatus(item.step);
                return (
                  <div key={item.label} className="flex flex-col items-center gap-2 z-10 flex-1 text-center px-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      status === 'done' ? 'bg-[#00C6A9] border-[#00C6A9]' :
                      status === 'active' ? 'bg-white border-[#00C6A9]' :
                      'bg-white border-gray-300'
                    }`}>
                                           {status === 'done' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : item.step === 0 ? (
                        <svg className={`w-5 h-5 ${status === 'active' ? 'text-[#00C6A9]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : item.step === 1 ? (
                        <svg className={`w-5 h-5 ${status === 'active' ? 'text-[#00C6A9]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${status === 'inactive' ? 'text-gray-400' : 'text-gray-900'}`}>{item.label}</p>
                      <p className="text-[10px] text-gray-400 max-w-[140px] mx-auto">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pending Deposit - Payment Verification Area */}
            {escrow.status === 'pending_deposit' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Waiting for payment confirmation</p>
                    {verifyMsg && (
                      <p className="text-xs text-gray-500 mt-1">{verifyMsg}</p>
                    )}
                  </div>
                  <button
                    onClick={() => verifyPayment(escrow.id)}
                    disabled={verifying}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00C6A9] text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-50"
                  >
                    {verifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Payment Status'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Role-Based Action Area */}
            {userProfile.role === 'Client' && (escrow.status === 'funded' || escrow.status === 'held' || escrow.status === 'submitted') && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4 mt-4 shadow-sm">
                <button
                  onClick={() => router.push(`/jobs/${escrow.job_id}/review`)}
                  className="flex-1 py-3 rounded-xl bg-[#00C6A9] text-white font-semibold text-sm hover:brightness-110 transition"
                >
                  Review & Release Payment
                </button>
                <button
                  className="flex-1 py-3 rounded-xl border-2 border-red-400 text-red-500 font-semibold text-sm hover:bg-red-500 hover:text-white transition"
                >
                  Raise Dispute
                </button>
              </div>
            )}

            {userProfile.role === 'Freelancer' && (escrow.status === 'funded' || escrow.status === 'held') && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4 shadow-sm">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message to Client</label>
                  <textarea
                    value={submissionMessage}
                    onChange={(e) => setSubmissionMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00C6A9]"
                    placeholder="Describe what you've completed..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Completed Work</label>
                  <input
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00C6A9] file:text-white hover:file:brightness-110"
                  />
                </div>
                <button
                  onClick={handleSubmitWork}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#00C6A9] text-white font-semibold text-sm hover:brightness-110 transition disabled:opacity-50"
                >
                  {submitting ? 'Processing Submission...' : 'Submit Completed Work'}
                </button>
              </div>
            )}

            {/* State Informational Card Placeholders */}
            {escrow.status === 'submitted' && (
              <div className="w-full mt-4 bg-amber-50 border border-amber-200 text-amber-800 text-center py-3 rounded-lg text-sm font-medium">
                Work Submitted. Awaiting Client confirmation approval.
              </div>
            )}

            {escrow.status === 'released' && (
              <div className="w-full mt-4 bg-green-50 border border-green-200 text-green-800 text-center py-3 rounded-lg text-sm font-medium">
                Contract Closed. Milestone payments fully disbursed.
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}



