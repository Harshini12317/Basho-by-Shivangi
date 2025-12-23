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
  slug: string;
  images: string[];
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
  const [gstIncluded, setGstIncluded] = useState(false);

  useEffect(() => {
    const checkoutData = localStorage.getItem("checkout");
    if (checkoutData) {
      try {
        setCheckoutItems(JSON.parse(checkoutData));
      } catch (error) {
        console.error("Error parsing checkout data from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("checkout");
      }
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          receipt: `order_${Date.now()}`,
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
                  totalAmount,
                  subtotal,
                  shippingAmount,
                  gstAmount,
                },
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
              // Clear checkout data
              localStorage.removeItem('checkout');
              // Send confirmation emails
              sendConfirmationEmails();
              // Redirect to success page or home
              window.location.href = '/';
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
          contact: customer.phone,
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
      <div className="min-h-screen py-16 grain-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold serif text-[#442D1C] mb-8 text-center organic-float">Checkout</h1>
          <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
            <p className="text-[#442D1C] text-center serif text-xl">No items in checkout.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 paper-texture">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold serif text-[#442D1C] mb-8 text-center organic-float">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
            <h2 className="text-2xl font-semibold serif text-[#442D1C] mb-6">Order Summary</h2>
            {checkoutItems.map((item) => {
              const product = products.find(p => p && p.slug === item.productSlug);
              return (
                <div key={item.productSlug} className="flex items-center mb-6 p-4 bg-[#EDD8B4]/30 elegant-rounded-xl border border-[#8E5022]/20 clay-morphism hover-lift">
                  {product && (
                    <img
                      src="/images/product1.png"
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

          <div className="bg-white/90 elegant-rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] clay-morphism">
            <h2 className="text-2xl font-semibold serif text-[#442D1C] mb-6">Customer Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Name"
                value={customer.name}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setCustomer({ ...customer, name: e.target.value })
}

                className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setCustomer({ ...customer, email: e.target.value })
}
                className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={customer.phone}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setCustomer({ ...customer, phone: e.target.value })
}
  
                className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
                required
              />
              <input
                type="text"
                placeholder="GST Number (Optional)"
                value={customer.gstNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCustomer({ ...customer, gstNumber: e.target.value });
                  setGstIncluded(!!e.target.value);
                }}
                className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-xl focus:border-[#8E5022] focus:outline-none transition-colors"
              />

              <div className="p-6 bg-[#EDD8B4]/30 elegant-rounded-xl border border-[#8E5022]/20 clay-morphism">
                <p className="text-[#442D1C] mb-2 serif">Subtotal: <span className="font-bold">₹{subtotal}</span></p>
                <p className="text-[#442D1C] mb-2 serif">Shipping (₹{shippingRate}/kg): <span className="font-bold">₹{shippingAmount}</span></p>
                {gstIncluded && <p className="text-[#442D1C] mb-2 serif">GST (18%): <span className="font-bold">₹{gstAmount}</span></p>}
                <p className="text-2xl font-bold text-[#8E5022] mt-4 serif">Total: ₹{totalAmount}</p>
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