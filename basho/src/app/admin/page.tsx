'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on client side
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const adminAuthCookie = cookies.find(cookie => cookie.trim().startsWith('admin-auth='));

      if (adminAuthCookie) {
        const value = adminAuthCookie.split('=')[1];
        if (value === 'true') {
          router.push('/admin/dashboard');
        } else {
          router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-4 text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}
