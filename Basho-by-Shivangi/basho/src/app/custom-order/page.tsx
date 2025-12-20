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
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-[#442D1C] mb-6">
            Custom Creation
          </h1>
          <p className="text-xl md:text-2xl text-[#652810] leading-relaxed italic bg-white/60 rounded-2xl p-6 shadow-lg border-2 border-[#EDD8B4]/50 max-w-4xl mx-auto">
            Bring your vision to life with our handcrafted pottery
          </p>
        </div>

        <div className="bg-white/90 rounded-3xl p-12 shadow-2xl border-2 border-[#EDD8B4] organic-shadow clay-texture">
          <h2 className="text-4xl font-bold text-[#442D1C] mb-10 text-center">Request Your Custom Piece</h2>
          <form onSubmit={handleCustomOrderSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[#442D1C] font-semibold text-lg">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={customOrderForm.name}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, name: e.target.value })}
                  className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors bg-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[#442D1C] font-semibold text-lg">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customOrderForm.email}
                  onChange={(e) => setCustomOrderForm({ ...customOrderForm, email: e.target.value })}
                  className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors bg-white/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[#442D1C] font-semibold text-lg">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={customOrderForm.phone}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, phone: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors bg-white/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[#442D1C] font-semibold text-lg">Describe Your Vision</label>
              <textarea
                placeholder="Tell us about your dream pottery piece. Include details like size, shape, color preferences, intended use, and any special features..."
                value={customOrderForm.description}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, description: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors h-40 resize-none bg-white/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[#442D1C] font-semibold text-lg">Additional Notes (Optional)</label>
              <textarea
                placeholder="Any specific requirements, timeline preferences, or other details..."
                value={customOrderForm.notes}
                onChange={(e) => setCustomOrderForm({ ...customOrderForm, notes: e.target.value })}
                className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors h-32 resize-none bg-white/50"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[#442D1C] font-semibold text-lg">Reference Images (Optional)</label>
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
                className="w-full p-4 border-2 border-dashed border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8E5022] file:text-white hover:file:bg-[#652810] bg-white/50"
              />
              {customOrderForm.referenceImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {customOrderForm.referenceImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      className="w-24 h-24 object-cover rounded-xl border-2 border-[#EDD8B4]"
                      alt={`Reference ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center pt-8">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#8E5022] to-[#C85428] hover:from-[#652810] hover:to-[#8E5022] text-white py-6 px-12 rounded-3xl font-bold text-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-2xl hover:shadow-3xl organic-button"
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