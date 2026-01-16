'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaChevronDown } from 'react-icons/fa';

interface ProductItem {
  productSlug: string;
  qty: number;
  price: number;
  weight: number;
}

interface WorkshopItem {
  _id: string;
  workshopTitle: string;
  date: string;
  members: number;
  amount: number;
  createdAt: string;
}

interface Order {
  _id: string;
  items: ProductItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  totalOrders: number;
  totalWorkshops: number;
  productSpending: number;
  workshopSpending: number;
  totalSpending: number;
  orders: Order[];
  workshops: WorkshopItem[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'spending' | 'orders' | 'name'>('spending');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter((customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'spending') return b.totalSpending - a.totalSpending;
      if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
      return a.name.localeCompare(b.name);
    });

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN');

  if (loading) {
    return (
      <div className="min-h-screen py-16 grain-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold serif text-[#442D1C] mb-8 text-center organic-float">
            Customer Management
          </h1>
          <div className="text-center text-slate-600">Loading customers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 grain-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold serif text-[#442D1C] organic-float">Customer Management</h1>
            <p className="text-slate-600 mt-2">Total Customers: {customers.length}</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-[#8E5022] text-white rounded-lg hover:bg-[#6B3D1A] transition"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-4 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#EDD8B4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-[#EDD8B4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
            >
              <option value="spending">Sort by Spending</option>
              <option value="orders">Sort by Orders</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Customers List */}
        <div className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-slate-600">
              No customers found
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Customer Header */}
                <button
                  onClick={() =>
                    setExpandedCustomerId(
                      expandedCustomerId === customer._id ? null : customer._id
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#442D1C]">{customer.name}</h3>
                    <p className="text-sm text-slate-600">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-sm text-slate-600">{customer.phone}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mr-4 hidden sm:flex">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#8E5022]">
                        {customer.totalOrders + customer.totalWorkshops}
                      </p>
                      <p className="text-xs text-slate-600">Total Activity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#8E5022]">
                        {formatCurrency(customer.totalSpending)}
                      </p>
                      <p className="text-xs text-slate-600">Total Spent</p>
                    </div>
                  </div>

                  <FaChevronDown
                    className={`w-5 h-5 text-[#8E5022] transition ${
                      expandedCustomerId === customer._id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedCustomerId === customer._id && (
                  <div className="border-t border-[#EDD8B4] p-6 bg-slate-50">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Product Orders</p>
                        <p className="text-2xl font-bold text-[#8E5022]">
                          {customer.totalOrders}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Workshop Registrations</p>
                        <p className="text-2xl font-bold text-[#8E5022]">
                          {customer.totalWorkshops}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Product Spending</p>
                        <p className="text-lg font-bold text-[#8E5022]">
                          {formatCurrency(customer.productSpending)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Workshop Spending</p>
                        <p className="text-lg font-bold text-[#8E5022]">
                          {formatCurrency(customer.workshopSpending)}
                        </p>
                      </div>
                    </div>

                    {/* Product Orders */}
                    {customer.orders.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-[#442D1C] mb-3">
                          Product Orders ({customer.orders.length})
                        </h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {customer.orders.map((order) => (
                            <div
                              key={order._id}
                              className="bg-white p-3 rounded-lg border border-[#EDD8B4]"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-slate-900">
                                  Order #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  order.status === 'shipped'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'out for delivery'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                {order.items.map((item) => `${item.productSlug} (x${item.qty})`).join(', ')}
                              </p>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">{formatDate(order.createdAt)}</span>
                                <span className="font-semibold text-[#8E5022]">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Workshop Registrations */}
                    {customer.workshops.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-[#442D1C] mb-3">
                          Workshop Registrations ({customer.workshops.length})
                        </h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {customer.workshops.map((workshop) => (
                            <div
                              key={workshop._id}
                              className="bg-white p-3 rounded-lg border border-[#EDD8B4]"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-slate-900">
                                  {workshop.workshopTitle}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                  {workshop.members} member{workshop.members > 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">
                                  {workshop.date ? formatDate(workshop.date) : 'Date TBD'}
                                </span>
                                <span className="font-semibold text-[#8E5022]">
                                  {formatCurrency(workshop.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {customer.orders.length === 0 && customer.workshops.length === 0 && (
                      <div className="text-center text-slate-600 py-4">
                        No orders or workshop registrations yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
