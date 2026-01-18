"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { validateGST } from '@/lib/gst-validation';
import { FaMinus, FaPlus, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

interface CheckoutItem {
  productSlug: string ;
  qty: number;
  price: number;
  weight: number;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  images: string[];
}

interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
}

interface AddressForm {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export default function CheckoutPage() {
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState<AddressForm>({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: ""
  });
  const [gstIncluded, setGstIncluded] = useState(true); // Tax is always applied
  const [gstError, setGstError] = useState('');
  const { data: session, status } = useSession();

  useEffect(() => {
    const loadCartData = async () => {
      if (status === "loading") return;

      if (!session) {
        // Redirect to login if not authenticated
        window.location.href = '/auth';
        return;
      }

      // Load from API for authenticated users
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const cartData = await response.json();
          setCheckoutItems(cartData.items || []);
        } else {
          console.error("Failed to load cart from API");
          setCheckoutItems([]);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        setCheckoutItems([]);
      }

      // Load user data
      try {
        const userResponse = await fetch("/api/user/profile");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCustomer({
            name: userData.name || "",
            email: (session?.user as any)?.email || "",
            phone: userData.phone || "",
            gstNumber: "",
          });
          setAddresses(userData.addresses || []);
          
          // Set default address as selected
          const defaultAddress = userData.addresses?.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id);
          } else if (userData.addresses?.length > 0) {
            setSelectedAddressId(userData.addresses[0]._id);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadCartData();
  }, [session, status]);

