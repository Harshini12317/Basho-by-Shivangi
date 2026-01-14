'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canCreateAdmin, setCanCreateAdmin] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // Check if user can create first admin
      checkAdminStatus();
    }
  }, [status, session]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/admins?check=true');
      const data = await response.json();
      setCanCreateAdmin(!data.isAdmin); // Can create if not already admin
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleCreateFirstAdmin = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (response.ok) {
        router.push('/admin/workshops');
      } else {
        setError('Failed to create admin account');
      }
    } catch (error) {
      setError('Error creating admin account');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Admin access now uses site authentication. Redirect to site auth.
    router.push('/auth');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
            <p className="text-slate-600 mt-2">Sign in with your account to access the admin panel</p>
          </div>

          <div className="space-y-6">
            {status === 'authenticated' ? (
              <>
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    Welcome, {session.user.name || session.user.email}!
                  </p>
                  {canCreateAdmin ? (
                    <button
                      onClick={handleCreateFirstAdmin}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating Admin Account...' : 'Become First Admin'}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/admin/workshops')}
                      className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800"
                    >
                      Access Admin Panel
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">Use your site account to sign in. Only designated admins can access this panel.</p>
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800"
                >
                  Sign in to continue
                </button>
              </>
            )}

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}