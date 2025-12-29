"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { FaShoppingBag, FaPaintBrush, FaCalendarAlt, FaUser, FaBoxOpen, FaMapMarkerAlt, FaPhone, FaPen, FaHeart, FaSearch } from "react-icons/fa";

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
  const [favorites, setFavorites] = useState<any[]>([]);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: ""
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "";

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setUserProfile(data);
            setAddressForm({
              street: data.address?.street || "",
              city: data.address?.city || "",
              state: data.address?.state || "",
              zip: data.address?.zip || "",
              country: data.address?.country || "",
              phone: data.phone || ""
            });
          }
        })
        .catch((err) => console.error("Failed to fetch profile", err));
    }

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

    // Favorites placeholder (demo)
    setFavorites([]);
  }, [userEmail]);

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            street: addressForm.street,
            city: addressForm.city,
            state: addressForm.state,
            zip: addressForm.zip,
            country: addressForm.country
          },
          phone: addressForm.phone
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUserProfile(data);
        setIsEditingAddress(false);
      } else {
        console.error("Failed to save address", data.error);
      }
    } catch (err) {
      console.error("Error saving address", err);
    } finally {
      setIsSavingAddress(false);
    }
  };

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
    <div className="bg-[#FDFBF7] min-h-screen py-8 px-4 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-[30px] shadow-sm border border-[#EAEAEA] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="flex items-center gap-5 z-10 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-[#FFF5E6] border border-[#E2C48D] flex items-center justify-center text-[#8B4513] text-2xl font-bold shadow-sm">
              {userName ? userName.charAt(0).toUpperCase() : <FaUser />}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#E76F51] mb-0.5">My Account</div>
              <h1 className="text-2xl font-serif font-bold text-slate-800 leading-tight">{userName}</h1>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                {userEmail}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl w-full px-4 relative z-10">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search for products, workshops..." 
                  className="w-full pl-6 pr-12 py-3 rounded-full bg-[#F9F9F9] border-none text-sm text-slate-600 focus:ring-2 focus:ring-[#E2C48D]/30 outline-none transition-all placeholder:text-slate-400"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
             </div>
          </div>
            
          <div className="flex items-center gap-6 z-10 w-full md:w-auto justify-end">
             <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                <Link href="/products" className="hover:text-[#E76F51] transition-colors border-b-2 border-transparent hover:border-[#E76F51] pb-0.5">Shop</Link>
                <Link href="#" className="hover:text-[#E76F51] transition-colors">Help</Link>
                <button onClick={() => {}} className="hover:text-[#E76F51] transition-colors">Logout</button>
             </div>
             <Link 
              href="/products" 
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E76F51] text-white shadow-md shadow-orange-100 hover:bg-[#D35400] hover:shadow-lg transition-all duration-300 text-sm font-semibold"
            >
              <FaShoppingBag />
              <span>Shop Products</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Address Book - Styled as "Shipping Address" Card */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Shipping Address</h2>
            </div>

            <div className="flex-1">
              {isEditingAddress ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Zip"
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                  />
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveAddress} disabled={isSavingAddress} className="flex-1 bg-slate-800 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700">SAVE</button>
                    <button onClick={() => setIsEditingAddress(false)} className="flex-1 bg-slate-100 text-slate-500 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200">CANCEL</button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  {userProfile?.address?.street ? (
                     <div className="flex items-start justify-between">
                        <div>
                           <div className="font-bold text-slate-800 text-base mb-1">{userName}</div>
                           <div className="text-slate-500 text-sm leading-relaxed">
                              {userProfile.address.street},<br />
                              {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zip}<br />
                              {userProfile.address.country}
                           </div>
                           {userProfile.phone && <div className="text-slate-400 text-xs mt-2">{userProfile.phone}</div>}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                           <FaMapMarkerAlt />
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                        <FaMapMarkerAlt className="text-3xl mb-2 opacity-20" />
                        <span className="text-xs font-medium">No address set</span>
                     </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-6">
                     <button 
                        onClick={() => setIsEditingAddress(true)}
                        className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                     >
                        {userProfile?.address?.street ? <><FaPen /> Edit Address</> : "+ Add New Address"}
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Requests - Green Theme */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border-2 border-green-100/50 p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                <FaPaintBrush className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Custom</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requests</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {customOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                  <FaBoxOpen className="text-4xl mb-3 opacity-20" />
                  <div className="text-xs font-medium">No records yet</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {customOrders.map((co) => (
                    <div key={co._id} className="p-3 rounded-xl bg-green-50/30 border border-green-100 flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{co.description}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                         co.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>{co.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorites - Purple Theme */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border-2 border-purple-100/50 p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <FaHeart className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Favorites</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Products</p>
              </div>
               {favorites.length > 0 && <span className="ml-auto w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">{favorites.length}</span>}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                  <FaBoxOpen className="text-4xl mb-3 opacity-20" />
                  <div className="text-xs font-medium">No records yet</div>
                </div>
              ) : (
                <div className="space-y-3">
                   {/* Favorites list would go here */}
                </div>
              )}
            </div>
          </div>

          {/* Orders - Orange Theme */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border-2 border-orange-100/50 p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                <FaShoppingBag className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Orders</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requests</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {productOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                  <FaBoxOpen className="text-4xl mb-3 opacity-20" />
                  <div className="text-xs font-medium">No records yet</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {productOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/30 border border-orange-100">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{o.title}</div>
                        <div className="text-slate-400 text-[10px] font-medium">Qty: {o.qty}</div>
                      </div>
                      <div className="text-slate-900 font-bold text-sm">₹{o.amount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workshops - Blue Theme */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border-2 border-blue-100/50 p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FaCalendarAlt className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Workshops</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registrations</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {registrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                  <FaBoxOpen className="text-4xl mb-3 opacity-20" />
                  <div className="text-xs font-medium">No records yet</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((r) => (
                    <div key={r._id} className="p-3 rounded-xl bg-blue-50/30 border border-blue-100">
                      <div className="font-semibold text-slate-800 text-sm mb-1">{r.workshopSlug}</div>
                      <div className="text-slate-400 text-[10px]">Registered: {r.name}</div>
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