  useEffect(() => {
    if (checkoutItems.length > 0) {
      // Fetch product details for display
      Promise.all(
        checkoutItems.map(item =>
          fetch(`/api/products/${item.productSlug}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`Failed to fetch product ${item.productSlug}`);
              }
              return res.json();
            })
            .catch(err => {
              console.error(`Error fetching product ${item.productSlug}:`, err);
              return null; // Return null for failed requests
            })
        )
      ).then(productsData => {
        // Filter out null values (failed requests)
        const validProducts = productsData.filter(product => product !== null);
        setProducts(validProducts);
      });
    }
  }, [checkoutItems]);

  const updateQuantity = async (productSlug: string, newQty: number) => {
    if (!session) return;
    
    if (newQty <= 0) {
      removeItem(productSlug);
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productSlug, qty: newQty }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCheckoutItems(updatedCart.items || []);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productSlug: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/cart?productSlug=${encodeURIComponent(productSlug)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCheckoutItems(updatedCart.items || []);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalWeight = checkoutItems.reduce((sum, item) => sum + item.weight * item.qty, 0);
  const shippingRate = 50; // per kg
  const shippingAmount = totalWeight * shippingRate;
  const taxRate = 0.18; // Tax rate (formerly GST)
  const taxAmount = taxRate * subtotal; // Tax is always applied
  const totalAmount = Math.round((subtotal + shippingAmount + taxAmount) * 100) / 100; // Round to 2 decimal places

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer details
    if (!customer.name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!customer.email.trim()) {
      alert("Please enter your email address");
      return;
    }
    if (!customer.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      alert("Please enter a valid email address");
      return;
    }

    let addressToUse: Address;

    if (selectedAddressId) {
      const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
      if (!selectedAddress) {
        alert("Selected address not found");
        return;
      }
      addressToUse = selectedAddress;
    } else if (newAddressForm.street && newAddressForm.city && newAddressForm.state && newAddressForm.zip) {
      // Save the new address
      try {
        const saveResponse = await fetch('/api/profile/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAddressForm),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save address');
        }

        const savedAddress = await saveResponse.json();
        addressToUse = savedAddress;

        // Update local addresses state
        setAddresses(prev => [...prev, savedAddress]);
        setSelectedAddressId(savedAddress._id);
        setUseDifferentAddress(false);
      } catch (error) {
        console.error('Error saving address:', error);
        alert('Failed to save address. Please try again.');
        return;
      }
    } else {
      alert("Please select a delivery address or fill in the address form");
      return;
    }

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `ord_${Date.now()}`,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Check if Razorpay is loaded
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        alert('Razorpay is not loaded. Please refresh the page and try again.');
        return;
      }

      // Check if Razorpay key is available
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        alert('Razorpay configuration is missing. Please contact support.');
        console.error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not set');
        return;
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'Basho Pottery',
        description: 'Handcrafted Pottery Purchase',
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items: checkoutItems,
                  customer,
                  address: addressToUse,
                  totalAmount,
                  subtotal,
                  shippingAmount,
                  gstAmount: taxAmount, // Keep gstAmount for backward compatibility
                },
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Show success message with enhanced CSS
              const successModal = document.createElement('div');
              successModal.innerHTML = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4 text-center">
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-2xl font-bold text-[#442D1C] mb-2 serif">Order Placed Successfully!</h2>
                    <p class="text-[#652810] mb-4">Your order has been confirmed and is being processed.</p>
                    <p class="text-sm text-[#8E5022] mb-6">Payment ID: ${response.razorpay_payment_id}</p>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="bg-[#8E5022] text-white px-6 py-2 rounded-xl hover:bg-[#652810] transition-colors">
                      Continue Shopping
                    </button>
                  </div>
                </div>
              `;
              document.body.appendChild(successModal);
              
              // Clear cart if logged in
              if (session) {
                await fetch('/api/cart', { method: 'DELETE' });
              }
              // Clear checkout data
              localStorage.removeItem('checkout');
              // Redirect to home after 3 seconds
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customer.name,
          email: customer.email,
        },
        customer: {
          name: customer.name,
          email: customer.email,
        },
        modal: {
          escape: true,
          confirm_close: true,
          ondismiss: function() {
            // Handle modal dismiss if needed
          },
          animation: true,
          hide: ['contact'],
        },
        config: {
          display: {
            hide: [
              {
                method: 'paylater'
              }
            ],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: '#8E5022',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen py-16" style={{backgroundImage: 'url(/images/i2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#442D1C] mb-8 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Order Summary & Payment</h1>
          <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
            <p className="text-[#442D1C] text-center text-xl">No items in checkout.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16" style={{backgroundImage: 'url(/images/i2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-[#442D1C] mb-10 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Order Summary & Payment</h1>
        <div className="w-16 h-1 bg-[#EDD8B4] mx-auto mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[56px]">
          <div className="bg-gradient-to-br from-white via-[#F9F7F2]/50 to-white/95 elegant-rounded-2xl p-10 shadow-2xl border-2 border-[#EDD8B4] clay-morphism">
            <h2 className="text-2xl font-semibold text-[#442D1C] mb-6">Order Summary</h2>
            {checkoutItems.map((item) => {
              const product = products.find(p => p && p.slug === item.productSlug);
              return (
                <div key={item.productSlug} className="flex items-center mb-6 p-5 bg-[#EDD8B4]/30 elegant-rounded-xl border border-[#8E5022]/20 clay-morphism hover-lift">
                  {product && (
                    <img
                      src={product.images?.[0] || '/images/product1.png'}
                      className="w-24 h-24 object-cover elegant-rounded-lg border-2 border-white shadow-md mr-5"
                      alt={product.title}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#442D1C] text-lg tracking-tight">{product?.title || `Product ${item.productSlug}`}</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.productSlug, item.qty - 1)}
                        className="w-10 h-10 bg-[#8E5022] text-white rounded-full flex items-center justify-center hover:bg-[#652810] transition-all shadow-sm hover:-translate-y-[1px] active:scale-[0.98]"
                      >
                        <FaMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[#652810] font-semibold min-w-[2.5rem] text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQuantity(item.productSlug, item.qty + 1)}
                        className="w-10 h-10 bg-[#8E5022] text-white rounded-full flex items-center justify-center hover:bg-[#652810] transition-all shadow-sm hover:-translate-y-[1px] active:scale-[0.98]"
                      >
                        <FaPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productSlug)}
                        className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all ml-2 shadow-sm hover:-translate-y-[1px] active:scale-[0.98]"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[#8E5022] font-medium text-sm mt-3">₹{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-white via-[#F9F7F2]/50 to-white/95 elegant-rounded-2xl p-10 shadow-2xl border-2 border-[#EDD8B4] clay-morphism">
            <h2 className="text-2xl font-semibold text-[#442D1C] mb-6">Customer Details</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-[#442D1C]/70">Personal Details</h3>
                <div>
                  <label className="block text-[#442D1C] font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={customer.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    className="w-full py-3.5 px-4 border-2 border-[#EDD8B4] elegant-rounded-xl rounded-2xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/40 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-[#442D1C]/70">Contact Details</h3>
                <div>
                  <label className="block text-[#442D1C] font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Email from your login"
                    value={customer.email}
                    readOnly
                    className="w-full py-3.5 px-4 border-2 border-[#EDD8B4] elegant-rounded-xl rounded-2xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/40 transition-all bg-[#EDD8B4]/10 cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#442D1C] font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={customer.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    className="w-full py-3.5 px-4 border-2 border-[#EDD8B4] elegant-rounded-xl rounded-2xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/40 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-[#442D1C]/70">Billing / Invoice</h3>
                <div>
                  <label className="block text-[#442D1C] font-medium mb-2">GST Number <span className="text-sm text-gray-500">(Optional - For Invoice)</span></label>
                  <input
                    type="text"
                    placeholder="Enter GST number for invoice"
                    value={customer.gstNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const gstValue = e.target.value.toUpperCase();
                      setCustomer({ ...customer, gstNumber: gstValue });

                      if (gstValue) {
                        if (validateGST(gstValue)) {
                          setGstError('');
                        } else {
                          setGstError('Invalid GST number format');
                        }
                      } else {
                        setGstError('');
                      }
                    }}
                    className={`w-full py-3.5 px-4 border-2 ${gstError ? 'border-red-500' : 'border-[#EDD8B4]'} elegant-rounded-xl rounded-2xl focus:border-[#8E5022] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/40 transition-all`}
                  />
                  {gstError && (
                    <p className="text-red-500 text-sm mt-1">{gstError}</p>
                  )}
                  {customer.gstNumber && !gstError && (
                    <p className="text-green-600 text-sm mt-1">✓ Valid GST number - Invoice will be sent via email</p>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-[#442D1C] mt-8 mb-4">Delivery Address</h3>
              
              <div className="space-y-4">
                {selectedAddressId && (
                  <div className="p-4 bg-[#EDD8B4]/30 elegant-rounded-xl border border-[#8E5022]/20 clay-morphism">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[#442D1C] mb-2 font-semibold">
                          Delivering to: {addresses.find(addr => addr._id === selectedAddressId)?.label}
                        </p>
                        <p className="text-[#442D1C]">{addresses.find(addr => addr._id === selectedAddressId)?.street}</p>
                        <p className="text-[#442D1C]">{addresses.find(addr => addr._id === selectedAddressId)?.city}, {addresses.find(addr => addr._id === selectedAddressId)?.state} {addresses.find(addr => addr._id === selectedAddressId)?.zip}</p>
                        {addresses.find(addr => addr._id === selectedAddressId)?.phone && (
                          <p className="text-[#442D1C] text-sm mt-1">Phone: {addresses.find(addr => addr._id === selectedAddressId)?.phone}</p>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#8E5022]/20 flex items-center justify-center text-[#8E5022]">
                        <FaMapMarkerAlt />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseDifferentAddress(!useDifferentAddress)}
                      className="mt-3 text-[#8E5022] hover:text-[#652810] underline text-sm"
                    >
                      {useDifferentAddress ? 'Cancel' : 'Change Address'}
                    </button>
                  </div>
                )}

                {(!selectedAddressId || useDifferentAddress) && (
                  <div className="space-y-4">
                    {addresses.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-[#442D1C]">Select Delivery Address</h4>
                          {useDifferentAddress && selectedAddressId && (
                            <button
                              type="button"
                              onClick={() => setUseDifferentAddress(false)}
                              className="text-[#8E5022] hover:text-[#652810] underline text-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {addresses.map((address) => (
                            <label key={address._id} className="flex items-center space-x-3 p-3 bg-[#EDD8B4]/20 rounded-xl border border-[#8E5022]/20 cursor-pointer hover:bg-[#EDD8B4]/30">
                              <input
                                type="radio"
                                name="address"
                                value={address._id}
                                checked={selectedAddressId === address._id}
                                onChange={() => {
                                  setSelectedAddressId(address._id);
                                  setNewAddressForm({
                                    label: "Home",
                                    street: "",
                                    city: "",
                                    state: "",
                                    zip: ""
                                  });
                                  if (useDifferentAddress) setUseDifferentAddress(false);
                                }}
                                className="text-[#8E5022] focus:ring-[#8E5022]"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-[#442D1C]">{address.label}</p>
                                <p className="text-sm text-[#442D1C]">{address.street}, {address.city}, {address.state} {address.zip}</p>
                                {address.phone && <p className="text-sm text-[#442D1C]">Phone: {address.phone}</p>}
                              </div>
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 p-4 bg-[#EDD8B4]/10 rounded-xl border-2 border-dashed border-[#8E5022]/30">
                          <h5 className="text-[#442D1C] font-semibold mb-3">Or enter a new address:</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[#442D1C] font-medium text-sm mb-1">Address Label</label>
                              <input
                                type="text"
                                placeholder="e.g., Home, Work, Office"
                                value={newAddressForm.label}
                                onChange={(e) => {
                                  setNewAddressForm({...newAddressForm, label: e.target.value});
                                  setSelectedAddressId("");
                                }}
                                className="w-full p-2 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[#442D1C] font-medium text-sm mb-1">Street Address</label>
                              <input
                                type="text"
                                placeholder="Enter complete street address"
                                value={newAddressForm.street}
                                onChange={(e) => {
                                  setNewAddressForm({...newAddressForm, street: e.target.value});
                                  setSelectedAddressId("");
                                }}
                                className="w-full p-2 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[#442D1C] font-medium text-sm mb-1">City</label>
                                <input
                                  type="text"
                                  placeholder="Enter city name"
                                  value={newAddressForm.city}
                                  onChange={(e) => {
                                    setNewAddressForm({...newAddressForm, city: e.target.value});
                                    setSelectedAddressId("");
                                  }}
                                  className="w-full p-2 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-[#442D1C] font-medium text-sm mb-1">State</label>
                                <input
                                  type="text"
                                  placeholder="Enter state name"
                                  value={newAddressForm.state}
                                  onChange={(e) => {
                                    setNewAddressForm({...newAddressForm, state: e.target.value});
                                    setSelectedAddressId("");
                                  }}
                                  className="w-full p-2 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[#442D1C] font-medium text-sm mb-1">ZIP Code</label>
                              <input
                                type="text"
                                placeholder="Enter ZIP/postal code"
                                value={newAddressForm.zip}
                                onChange={(e) => {
                                  setNewAddressForm({...newAddressForm, zip: e.target.value});
                                  setSelectedAddressId("");
                                }}
                                className="w-full p-2 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-[#442D1C]">Enter Delivery Address</h4>
                        <input
                          type="text"
                          placeholder="Label (e.g., Home, Work)"
                          value={newAddressForm.label}
                          onChange={(e) => setNewAddressForm({...newAddressForm, label: e.target.value})}
                          className="w-full p-3 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={newAddressForm.street}
                          onChange={(e) => setNewAddressForm({...newAddressForm, street: e.target.value})}
                          className="w-full p-3 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                          required
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddressForm.city}
                            onChange={(e) => setNewAddressForm({...newAddressForm, city: e.target.value})}
                            className="w-full p-3 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                            required
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={newAddressForm.state}
                            onChange={(e) => setNewAddressForm({...newAddressForm, state: e.target.value})}
                            className="w-full p-3 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                            required
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={newAddressForm.zip}
                          onChange={(e) => setNewAddressForm({...newAddressForm, zip: e.target.value})}
                          className="w-full p-3 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#EDD8B4]/30 elegant-rounded-xl border border-[#8E5022]/20 clay-morphism">
                <p className="text-[#442D1C] mb-2 font-medium">Subtotal: <span className="font-bold">₹{subtotal.toFixed(2)}</span></p>
                <p className="text-[#442D1C] mb-2 font-medium">Shipping (₹{shippingRate.toFixed(2)}/kg): <span className="font-bold">₹{shippingAmount.toFixed(2)}</span></p>
                <p className="text-[#442D1C] mb-2 font-medium">Tax (18%): <span className="font-bold">₹{taxAmount.toFixed(2)}</span></p>
                <p className="text-2xl font-bold text-[#8E5022] mt-4">Total: ₹{totalAmount.toFixed(2)}</p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8E5022] text-white py-4 elegant-rounded-xl font-semibold text-lg hover:bg-[#652810] transition-colors shadow-lg hover-lift"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
    </div>
  </div>
);
}
