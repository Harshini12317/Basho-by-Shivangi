'use client';

import { useState, useEffect } from 'react';

interface Order {
  _id: string;
  userId: string;
  items: Array<{
    productSlug: string;
    qty: number;
    price: number;
    weight: number;
  }>;
  totalAmount: number;
  status: 'ordered' | 'processing' | 'out for delivery' | 'shipped';
  paymentId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen py-16 grain-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold serif text-[#442D1C] mb-8 text-center organic-float">Orders</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 grain-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold serif text-[#442D1C] organic-float">Orders</h1>
          <a href="/admin/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </a>
        </div>

        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-[#EDD8B4] elegant-rounded-xl bg-white"
          >
            <option value="all">All Orders</option>
            <option value="ordered">Ordered</option>
            <option value="processing">Processing</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white/90 elegant-rounded-2xl p-6 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-[#442D1C]">Order ID</h3>
                  <p className="text-[#652810]">{order._id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#442D1C]">Customer</h3>
                  <p className="text-[#652810]">{order.customer.name}</p>
                  <p className="text-sm text-[#8E5022]">{order.customer.email}</p>
                  <p className="text-sm text-[#8E5022]">{order.customer.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#442D1C]">Amount</h3>
                  <p className="text-[#652810] font-bold">₹{order.totalAmount}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#442D1C]">Status</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(['ordered', 'processing', 'out for delivery', 'shipped'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order._id, status)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          order.status === status
                            ? 'bg-[#8E5022] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-[#442D1C] mb-2">Items</h3>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="text-sm text-[#652810]">
                      {item.productSlug} - Qty: {item.qty} - ₹{item.price} each
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#442D1C] mb-2">Delivery Address</h3>
                <p className="text-sm text-[#652810]">
                  {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip}
                </p>
              </div>

              <div className="mt-4 text-sm text-[#8E5022]">
                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#442D1C] serif text-xl">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}