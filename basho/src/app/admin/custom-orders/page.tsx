'use client';

import { useState, useEffect } from 'react';

interface CustomOrder {
  _id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  referenceImages: string[];
  status: 'requested' | 'quoted' | 'in-progress' | 'completed';
  quotedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [quotePrice, setQuotePrice] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/custom-orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, quotedPrice?: number) => {
    try {
      const response = await fetch('/api/admin/custom-orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          status,
          quotedPrice,
        }),
      });

      if (response.ok) {
        fetchOrders();
        setSelectedOrder(null);
        setQuotePrice('');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900">Custom Order Management</h1>
        <p className="mt-2 text-slate-600">Manage custom pottery order requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Orders ({orders.length})</h2>
            </div>

            <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedOrder?._id === order._id ? 'bg-slate-100' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900">{order.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{order.email}</p>
                      <p className="text-sm text-slate-500 line-clamp-2">{order.description}</p>
                      {order.quotedPrice && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Quoted: ₹{order.quotedPrice}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No custom orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Customer</label>
                  <p className="text-sm text-slate-900">{selectedOrder.name}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.email}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.phone}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <p className="text-sm text-slate-600">{selectedOrder.description}</p>
                </div>

                {selectedOrder.referenceImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reference Images</label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.referenceImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Reference ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {selectedOrder.quotedPrice && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Quoted Price</label>
                    <p className="text-sm font-medium text-green-600">₹{selectedOrder.quotedPrice}</p>
                  </div>
                )}

                {/* Status Update Actions */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>

                  {selectedOrder.status === 'requested' && (
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Quote price (₹)"
                        value={quotePrice}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuotePrice(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                      />
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'quoted', Number(quotePrice))}
                        disabled={!quotePrice}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send Quote
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'quoted' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder._id, 'in-progress')}
                      className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      Start Work
                    </button>
                  )}

                  {selectedOrder.status === 'in-progress' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder._id, 'completed')}
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-center text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select an order to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}