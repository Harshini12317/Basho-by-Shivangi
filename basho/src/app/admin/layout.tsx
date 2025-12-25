'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on client side
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const adminAuthCookie = cookies.find(cookie => cookie.trim().startsWith('admin-auth='));

      if (adminAuthCookie) {
        const value = adminAuthCookie.split('=')[1].trim();
        if (value === 'true') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname]); // Re-check when pathname changes

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Don't apply authentication to the login page
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">Basho Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin/dashboard"
                className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>
              <form action="/api/admin/auth" method="DELETE" className="inline">
                <button
                  type="submit"
                  className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}