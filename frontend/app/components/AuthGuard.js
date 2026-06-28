'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/'); return; }
    try {
      JSON.parse(atob(token.split('.')[1]));
      setAuthorized(true);
    } catch {
      router.replace('/');
    }
  }, []);

  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        const token = localStorage.getItem('token');
        if (!token) { router.replace('/'); }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  if (!authorized) return null;
  return children;
}
