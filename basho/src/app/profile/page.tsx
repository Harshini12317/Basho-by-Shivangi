"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { FaShoppingBag, FaPaintBrush, FaCalendarAlt, FaUser, FaBoxOpen, FaMapMarkerAlt, FaPhone, FaPen, FaHeart, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

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
  image?: string;
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
  const [expandedSections, setExpandedSections] = useState({
    orders: true, // Default expanded
    customOrders: false,
    workshops: false,
    wishlist: false,
    addressBook: false,
  });
  
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
      .then(async (orders: any[]) => {
        // Fetch product details for images
        const ordersWithImages = await Promise.all(
          orders.map(async (order) => {
            let image = '';
            if (order.items && order.items.length > 0) {
              try {
                // Try to fetch product details for the first item
                const productRes = await fetch(`/api/products/${order.items[0].productSlug}`);
                if (productRes.ok) {
                  const productData = await productRes.json();
                  image = productData.images?.[0] || '';
                }
              } catch (error) {
                console.log('Could not fetch product image for order:', order._id);
              }
            }
            
            return {
              id: order._id,
              title: order.items.map((item: any) => item.productSlug).join(', '),
              slug: order.items[0]?.productSlug || '',
              qty: order.items.reduce((sum: number, item: any) => sum + item.qty, 0),
              amount: order.totalAmount,
              createdAt: order.createdAt,
              image: image,
            };
          })
        );
        setProductOrders(ordersWithImages);
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
      <div className="bg-gradient-to-br from-[#FDFBF7] via-[#FAF7F0] to-[#F5F1E8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8E5022] to-[#C85428] border-4 border-[#EDD8B4] flex items-center justify-center text-white shadow-xl">
            <FaUser className="text-3xl opacity-90" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#EDD8B4] border-t-[#8E5022] mx-auto mb-4"></div>
          <p className="text-[#442D1C] font-serif font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="bg-gradient-to-br from-[#FDFBF7] via-[#FAF7F0] to-[#F5F1E8] min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          <div className="bg-white/95 backdrop-blur-sm elegant-rounded-3xl shadow-2xl border-2 border-[#EDD8B4]/60 p-8 lg:p-10 text-center relative overflow-hidden clay-texture">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#8E5022]/10 to-transparent rounded-bl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#C85428]/10 to-transparent rounded-tr-3xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8E5022] to-[#C85428] border-4 border-[#EDD8B4] flex items-center justify-center text-white shadow-xl">
                <FaUser className="text-3xl opacity-90" />
              </div>

              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#442D1C] mb-4">Welcome Back</h1>
              <p className="text-[#652810] font-medium mb-8 leading-relaxed">Sign in to access your personalized dashboard, track orders, and manage your preferences.</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth" className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white shadow-xl shadow-orange-200/30 hover:shadow-2xl hover:from-[#652810] hover:to-[#8E5022] hover:-translate-y-1 transition-all duration-300 font-bold text-center border-2 border-[#EDD8B4]/30">
                  Sign in with Email
                </Link>
                <button onClick={() => signIn("google")} className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-white ring-2 ring-[#EDD8B4] text-[#442D1C] shadow-lg hover:shadow-xl hover:bg-[#F9F7F2] transition-all duration-300 font-bold text-center border-2 border-[#EDD8B4]/50">
                  Continue with Google
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EDD8B4]/50">
                <p className="text-[#8E5022] text-sm font-medium">
                  New to Basho? <Link href="/auth" className="text-[#C85428] hover:text-[#652810] font-bold hover:underline transition-colors">Create an account</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#FDFBF7] via-[#FAF7F0] to-[#F5F1E8] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/95 backdrop-blur-sm elegant-rounded-3xl shadow-xl border-2 border-[#EDD8B4]/60 p-6 sm:p-8 lg:p-10 mb-8 lg:mb-12 relative overflow-hidden clay-texture">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FFF8F0]/40 to-transparent rounded-bl-full -mr-20 -mt-20 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#F0E6D2]/30 to-transparent rounded-tr-full -ml-16 -mb-16 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8E5022]/5 rounded-full opacity-30"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8 relative z-10">
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-[#8E5022] to-[#C85428] border-4 border-[#EDD8B4] flex items-center justify-center text-white shadow-xl relative">
                <FaUser className="text-3xl lg:text-4xl opacity-90" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#8E5022] mb-2 serif">Welcome Back</div>
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-[#442D1C] mb-2 leading-tight">{userName}</h1>
                <p className="text-[#652810] font-medium flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  {userEmail}
                </p>
                <p className="text-[#8E5022] text-sm mt-1 font-medium">Member since {new Date().getFullYear()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => signOut()}
                className="group flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-3.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-lg hover:shadow-xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 border border-slate-300/50"
              >
                <span className="font-semibold tracking-wide">Sign Out</span>
              </button>
              <Link
                href="/products"
                className="group flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-3.5 rounded-full bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white shadow-xl shadow-orange-200/50 hover:shadow-2xl hover:from-[#652810] hover:to-[#8E5022] hover:-translate-y-0.5 transition-all duration-300 border-2 border-[#EDD8B4]/30"
              >
                <FaShoppingBag className="text-lg" />
                <span className="font-semibold tracking-wide">Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Horizontal Sections */}
        <div className="space-y-4 lg:space-y-6">
          {/* Wishlist Section */}
          <div className="bg-white/95 backdrop-blur-sm elegant-rounded-3xl shadow-xl border-2 border-[#EDD8B4]/60 overflow-hidden clay-texture">
            <div
              className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-[#F9F7F2]/50 transition-all duration-300"
              onClick={() => toggleSection('wishlist')}
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-lg border border-red-200/50">
                  <FaHeart className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-[#442D1C] serif">Wishlist</h2>
                  <p className="text-sm text-[#8E5022] font-semibold uppercase tracking-[0.15em]">Saved Items</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#8E5022] font-bold bg-[#EDD8B4]/50 px-3 py-1 rounded-full">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                </div>
                {expandedSections.wishlist ? (
                  <FaChevronUp className="text-[#8E5022] text-xl transition-transform duration-300" />
                ) : (
                  <FaChevronDown className="text-[#8E5022] text-xl transition-transform duration-300" />
                )}
              </div>
            </div>

            {expandedSections.wishlist && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-[#EDD8B4]/30">
                {wishlistItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#8E5022]/60">
                    <div className="p-6 rounded-full bg-[#EDD8B4]/30 mb-4">
                      <FaHeart className="text-4xl opacity-40" />
                    </div>
                    <div className="text-sm font-semibold mb-1">No saved items</div>
                    <p className="text-xs text-center opacity-70">Items you love will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    {wishlistItems.map((item) => (
                      <Link key={item.productSlug} href={`/products/${item.productSlug}`} className="block">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F9F7F2] to-[#EDD8B4]/20 border-2 border-[#EDD8B4]/40 hover:border-red-300/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                          {/* Subtle background pattern */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-xl"></div>

                          <div className="flex items-center gap-4 mb-4 relative z-10">
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-16 h-16 object-cover rounded-xl border-2 border-[#EDD8B4] flex-shrink-0 shadow-md"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[#442D1C] group-hover:text-red-700 transition-colors text-sm leading-tight overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{item.productTitle}</div>
                              <div className="text-[#8E5022] font-bold text-lg mt-2">₹{item.productPrice}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFromWishlist(item.productSlug);
                              }}
                              className="p-3 text-red-400 hover:text-red-600 transition-colors flex-shrink-0 hover:scale-110 transform duration-200"
                              title="Remove from wishlist"
                            >
                              <FaHeart className="text-lg fill-current" />
                            </button>
                          </div>
                          <div className="text-xs text-[#8E5022] hover:text-red-700 font-bold flex items-center gap-2 group-hover:gap-3 transition-all duration-300 relative z-10">
                            <FaSearch className="text-xs" />
                            View Product
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Products Ordered Section */}
          <div className="bg-white/95 backdrop-blur-sm elegant-rounded-3xl shadow-xl border-2 border-[#EDD8B4]/60 overflow-hidden clay-texture">
            <div
              className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-[#F9F7F2]/50 transition-all duration-300"
              onClick={() => toggleSection('orders')}
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 text-[#8E5022] shadow-lg border border-orange-200/50">
                  <FaShoppingBag className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-[#442D1C] serif">Product Orders</h2>
                  <p className="text-sm text-[#8E5022] font-semibold uppercase tracking-[0.15em]">Your Purchases</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#8E5022] font-bold bg-[#EDD8B4]/50 px-3 py-1 rounded-full">
                  {productOrders.length} {productOrders.length === 1 ? 'item' : 'items'}
                </div>
                {expandedSections.orders ? (
                  <FaChevronUp className="text-[#8E5022] text-xl transition-transform duration-300" />
                ) : (
                  <FaChevronDown className="text-[#8E5022] text-xl transition-transform duration-300" />
                )}
              </div>
            </div>

            {expandedSections.orders && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-[#EDD8B4]/30">
                {productOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#8E5022]/60">
                    <div className="p-6 rounded-full bg-[#EDD8B4]/30 mb-4">
                      <FaShoppingBag className="text-4xl opacity-40" />
                    </div>
                    <div className="text-sm font-semibold mb-1">No orders yet</div>
                    <p className="text-xs text-center opacity-70">Your purchased items will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    {productOrders.map((o) => (
                      <Link key={o.id} href={`/profile/orders/${o.id}`} className="block">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F9F7F2] to-[#EDD8B4]/20 border-2 border-[#EDD8B4]/40 hover:border-[#8E5022]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-[#8E5022]/5 rounded-bl-xl"></div>
                          <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-4 flex-1">
                              {o.image && (
                                <img
                                  src={o.image}
                                  alt={o.title}
                                  className="w-16 h-16 object-cover rounded-xl border-2 border-[#EDD8B4] flex-shrink-0 shadow-md"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-[#8E5022] font-bold mb-2 uppercase tracking-wide">Order #{o.id.slice(-8)}</div>
                                <div className="font-bold text-[#442D1C] group-hover:text-[#8E5022] transition-colors text-sm leading-tight serif">{o.title}</div>
                              </div>
                            </div>
                            <div className="text-[#8E5022] font-bold bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-[#EDD8B4] text-sm ml-3">₹{o.amount}</div>
                          </div>
                          <div className="flex items-center justify-between relative z-10">
                            <div className="text-[#652810] text-xs font-semibold bg-[#EDD8B4]/50 px-3 py-1.5 rounded-lg border border-[#EDD8B4]">Qty: {o.qty}</div>
                            <div className="text-xs text-[#8E5022] font-medium">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="mt-4 text-xs text-[#8E5022] hover:text-[#652810] font-bold flex items-center gap-2 group-hover:gap-3 transition-all duration-300 relative z-10">
                            <FaSearch className="text-xs" />
                            View Details
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Workshop Registrations Section */}
          <div className="bg-white/95 backdrop-blur-sm elegant-rounded-3xl shadow-xl border-2 border-[#EDD8B4]/60 overflow-hidden clay-texture">
            <div
              className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-[#F9F7F2]/50 transition-all duration-300"
              onClick={() => toggleSection('workshops')}
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 shadow-lg border border-teal-200/50">
                  <FaCalendarAlt className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-[#442D1C] serif">Workshop</h2>
                  <p className="text-sm text-[#8E5022] font-semibold uppercase tracking-[0.15em]">Registrations</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#8E5022] font-bold bg-[#EDD8B4]/50 px-3 py-1 rounded-full">
                  {registrations.length} {registrations.length === 1 ? 'item' : 'items'}
                </div>
                {expandedSections.workshops ? (
                  <FaChevronUp className="text-[#8E5022] text-xl transition-transform duration-300" />
                ) : (
                  <FaChevronDown className="text-[#8E5022] text-xl transition-transform duration-300" />
                )}
              </div>
            </div>

            {expandedSections.workshops && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-[#EDD8B4]/30">
                {registrations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#8E5022]/60">
                    <div className="p-6 rounded-full bg-[#EDD8B4]/30 mb-4">
                      <FaCalendarAlt className="text-4xl opacity-40" />
                    </div>
                    <div className="text-sm font-semibold mb-1">No workshop registrations</div>
                    <p className="text-xs text-center opacity-70">Your workshop bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    {registrations.map((r) => (
                      <div key={r._id} className="p-5 rounded-2xl bg-gradient-to-br from-[#F9F7F2] to-[#EDD8B4]/20 border-2 border-[#EDD8B4]/40 hover:border-teal-300/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        {/* Subtle background pattern */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-bl-xl"></div>

                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="flex-1">
                            <div className="text-xs text-[#8E5022] font-bold mb-2 uppercase tracking-wide">Registration #{r._id.slice(-8)}</div>
                            <div className="font-bold text-[#442D1C] group-hover:text-teal-700 transition-colors text-sm leading-tight serif">{r.workshopSlug}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                          <div className="text-[#652810] text-xs flex items-center gap-2 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                            <span className="text-[#442D1C]">{r.name}</span>
                          </div>
                          <div className="text-xs text-[#8E5022] font-medium">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Orders Section */}
          <div className="bg-white/95 backdrop-blur-sm elegant-rounded-3xl shadow-xl border-2 border-[#EDD8B4]/60 overflow-hidden clay-texture">
            <div
              className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-[#F9F7F2]/50 transition-all duration-300"
              onClick={() => toggleSection('customOrders')}
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 text-[#C85428] shadow-lg border border-purple-200/50">
                  <FaPaintBrush className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-[#442D1C] serif">Custom Orders</h2>
                  <p className="text-sm text-[#8E5022] font-semibold uppercase tracking-[0.15em]">Bespoke Creations</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#8E5022] font-bold bg-[#EDD8B4]/50 px-3 py-1 rounded-full">
                  {customOrders.length} {customOrders.length === 1 ? 'item' : 'items'}
                </div>
                {expandedSections.customOrders ? (
                  <FaChevronUp className="text-[#8E5022] text-xl transition-transform duration-300" />
                ) : (
                  <FaChevronDown className="text-[#8E5022] text-xl transition-transform duration-300" />
                )}
              </div>
            </div>

            {expandedSections.customOrders && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-[#EDD8B4]/30">
                {customOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#8E5022]/60">
                    <div className="p-6 rounded-full bg-[#EDD8B4]/30 mb-4">
                      <FaPaintBrush className="text-4xl opacity-40" />
                    </div>
                    <div className="text-sm font-semibold mb-1">No custom orders</div>
                    <p className="text-xs text-center opacity-70">Your bespoke pottery requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    {customOrders.map((co) => (
                      <div key={co._id} className="p-5 rounded-2xl bg-gradient-to-br from-[#F9F7F2] to-[#EDD8B4]/20 border-2 border-[#EDD8B4]/40 hover:border-[#C85428]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        {/* Subtle background pattern */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#C85428]/5 rounded-bl-xl"></div>

                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="flex-1">
                            <div className="text-xs text-[#8E5022] font-bold mb-2 uppercase tracking-wide">Request #{co._id.slice(-8)}</div>
                            <div className="font-bold text-[#442D1C] text-sm leading-tight overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{co.description}</div>
                          </div>
                          {typeof co.quotedPrice === "number" && (
                            <div className="text-[#C85428] font-bold bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-[#EDD8B4] text-sm ml-3">₹{co.quotedPrice}</div>
                          )}
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                          <div className={`text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide border-2 ${
                            co.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                            co.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {co.status}
                          </div>
                          <div className="text-xs text-[#8E5022] font-medium">
                            {co.createdAt ? new Date(co.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Address Book Section */}
          <div className="bg-white/95 backdrop-blur-sm elegant-rounded-3xl shadow-xl border-2 border-[#EDD8B4]/60 overflow-hidden clay-texture">
            <div
              className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-[#F9F7F2]/50 transition-all duration-300"
              onClick={() => toggleSection('addresses')}
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-lg border border-blue-200/50">
                  <FaMapMarkerAlt className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-[#442D1C] serif">Address Book</h2>
                  <p className="text-sm text-[#8E5022] font-semibold uppercase tracking-[0.15em]">Shipping Details</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#8E5022] font-bold bg-[#EDD8B4]/50 px-3 py-1 rounded-full">
                  {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}
                </div>
                {expandedSections.addresses ? (
                  <FaChevronUp className="text-[#8E5022] text-xl transition-transform duration-300" />
                ) : (
                  <FaChevronDown className="text-[#8E5022] text-xl transition-transform duration-300" />
                )}
              </div>
            </div>

            {expandedSections.addresses && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-[#EDD8B4]/30">
                {isEditingAddress ? (
                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">Label</label>
                      <input
                        type="text"
                        placeholder="e.g., Home, Work, Office"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-[#F9F7F2] border-2 border-[#EDD8B4]/50 focus:border-[#8E5022] focus:outline-none transition-all duration-300 text-sm font-medium text-[#442D1C] placeholder-[#8E5022]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">Street Address</label>
                      <input
                        type="text"
                        placeholder="Full street address"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-[#F9F7F2] border-2 border-[#EDD8B4]/50 focus:border-[#8E5022] focus:outline-none transition-all duration-300 text-sm font-medium text-[#442D1C] placeholder-[#8E5022]/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">City</label>
                        <input
                          type="text"
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-[#F9F7F2] border-2 border-[#EDD8B4]/50 focus:border-[#8E5022] focus:outline-none transition-all duration-300 text-sm font-medium text-[#442D1C] placeholder-[#8E5022]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">State</label>
                        <input
                          type="text"
                          placeholder="State"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-[#F9F7F2] border-2 border-[#EDD8B4]/50 focus:border-[#8E5022] focus:outline-none transition-all duration-300 text-sm font-medium text-[#442D1C] placeholder-[#8E5022]/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">Zip Code</label>
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={addressForm.zip}
                          onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-[#F9F7F2] border-2 border-[#EDD8B4]/50 focus:border-[#8E5022] focus:outline-none transition-all duration-300 text-sm font-medium text-[#442D1C] placeholder-[#8E5022]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#8E5022] uppercase tracking-wide">Phone</label>
                        <input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-[#F9F7F2] border-2 border-[#EDD8B4]/50 focus:border-[#8E5022] focus:outline-none transition-all duration-300 text-sm font-medium text-[#442D1C] placeholder-[#8E5022]/50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button onClick={handleSaveAddress} disabled={isSavingAddress} className="flex-1 bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white py-3 rounded-xl text-sm font-bold hover:from-[#652810] hover:to-[#8E5022] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                        {isSavingAddress ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
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
                      }} className="px-6 py-3 rounded-xl bg-[#F9F7F2] border-2 border-[#EDD8B4] text-[#8E5022] text-sm font-bold hover:bg-[#EDD8B4]/30 transition-all duration-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    {addresses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-[#8E5022]/60">
                        <div className="p-8 rounded-full bg-[#EDD8B4]/30 mb-6">
                          <FaMapMarkerAlt className="text-5xl opacity-40" />
                        </div>
                        <div className="text-sm font-semibold mb-2">No addresses saved</div>
                        <p className="text-xs text-center opacity-70 mb-6">Add your shipping addresses for faster checkout</p>
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
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white text-sm font-bold hover:from-[#652810] hover:to-[#8E5022] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                        >
                          Add First Address
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address._id} className="p-5 rounded-2xl bg-gradient-to-br from-[#F9F7F2] to-[#EDD8B4]/20 border-2 border-[#EDD8B4]/40 hover:border-blue-300/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                            {/* Subtle background pattern */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-xl"></div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-[#442D1C] text-base">{address.label}</span>
                                {address.isDefault && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white text-xs rounded-full font-bold shadow-md">DEFAULT</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditAddress(address)}
                                  className="p-2 text-[#8E5022] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                                  title="Edit address"
                                >
                                  <FaPen className="text-sm" />
                                </button>
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleDeleteAddress(address._id)}
                                    className="p-2 text-[#8E5022] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                                    title="Delete address"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="text-[#652810] text-sm leading-relaxed font-medium relative z-10">
                              {address.street}<br />
                              {address.city}, {address.state} {address.zip}
                            </div>
                            {address.phone && (
                              <div className="text-[#8E5022] text-sm mt-3 flex items-center gap-2 font-medium relative z-10">
                                <FaPhone className="text-sm" />
                                {address.phone}
                              </div>
                            )}
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(address._id)}
                                className="mt-4 text-sm text-[#8E5022] hover:text-[#652810] font-bold hover:underline transition-colors relative z-10"
                              >
                                Set as default →
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-3 mt-6">
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
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white text-sm font-bold hover:from-[#652810] hover:to-[#8E5022] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                          >
                            <FaMapMarkerAlt className="text-sm" />
                            Add New Address
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
