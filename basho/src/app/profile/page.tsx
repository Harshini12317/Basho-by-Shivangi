"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { FaShoppingBag, FaPaintBrush, FaCalendarAlt, FaUser, FaBoxOpen, FaMapMarkerAlt, FaPhone, FaPen, FaHeart } from "react-icons/fa";

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

type WishlistItem = {
  productSlug: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  addedAt: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  
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

    // Wishlist
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setWishlistItems(data.items || []);
        }
      })
      .catch(() => setWishlistItems([]));
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

  const removeFromWishlist = async (productSlug: string) => {
    try {
      const response = await fetch(`/api/wishlist?productSlug=${encodeURIComponent(productSlug)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlistItems(updatedWishlist.items || []);
      } else {
        console.error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
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
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => signOut()}
                className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-slate-100 text-slate-700 shadow-md hover:bg-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <span className="font-semibold tracking-wide">Logout</span>
              </button>
              <Link 
                href="/products" 
                className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#E76F51] text-white shadow-lg shadow-orange-200 hover:bg-[#D35400] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <FaShoppingBag className="text-lg" />
                <span className="font-semibold tracking-wide">Shop Products</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8">
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

          {/* Wishlist */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <FaHeart className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Wishlist</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Saved Items</p>
              </div>
            </div>

            <div className="flex-1">
              {wishlistItems.length === 0 ? (
                emptyState
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <Link key={item.productSlug} href={`/products/${item.productSlug}`} className="block">
                      <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 group-hover:text-red-700 transition-colors text-sm">{item.productTitle}</div>
                            <div className="text-slate-900 font-bold text-sm">₹{item.productPrice}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromWishlist(item.productSlug);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove from wishlist"
                          >
                            <FaHeart className="text-sm fill-current" />
                          </button>
                        </div>
                        <div className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          View Product →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Address Book */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <FaMapMarkerAlt className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Address Book</h2>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Shipping Details</p>
                </div>
              </div>
              {!isEditingAddress && (
                <button 
                  onClick={() => setIsEditingAddress(true)}
                  className="p-2 text-slate-400 hover:text-[#E76F51] transition-colors"
                >
                  <FaPen />
                </button>
              )}
            </div>

            <div className="flex-1">
              {isEditingAddress ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E2C48D]/50 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E2C48D]/50 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E2C48D]/50 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E2C48D]/50 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E2C48D]/50 text-sm"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E2C48D]/50 text-sm"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveAddress}
                      disabled={isSavingAddress}
                      className="flex-1 bg-[#E76F51] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#D35400] disabled:opacity-50"
                    >
                      {isSavingAddress ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userProfile?.address?.street ? (
                    <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100">
                      <div className="font-semibold text-slate-800 mb-1">{userProfile.address.street}</div>
                      <div className="text-slate-600 text-sm">
                        {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zip}
                      </div>
                      <div className="text-slate-600 text-sm">{userProfile.address.country}</div>
                      {userProfile.phone && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500 border-t border-slate-200 pt-2">
                          <FaPhone className="text-xs" />
                          <span>{userProfile.phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:border-[#E2C48D] hover:text-[#E76F51] transition-all" onClick={() => setIsEditingAddress(true)}>
                      <FaMapMarkerAlt className="text-3xl mb-2 opacity-30" />
                      <div className="text-sm font-medium">Add Address</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
