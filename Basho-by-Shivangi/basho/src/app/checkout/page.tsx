"use client";
import { useEffect, useState } from "react";

interface CheckoutItem {
  productSlug: string;
  qty: number;
  price: number;
  weight: number;
}

interface Product {
  _id: string;
  title: string;
  images: string[];
}

interface CustomOrder {
  _id: string;
  name: string;
  description: string;
  referenceImages: string[];
  status: string;
  quotedPrice?: number;
}

export default function CheckoutPage() {
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>('products');
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
  });
  const [customOrderForm, setCustomOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    notes: "",
    referenceImages: [] as string[],
  });
  const [gstIncluded, setGstIncluded] = useState(false);

  useEffect(() => {
    const checkoutData = localStorage.getItem("checkout");
    if (checkoutData) {
      setCheckoutItems(JSON.parse(checkoutData));
    }
  }, []);

  useEffect(() => {
    if (checkoutItems.length > 0) {
      // Fetch product details for display
      Promise.all(
        checkoutItems.map(item =>
          fetch(`/api/products/${item.productSlug}`).then(res => res.json())
        )
      ).then(setProducts);
    }
  }, [checkoutItems]);

  useEffect(() => {
    // Fetch custom orders for gallery
    fetch("/api/custom-orders")
      .then(res => res.json())
      .then(setCustomOrders);
  }, []);

  const sendConfirmationEmails = () => {
    // Placeholder for sending emails
    // In a real app, use a service like SendGrid, EmailJS, or backend API
    alert('Confirmation emails sent to customer and company!');
    // Example: fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to: customer.email, subject: 'Order Confirmation' }) });
  };

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalWeight = checkoutItems.reduce((sum, item) => sum + item.weight * item.qty, 0);
  const shippingRate = 50; // per kg
  const shippingAmount = totalWeight * shippingRate;
  const gstRate = 0.18;
  const gstAmount = gstIncluded ? subtotal * gstRate : 0;
  const totalAmount = subtotal + shippingAmount + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'products') {
      // Integrate Razorpay
      const options = {
        key: 'rzp_test_your_test_key_here', // Replace with actual test key
        amount: totalAmount * 100, // Amount in paisa
        currency: 'INR',
        name: 'Basho Pottery',
        description: 'Handcrafted Pottery Purchase',
        handler: function (response: any) {
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          // Send confirmation emails
          sendConfirmationEmails();
        },
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: {
          color: '#8E5022',
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Handle custom order submission
      handleCustomOrderSubmit(e);
    }
  };

  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customOrderForm),
      });

      if (response.ok) {
        alert("Custom order request submitted! We'll get back to you soon.");
        sendConfirmationEmails();
        setCustomOrderForm({
          name: "",
          email: "",
          phone: "",
          description: "",
          notes: "",
          referenceImages: [],
        });
      } else {
        alert("Failed to submit custom order. Please try again.");
      }
    } catch (error) {
      alert("Error submitting custom order. Please try again.");
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold ${activeTab === 'products' ? 'border-b-2 border-[#8E5022] text-[#8E5022]' : 'text-gray-600'}`}
          >
            Ready-made Products
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-3 font-semibold ${activeTab === 'custom' ? 'border-b-2 border-[#8E5022] text-[#8E5022]' : 'text-gray-600'}`}
          >
            Custom Orders
          </button>
        </div>
        <p className="p-10">No items in checkout.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-[#442D1C] text-center">Checkout</h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 rounded-2xl p-2 shadow-lg border-2 border-[#EDD8B4]">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                activeTab === 'products'
                  ? 'bg-[#8E5022] text-white shadow-xl'
                  : 'text-[#442D1C] hover:bg-[#EDD8B4]/50'
              }`}
            >
              Ready-made Products
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                activeTab === 'custom'
                  ? 'bg-[#8E5022] text-white shadow-xl'
                  : 'text-[#442D1C] hover:bg-[#EDD8B4]/50'
              }`}
            >
              Custom Orders
            </button>
          </div>
        </div>

      {activeTab === 'products' ? (
        /* Products Checkout Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4]">
            <h2 className="text-2xl font-semibold mb-6 text-[#442D1C]">Order Summary</h2>
            {checkoutItems.map((item, index) => {
              const product = products[index];
              return (
                <div key={item.productSlug} className="flex items-center mb-6 p-4 bg-[#EDD8B4]/30 rounded-xl border border-[#8E5022]/20">
                  {product && (
                    <img
                      src={product.images[0]}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md mr-4"
                      alt={product.title}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#442D1C] text-lg">{product?.title}</h3>
                    <p className="text-[#652810]">Qty: {item.qty}</p>
                    <p className="text-[#8E5022] font-bold">₹{item.price} each</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4]">
            <h2 className="text-2xl font-semibold mb-6 text-[#442D1C]">Customer Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                required
              />
              <input
                type="text"
                placeholder="GST Number (Optional)"
                value={customer.gstNumber}
                onChange={(e) => {
                  setCustomer({ ...customer, gstNumber: e.target.value });
                  setGstIncluded(!!e.target.value);
                }}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
              />

              <div className="p-6 bg-[#EDD8B4]/30 rounded-xl border border-[#8E5022]/20">
                <p className="text-[#442D1C] mb-2">Subtotal: <span className="font-bold">₹{subtotal}</span></p>
                <p className="text-[#442D1C] mb-2">Shipping (₹{shippingRate}/kg): <span className="font-bold">₹{shippingAmount}</span></p>
                {gstIncluded && <p className="text-[#442D1C] mb-2">GST (18%): <span className="font-bold">₹{gstAmount}</span></p>}
                <p className="text-2xl font-bold text-[#8E5022] mt-4">Total: ₹{totalAmount}</p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8E5022] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#652810] transition-colors shadow-lg"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Custom Orders Tab */
        <div className="space-y-8">
          {/* Previous Custom Orders Gallery */}
          <div className="bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4]">
            <h2 className="text-3xl font-semibold mb-8 text-[#442D1C] text-center">Our Previous Custom Creations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customOrders.filter(order => order.status === 'completed').map((order) => (
                <div key={order._id} className="bg-[#EDD8B4]/30 rounded-xl p-6 border border-[#8E5022]/20 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {order.referenceImages.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        className="w-full h-24 object-cover rounded-lg border-2 border-white"
                        alt={`Custom order ${order._id} - ${index + 1}`}
                      />
                    ))}
                  </div>
                  <h3 className="font-semibold text-[#442D1C] mb-2">{order.name}</h3>
                  <p className="text-[#652810] text-sm mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.description}</p>
                  <span className="text-xs bg-[#C85428] text-white px-3 py-1 rounded-full">Completed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Order Form */}
          <div className="bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4]">
            <h2 className="text-3xl font-semibold mb-8 text-[#442D1C] text-center">Request Your Custom Creation</h2>
            <form onSubmit={handleCustomOrderSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customOrderForm.name}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, name: e.target.value })}
                  className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customOrderForm.email}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, email: e.target.value })}
                  className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                  required
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number"
                value={customOrderForm.phone}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, phone: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                required
              />

              <textarea
                placeholder="Describe your custom pottery requirements (size, shape, design, quantity, etc.)"
                value={customOrderForm.description}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, description: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors h-32 resize-none"
                required
              />

              <textarea
                placeholder="Additional notes or special requirements (optional)"
                value={customOrderForm.notes}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, notes: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors h-24 resize-none"
              />

              <div className="text-center">
                <p className="text-[#652810] mb-4">Upload reference images (optional)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    // For now, just show placeholder - in real app, upload to cloud storage
                    const files = e.target.files;
                    if (files) {
                      const urls = Array.from(files).map(file => URL.createObjectURL(file));
                      setCustomOrderForm({ ...customOrderForm, referenceImages: urls });
                    }
                  }}
                  className="w-full p-4 border-2 border-dashed border-[#EDD8B4] rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8E5022] file:text-white hover:file:bg-[#652810]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8E5022] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#652810] transition-colors shadow-lg"
              >
                Submit Custom Order Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
);
}