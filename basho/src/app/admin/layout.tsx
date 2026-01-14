'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // If on the login route, allow rendering while unauthenticated
    if (pathname === '/admin/login') return;

    // If not signed in, redirect to site auth page
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    // If session exists, ask server whether user is an admin
    if (status === 'authenticated' && session?.user?.email) {
      fetch('/api/admin/admins?check=true')
        .then((r) => r.json())
        .then((data) => {
          setIsAdmin(!!data.isAdmin);
          if (!data.isAdmin) router.push('/');
        })
        .catch(() => {
          setIsAdmin(false);
          router.push('/');
        });
    }
  }, [pathname, status, session, router]);

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  if (status === 'loading' || isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
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
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 max-w-7xl py-6 px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}