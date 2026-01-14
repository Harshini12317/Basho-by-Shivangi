'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Array<any>>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    fetch('/api/admin/admins')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAdmins(data);
      })
      .catch(() => {});
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins((s) => [...s, { email: newAdminEmail.trim(), name: newAdminEmail.split('@')[0] }]);
        setNewAdminEmail('');
      } else {
        alert(data.message || 'Failed to add admin');
      }
    } catch (e) {
      alert('Request failed');
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (email: string) => {
    if (!confirm(`Remove ${email} from admins?`)) return;
    setRemoving(email);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins((s) => s.filter(a => a.email !== email));
      } else {
        alert(data.message || 'Failed to remove admin');
      }
    } catch (e) {
      alert('Request failed');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/dashboard"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Management</h1>
        <p className="mt-2 text-slate-600">Manage users who can access the admin panel</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Add New Admin</h2>
        <div className="flex gap-4 mb-8">
          <input
            type="email"
            placeholder="Enter email address"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
          />
          <button
            onClick={addAdmin}
            disabled={adding || !newAdminEmail.trim()}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {adding ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Admin
              </>
            )}
          </button>
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-6">Current Admins</h2>
        <div className="space-y-4">
          {admins.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No admins configured yet</p>
          ) : (
            admins.map((admin) => (
              <div key={admin.email} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{admin.name || admin.email.split('@')[0]}</p>
                  <p className="text-sm text-slate-600">{admin.email}</p>
                  {admin.createdAt && (
                    <p className="text-xs text-slate-500">
                      Added {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeAdmin(admin.email)}
                  disabled={removing === admin.email}
                  className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove admin"
                >
                  {removing === admin.email ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}