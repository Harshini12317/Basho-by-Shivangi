'use client';

import { useEffect, useState } from 'react';

interface Inquiry {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

export default function AdminCorporateInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const res = await fetch('/api/admin/corporate-inquiries');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  const filtered = items.filter(i =>
    i.companyName.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    (i.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    i.message.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  );

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Corporate Inquiries</h1>
          <p className="mt-2 text-slate-600">Submissions from the corporate inquiry form</p>
        </div>
        <a href="/admin/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="max-w-md">
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Received</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.map(item => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-900">{item.companyName}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-900">{item.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-900">{item.phone || '-'}</div></td>
                  <td className="px-6 py-4"><div className="text-sm text-slate-700">{item.message}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
