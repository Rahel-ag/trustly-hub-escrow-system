'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SubmitWorkPage() {
  const router = useRouter();
  const { id: jobId } = useParams();

  const [contract, setContract] = useState(null);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  useEffect(() => {
    if (!jobId || !token) return;

    const fetchContract = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setContract(data.data || data.job);
      } catch (error) {
        console.error('Failed to fetch contract:', error);
      }
    };

    fetchContract();
  }, [jobId, token]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/active-work/${jobId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes,
            fileName: selectedFile.name,
            fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
          }),
        }
      );

      if (!res.ok) {
        console.error('Submission failed');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-10 text-xs font-semibold text-gray-400">
        Loading contract details...
      </div>
    );
  }

  const fileSize = selectedFile
    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
    : null;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-xl border border-gray-100 shadow-sm">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#00C6A9]"
      >
        ← Back to Contracts
      </button>

      <h1 className="text-xl font-bold text-gray-900">
        Submit Completed Work
      </h1>

      <p className="mb-6 text-xs text-gray-400">
        Project:{' '}
        <span className="font-semibold text-gray-700">
          {contract.title}
        </span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between rounded-lg border border-teal-100 bg-teal-50/50 p-4">
          <span className="text-xs font-bold uppercase text-teal-900">
            Escrow Protection
          </span>

          <span className="text-xs font-bold text-gray-900">
            {contract.contract_budget || contract.budget || 11000} Birr
            Locked
          </span>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-gray-700">
            Message to Client
          </label>

          <textarea
            rows={5}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe deliverables or provide links to shared assets..."
            className="w-full resize-none rounded-lg border border-gray-200 p-3 text-xs text-gray-800 outline-none focus:border-[#00C6A9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-gray-700">
            Attach Deliverables File
          </label>

          <div className="group relative cursor-pointer rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/40 p-8 text-center transition hover:border-[#00C6A9]">
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />

            <svg
              className="mx-auto mb-2 h-8 w-8 text-gray-400 transition-colors group-hover:text-[#00C6A9]"
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
              <>
                <p className="text-xs font-bold text-[#00C6A9]">
                  {selectedFile.name}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  File Size: {fileSize}
                </p>

                <p className="mt-2 text-[9px] font-semibold uppercase tracking-wide text-gray-300">
                  Click again to replace file
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-gray-700">
                  Click to browse or drag a file here
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  ZIP, PDF, MP4, PNG • Max 50MB
                </p>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#00C6A9] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#00b096] disabled:opacity-50"
        >
          {submitting
            ? 'Uploading assets...'
            : 'Submit Deliverables to Client'}
        </button>
      </form>
    </div>
  );
}