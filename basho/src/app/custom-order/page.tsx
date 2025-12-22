"use client";
import { useState } from "react";

export default function CustomOrderPage() {
  const [customOrderForm, setCustomOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    notes: "",
    referenceImages: [] as string[],
  });

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

  return (
    <div className="min-h-screen py-16 grain-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* How Custom Orders Work Flowchart */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold serif text-[#442D1C] mb-12 text-center">How Custom Orders Work</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#8E5022] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                1
              </div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">Send Request</h3>
              <p className="text-[#652810] text-sm max-w-32">Fill out the form below with your requirements</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-[#8E5022] text-3xl">→</div>
            <div className="md:hidden text-[#8E5022] text-3xl rotate-90">↓</div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#C85428] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                2
              </div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">We Interact</h3>
              <p className="text-[#652810] text-sm max-w-32">Our artisans discuss details and provide pricing</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-[#8E5022] text-3xl">→</div>
            <div className="md:hidden text-[#8E5022] text-3xl rotate-90">↓</div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#EDD8B4] rounded-full flex items-center justify-center text-[#442D1C] text-2xl font-bold mb-4 shadow-lg border-2 border-[#8E5022]">
                3
              </div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">You Agree</h3>
              <p className="text-[#652810] text-sm max-w-32">Approve the quote and finalize details</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-[#8E5022] text-3xl">→</div>
            <div className="md:hidden text-[#8E5022] text-3xl rotate-90">↓</div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#8E5022] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                4
              </div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">Payment</h3>
              <p className="text-[#652810] text-sm max-w-32">Secure payment through our checkout</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-[#8E5022] text-3xl">→</div>
            <div className="md:hidden text-[#8E5022] text-3xl rotate-90">↓</div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#C85428] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                5
              </div>
              <h3 className="font-semibold serif text-[#442D1C] text-lg mb-2">Order Placed</h3>
              <p className="text-[#652810] text-sm max-w-32">Your custom piece begins creation</p>
            </div>
          </div>
        </div>

        {/* Custom Orders Gallery */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold serif text-[#442D1C] mb-8 text-center">Previous Custom Creations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mock custom orders data - in real app, fetch from API */}
            {[
              {
                id: 1,
                name: "Wedding Vase",
                description: "Custom floral vase for wedding ceremony",
                images: [
                  "/images/product1.png",
                  "/images/product2.png"
                ]
              },
              {
                id: 2,
                name: "Coffee Mug Set",
                description: "Personalized mugs for office team",
                images: [
                  "/images/product1.png",
                  "/images/product2.png"
                ]
              },
              {
                id: 3,
                name: "Dinnerware Set",
                description: "Complete dinner set for family of 4",
                images: [
                  "/images/product1.png",
                  "/images/product2.png"
                ]
              }
            ].map((order) => (
              <div key={order.id} className="card-soft elegant-rounded-2xl p-6 border border-[#8E5022]/20 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {order.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      className="w-full h-32 md:h-40 object-cover elegant-rounded-lg border-2 border-white"
                      alt={`${order.name} - ${index + 1}`}
                    />
                  ))}
                </div>
                <h3 className="font-semibold text-[#442D1C] mb-2 text-lg serif">{order.name}</h3>
                <p className="text-[#652810] text-sm">{order.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Order Form */}
        <div className="bg-white/90 elegant-rounded-3xl p-12 shadow-2xl border-2 border-[#EDD8B4] organic-shadow clay-texture clay-morphism">
          <h2 className="text-4xl font-bold serif text-[#442D1C] mb-10 text-center">Request Your Custom Piece</h2>
          <form onSubmit={handleCustomOrderSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[#442D1C] font-semibold text-lg serif">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={customOrderForm.name}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, name: e.target.value })}
                  className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors form-bg"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[#442D1C] font-semibold text-lg serif">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customOrderForm.email}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, email: e.target.value })}
                    className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors form-bg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[#442D1C] font-semibold text-lg serif">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={customOrderForm.phone}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, phone: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors form-bg"
                required
              />
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-[#442D1C] font-semibold text-lg serif">Describe Your Vision</label>
              <textarea
                placeholder="Tell us about your dream pottery piece. Include details like size, shape, color preferences, intended use, and any special features..."
                value={customOrderForm.description}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, description: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors h-40 resize-none form-bg"
                required
              />
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-[#442D1C] font-semibold text-lg serif">Additional Notes (Optional)</label>
              <textarea
                placeholder="Any specific requirements, timeline preferences, or other details..."
                value={customOrderForm.notes}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, notes: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] elegant-rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors h-32 resize-none form-bg"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[#442D1C] font-semibold text-lg serif">Reference Images (Optional)</label>
              <p className="text-[#652810] text-sm">Upload photos of pieces you like or sketches of your vision</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    const urls = Array.from(files).map(file => URL.createObjectURL(file));
                    setCustomOrderForm({ ...customOrderForm, referenceImages: urls });
                  }
                }}
                className="w-full p-4 border-2 border-dashed border-[#EDD8B4] elegant-rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors file:mr-4 file:py-3 file:px-6 file:elegant-rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8E5022] file:text-white hover:file:bg-[#652810] form-bg"
              />
              {customOrderForm.referenceImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {customOrderForm.referenceImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      className="w-24 h-24 object-cover elegant-rounded-xl border-2 border-[#EDD8B4]"
                      alt={`Reference ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center pt-8">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#8E5022] to-[#C85428] hover:from-[#652810] hover:to-[#8E5022] text-white py-6 px-12 elegant-rounded-3xl font-bold text-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-2xl hover:shadow-3xl organic-button hover-lift"
              >
                Submit Custom Order Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}