'use client';

import { useState, useEffect } from 'react';

interface WorkshopRegistration {
  _id: string;
  workshopSlug: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminWorkshopRegistrations() {
  const [registrations, setRegistrations] = useState<WorkshopRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/workshop-registrations');
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(registration =>
    registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.workshopSlug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group registrations by workshop
  const groupedByWorkshop = filteredRegistrations.reduce((acc, reg) => {
    if (!acc[reg.workshopSlug]) {
      acc[reg.workshopSlug] = [];
    }
    acc[reg.workshopSlug].push(reg);
    return acc;
  }, {} as Record<string, WorkshopRegistration[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Workshop Registrations</h1>
        <p className="mt-2 text-slate-600">Manage workshop registration data</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, or workshop..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Registrations by Workshop */}
      <div className="space-y-6">
        {Object.entries(groupedByWorkshop).map(([workshopSlug, regs]) => (
          <div key={workshopSlug} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900 capitalize">
                {workshopSlug.replace(/-/g, ' ')}
              </h2>
              <p className="text-sm text-slate-600">{regs.length} registration{regs.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {regs.map((registration) => (
                    <tr key={registration._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{registration.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{registration.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">
                          {new Date(registration.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {Object.keys(groupedByWorkshop).length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No registrations found</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Registrations</p>
              <p className="text-2xl font-bold text-slate-900">{registrations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Workshops</p>
              <p className="text-2xl font-bold text-slate-900">{Object.keys(groupedByWorkshop).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">This Month</p>
              <p className="text-2xl font-bold text-slate-900">
                {registrations.filter(reg =>
                  new Date(reg.createdAt).getMonth() === new Date().getMonth() &&
                  new Date(reg.createdAt).getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}