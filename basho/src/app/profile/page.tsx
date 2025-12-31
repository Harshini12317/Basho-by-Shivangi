"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: "",
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
            setAddresses(data.addresses || []);
            // Set default address for editing if exists
            const defaultAddress = data.addresses?.find((addr: any) => addr.isDefault);
            if (defaultAddress) {
              setAddressForm({
                label: defaultAddress.label || "Home",
                street: defaultAddress.street || "",
                city: defaultAddress.city || "",
                state: defaultAddress.state || "",
                zip: defaultAddress.zip || "",
                phone: data.phone || ""
              });
            }
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

    // Product orders: fetch from API
    fetch("/api/orders")
      .then((res) => res.json())
      .then((orders: any[]) => {
        setProductOrders(orders.map((order) => ({
          id: order._id,
          title: order.items.map((item: any) => item.productSlug).join(', '),
          slug: order.items[0]?.productSlug || '',
          qty: order.items.reduce((sum: number, item: any) => sum + item.qty, 0),
          amount: order.totalAmount,
          createdAt: order.createdAt,
        })));
      })
      .catch(() => setProductOrders([]));

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
      let updatedAddresses = [...addresses];
      
      if (editingAddressId) {
        // Edit existing address
        updatedAddresses = addresses.map(addr => 
          addr._id === editingAddressId 
            ? { ...addr, ...addressForm }
            : addr
        );
      } else {
        // Add new address
        const newAddress = {
          _id: require('crypto').randomUUID(),
          ...addressForm,
          isDefault: addresses.length === 0 // First address is default
        };
        updatedAddresses.push(newAddress);
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: updatedAddresses,
          phone: addressForm.phone
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUserProfile(data);
        setAddresses(data.addresses || []);
        setIsEditingAddress(false);
        setEditingAddressId(null);
        setAddressForm({
          label: "Home",
          street: "",
          city: "",
          state: "",
          zip: "",
          phone: ""
        });
      } else {
        console.error("Failed to save address", data.error);
      }
    } catch (err) {
      console.error("Error saving address", err);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddress = (address: any) => {
    setAddressForm({
      label: address.label || "Home",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      phone: userProfile?.phone || ""
    });
    setEditingAddressId(address._id);
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: updatedAddresses,
          phone: userProfile?.phone || ""
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUserProfile(data);
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Error deleting address", err);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      }));
      
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: updatedAddresses,
          phone: userProfile?.phone || ""
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUserProfile(data);
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Error setting default address", err);
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
    <div className="bg-[#FDFBF7] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-[32px] shadow-sm border border-[#EDD8B4]/50 p-6 sm:p-8 mb-8 lg:mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFF5E6] to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8 relative z-10">
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#FDFBF7] border-2 border-[#E2C48D] flex items-center justify-center text-[#8B4513] shadow-sm">
                 <FaUser className="text-2xl lg:text-3xl opacity-80" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#E76F51] mb-1">My Account</div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-serif font-bold text-slate-800 mb-1">{userName}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  {userEmail}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4">
              <button 
                onClick={() => signOut()}
                className="group flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-3.5 rounded-full bg-slate-100 text-slate-700 shadow-md hover:bg-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <span className="font-semibold tracking-wide">Logout</span>
              </button>
              <Link 
                href="/products" 
                className="group flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-3.5 rounded-full bg-[#E76F51] text-white shadow-lg shadow-orange-200 hover:bg-[#D35400] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <FaShoppingBag className="text-lg" />
                <span className="font-semibold tracking-wide">Shop Products</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
          {/* Products Ordered */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full min-w-[280px]">
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
                    <Link key={o.id} href={`/profile/orders/${o.id}`} className="block">
                      <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] hover:shadow-md transition-all duration-300 group cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 font-medium mb-1">Order #{o.id.slice(-8)}</div>
                            <div className="font-semibold text-slate-800 group-hover:text-[#E76F51] transition-colors text-sm leading-tight">{o.title}</div>
                          </div>
                          <div className="text-slate-900 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 text-sm">₹{o.amount}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-slate-500 text-xs font-medium bg-white px-2 py-1 rounded-md shadow-sm">Qty: {o.qty}</div>
                          <div className="text-xs text-slate-400">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <FaSearch className="text-xs" />
                          View Details →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Orders */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full min-w-[280px]">
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
                    <div key={co._id} className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 font-medium mb-1">Request #{co._id.slice(-8)}</div>
                          <div className="font-semibold text-slate-800 text-sm leading-tight overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{co.description}</div>
                        </div>
                        {typeof co.quotedPrice === "number" && (
                          <div className="text-slate-900 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 text-sm ml-3">₹{co.quotedPrice}</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                          co.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          co.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {co.status}
                        </div>
                        <div className="text-xs text-slate-400">
                          {co.createdAt ? new Date(co.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workshop/Event Registrations */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full min-w-[280px]">
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
                    <div key={r._id} className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 font-medium mb-1">Registration #{r._id.slice(-8)}</div>
                          <div className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors text-sm leading-tight">{r.workshopSlug}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-slate-500 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                          <span className="font-medium text-slate-700">{r.name}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wishlist */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full min-w-[280px]">
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
                      <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-slate-100 hover:border-[#E2C48D] hover:shadow-md transition-all duration-300 group cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 group-hover:text-red-700 transition-colors text-sm leading-tight overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{item.productTitle}</div>
                            <div className="text-slate-900 font-bold text-sm mt-1">₹{item.productPrice}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromWishlist(item.productSlug);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                            title="Remove from wishlist"
                          >
                            <FaHeart className="text-sm fill-current" />
                          </button>
                        </div>
                        <div className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <FaSearch className="text-xs" />
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
          <div className="bg-white rounded-3xl shadow-sm border border-[#EDD8B4]/30 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full min-w-[280px]">
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
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      label: "Home",
                      street: "",
                      city: "",
                      state: "",
                      zip: "",
                      phone: userProfile?.phone || ""
                    });
                    setIsEditingAddress(true);
                  }}
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
                    placeholder="Label (e.g., Home, Work)"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                  />
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
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={addressForm.zip}
                    onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-slate-200 text-sm"
                  />
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveAddress} disabled={isSavingAddress} className="flex-1 bg-slate-800 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700">
                      {isSavingAddress ? "SAVING..." : editingAddressId ? "UPDATE" : "SAVE"}
                    </button>
                    <button onClick={() => {
                      setIsEditingAddress(false);
                      setEditingAddressId(null);
                      setAddressForm({
                        label: "Home",
                        street: "",
                        city: "",
                        state: "",
                        zip: "",
                        phone: userProfile?.phone || ""
                      });
                    }} className="flex-1 bg-slate-100 text-slate-500 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200">CANCEL</button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                      <FaMapMarkerAlt className="text-3xl mb-2 opacity-20" />
                      <span className="text-xs font-medium">No addresses saved</span>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {addresses.map((address) => (
                        <div key={address._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#E2C48D] transition-colors relative group">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 text-sm">{address.label}</span>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 bg-[#E76F51] text-white text-xs rounded-full font-bold">DEFAULT</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditAddress(address)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Edit address"
                              >
                                <FaPen className="text-xs" />
                              </button>
                              {!address.isDefault && (
                                <button 
                                  onClick={() => handleDeleteAddress(address._id)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Delete address"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-slate-600 text-xs leading-relaxed">
                            {address.street}<br />
                            {address.city}, {address.state} {address.zip}
                          </div>
                          {address.phone && (
                            <div className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                              <FaPhone className="text-xs" />
                              {address.phone}
                            </div>
                          )}
                          {!address.isDefault && (
                            <button 
                              onClick={() => handleSetDefaultAddress(address._id)}
                              className="mt-2 text-xs text-[#E76F51] hover:text-[#D35400] font-medium"
                            >
                              Set as default
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4">
                    <button 
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({
                          label: "Home",
                          street: "",
                          city: "",
                          state: "",
                          zip: "",
                          phone: userProfile?.phone || ""
                        });
                        setIsEditingAddress(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      + Add New Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
