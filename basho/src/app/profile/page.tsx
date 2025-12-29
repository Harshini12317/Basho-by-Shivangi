"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { FaShoppingBag, FaPaintBrush, FaCalendarAlt, FaUser, FaBoxOpen } from "react-icons/fa";

type CustomOrder = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  quotedPrice?: number;
  createdAt?: string | Date;
};

type Registration = {
  _id: string;
  workshopSlug: string;
  name: string;
  email: string;
  createdAt?: string | Date;
};

type ProductOrder = {
  id: string;
  title: string;
  slug: string;
  qty: number;
  amount: number;
  createdAt: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);

  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "";

  useEffect(() => {
    // Custom Orders
    fetch("/api/custom-orders")
      .then((res) => res.json())
      .then((data: CustomOrder[]) => {
        const filtered = userEmail ? data.filter((d) => (d.email || "").toLowerCase() === userEmail.toLowerCase()) : [];
        setCustomOrders(filtered);
      })
      .catch(() => setCustomOrders([]));

    // Workshop Registrations
    fetch("/api/admin/workshop-registrations")
      .then((res) => res.json())
      .then((data: Registration[]) => {
        const filtered = userEmail ? data.filter((d) => (d.email || "").toLowerCase() === userEmail.toLowerCase()) : [];
        setRegistrations(filtered);
      })
      .catch(() => setRegistrations([]));

    // Product orders: pull from localStorage if present (fallback demo)
    try {
      const raw = localStorage.getItem("productOrders");
      if (raw) {
        const parsed = JSON.parse(raw) as ProductOrder[];
        setProductOrders(parsed.filter((o) => !userEmail || o.id.includes(userEmail)));
      }
    } catch {
      setProductOrders([]);
    }
  }, [userEmail]);

  const isLoading = status === "loading";
  const isAuthed = status === "authenticated";

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
        <FaBoxOpen className="text-3xl mb-2 opacity-30" />
        <div className="text-sm font-medium">No records yet</div>
      </div>
    ),
    []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-[#EDD8B4] p-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Sign in to view your profile</h1>
          <p className="text-slate-600 mb-5">Access your orders, custom requests, and workshop registrations.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth" className="px-4 py-2 rounded-full bg-[#E76F51] text-white shadow-md hover:bg-[#D35400]">
              Sign in with Email
            </Link>
            <button onClick={() => signIn("google")} className="px-4 py-2 rounded-full bg-white ring-1 ring-[#E2C48D] text-slate-900 shadow-sm hover:shadow-md">
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F2] min-h-screen py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-[32px] shadow-sm border border-[#EDD8B4]/50 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFF5E6] to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[#FDFBF7] border-2 border-[#E2C48D] flex items-center justify-center text-[#8B4513] shadow-sm">
                 <FaUser className="text-3xl opacity-80" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#E76F51] mb-1">My Account</div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-1">{userName}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  {userEmail}
                </p>
              </div>
            </div>
            
            <Link 
              href="/products" 
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#E76F51] text-white shadow-lg shadow-orange-200 hover:bg-[#D35400] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <FaShoppingBag className="text-lg" />
              <span className="font-semibold tracking-wide">Shop Products</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Ordered */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                <FaShoppingBag className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Orders</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Products</p>
              </div>
            </div>
            
            <div className="flex-1">
              {productOrders.length === 0 ? (
                emptyState
              ) : (
                <div className="space-y-4">
                  {productOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] transition-colors group">
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-[#E76F51] transition-colors">{o.title}</div>
                        <div className="text-slate-500 text-xs mt-1 font-medium bg-white px-2 py-1 rounded-md inline-block shadow-sm">Qty: {o.qty}</div>
                      </div>
                      <div className="text-slate-900 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">₹{o.amount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Orders */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <FaPaintBrush className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Custom</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Requests</p>
              </div>
            </div>

            <div className="flex-1">
              {customOrders.length === 0 ? (
                emptyState
              ) : (
                <div className="space-y-4">
                  {customOrders.map((co) => (
                    <div key={co._id} className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] transition-colors">
                      <div className="font-semibold text-slate-800 mb-2">{co.description}</div>
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                          co.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          co.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {co.status}
                        </div>
                        {typeof co.quotedPrice === "number" && (
                          <div className="text-slate-900 font-bold text-sm">₹{co.quotedPrice}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workshop/Event Registrations */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Workshops</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Registrations</p>
              </div>
            </div>

            <div className="flex-1">
              {registrations.length === 0 ? (
                emptyState
              ) : (
                <div className="space-y-4">
                  {registrations.map((r) => (
                    <div key={r._id} className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] transition-colors group">
                      <div className="font-semibold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">{r.workshopSlug}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        Registered as: <span className="font-medium text-slate-700">{r.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
