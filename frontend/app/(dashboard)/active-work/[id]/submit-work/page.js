'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SubmitWorkPage() {
  const router = useRouter();
  const { id: jobId } = useParams();
  const [contract, setContract] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    // FIX 1: Read token inside useEffect to avoid SSR crashes and stale closure issues
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    async function fetchContractDetails() {
      try {
        // FIX 2: Restored missing backtick template literals around the fetch URL
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // FIX 3: Restored missing || operator (was: data.data  data.job)
          setContract(data.data || data.job);
        }
      } catch (err) {
        console.error('Failed to load contract details from API:', err);
      }
    }

    fetchContractDetails();
  }, [jobId]); // token intentionally omitted — reading fresh from localStorage on each effect run


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // FIX 4: Read token at call-time so it's always fresh
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    try {
      const formData = new FormData();
      formData.append('notes', notes);
      if (selectedFileObj) formData.append('file', selectedFileObj);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hire/active-work/${jobId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Submit error:', errData.error || 'Server rejected deliverables submission.');
      }
    } catch (error) {
      console.error('Network connection error during submission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!contract) {
    return (
      <div className="p-10 text-xs font-semibold text-gray-400 bg-[#F4F7F9] min-h-screen flex items-center justify-center">
        Loading active contract details...
      </div>
    );
  }

  return (
    <div className="p-10 max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm mt-10 font-sans">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-xs text-gray-500 hover:text-[#00C6A9] mb-6 flex items-center gap-1 font-semibold"
      >
        ← Back to Contracts
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Submit Completed Work</h1>
      <p className="text-xs text-gray-400 mb-6">
        Project: <span className="font-semibold text-gray-700">{contract.title}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100 flex justify-between items-center">
          <span className="text-xs font-bold text-teal-900 uppercase">Escrow Protection</span>
          {/* FIX 6: Restored missing || operator (was: contract.contract_budget  contract.budget) */}
          <span className="text-xs font-bold text-gray-900">
            {contract.contract_budget || contract.budget || 11000} Birr Locked
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Message to Client</label>
          <textarea
            rows="5"
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe deliverables or provide links to shared design assets..."
            className="w-full border border-gray-200 rounded-lg p-3 text-xs outline-none focus:border-[#00C6A9] resize-none font-medium text-gray-800"
          />
        </div>

        {/* File uploader */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
            Attach Deliverables File
          </label>

          <div className="relative border-2 border-dashed border-gray-200 hover:border-[#00C6A9] rounded-lg p-8 bg-gray-50/40 text-center transition-all cursor-pointer group">
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const calculatedSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                    setSelectedFileObj(file);
                    setSelectedFile({
                      name: file.name,
                      size: calculatedSize,
                    });
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                required
              />

            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-[#00C6A9] mx-auto mb-2 transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {selectedFile ? (
              <div>
                <p className="text-xs font-bold text-[#00C6A9]">{selectedFile.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">File Size: {selectedFile.size}</p>
                <p className="text-[9px] text-gray-300 font-semibold mt-2 uppercase tracking-wide">
                  Click card again to replace file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-gray-700">
                  Click to browse your device files or drag items here
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Supports ZIP, PDF, MP4, or PNG archives up to 50MB
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#00C6A9] hover:bg-[#00b096] text-white py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
        >
          {submitting ? 'Uploading assets...' : 'Submit Deliverables to Client'}
        </button>
      </form>
    </div>
  );
}