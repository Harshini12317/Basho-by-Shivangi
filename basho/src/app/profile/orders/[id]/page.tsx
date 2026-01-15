"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

interface Order {
  _id: string;
  items: Array<{
    productSlug: string;
    qty: number;
    price: number ;
    weight: number;
  }>;
  totalAmount: number;
  subtotal: number;
  shippingAmount: number;
  gstAmount: number;
  status: 'ordered' | 'processing' | 'out for delivery' | 'shipped';
  paymentId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    gstNumber?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  images: string[];
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return;

    fetchOrderDetails();
  }, [session, status, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
        
        // Fetch product details
        const productPromises = orderData.items.map((item: any) =>
          fetch(`/api/products/${item.productSlug}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        
        const productData = await Promise.all(productPromises);
        setProducts(productData.filter(p => p !== null));
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBill = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/download-bill`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download bill. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading bill:', error);
      alert('Failed to download bill. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-16 grain-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/profile" className="inline-flex items-center text-[#8E5022] hover:text-[#652810] mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Profile
          </Link>
          <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
            <p className="text-[#442D1C] text-center serif text-xl">Order not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'out for delivery': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-16 paper-texture">
      <div className="max-w-6xl mx-auto p-8">
        <Link href="/profile" className="inline-flex items-center text-[#8E5022] hover:text-[#652810] mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Profile
        </Link>

        <h1 className="text-4xl font-bold serif text-[#442D1C] mb-8 text-center organic-float">Order Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
            <h2 className="text-2xl font-semibold serif text-[#442D1C] mb-6">Order Summary</h2>
            
            <div className="mb-4">
              <p className="text-[#442D1C]"><strong>Order ID:</strong> {order._id}</p>
              <p className="text-[#442D1C]"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-[#442D1C]"><strong>Payment ID:</strong> {order.paymentId}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              {order.customer.gstNumber && (
                <button
                  onClick={downloadBill}
                  className="inline-flex items-center px-4 py-2 bg-[#8E5022] text-white rounded-lg hover:bg-[#652810] transition-colors ml-4 mt-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Bill
                </button>
              )}
            </div>

            <div className="space-y-4">
              {order.items.map((item) => {
                const product = products.find(p => p.slug === item.productSlug);
                return (
                  <div key={item.productSlug} className="flex items-center p-4 bg-[#EDD8B4]/30 elegant-rounded-xl border border-[#8E5022]/20 clay-morphism">
                    {product && (
                      <img
                        src={product.images?.[0] || '/images/product1.png'}
                        className="w-20 h-20 object-cover elegant-rounded-lg border-2 border-white shadow-md mr-4"
                        alt={product.title}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold serif text-[#442D1C] text-lg">{product?.title || `Product ${item.productSlug}`}</h3>
                      <p className="text-[#652810]">Qty: {item.qty}</p>
                      <p className="text-[#8E5022] font-bold serif">₹{item.price} each</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
              <h2 className="text-2xl font-semibold serif text-[#442D1C] mb-6">Customer Details</h2>
              <div className="space-y-2">
                <p className="text-[#442D1C]"><strong>Name:</strong> {order.customer.name}</p>
                <p className="text-[#442D1C]"><strong>Email:</strong> {order.customer.email}</p>
                <p className="text-[#442D1C]"><strong>Phone:</strong> {order.customer.phone}</p>
              </div>
            </div>

            <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
              <h2 className="text-2xl font-semibold serif text-[#442D1C] mb-6">Delivery Address</h2>
              <div className="text-[#442D1C]">
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
              </div>
            </div>

            <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
              <h2 className="text-2xl font-semibold serif text-[#442D1C] mb-6">Order Total</h2>
              <div className="space-y-2">
                <p className="text-[#442D1C]">Subtotal: <span className="font-bold">₹{order.subtotal}</span></p>
                <p className="text-[#442D1C]">Shipping: <span className="font-bold">₹{order.shippingAmount}</span></p>
                {order.gstAmount > 0 && <p className="text-[#442D1C]">GST: <span className="font-bold">₹{order.gstAmount}</span></p>}
                <p className="text-2xl font-bold text-[#8E5022] mt-4">Total: ₹{order.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}