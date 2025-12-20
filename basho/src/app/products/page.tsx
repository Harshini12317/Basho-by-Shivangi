"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  title: string;
  slug: string;
  images: string[];
  price: number;
  material: string;
  category: string;
}

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filteredProducts = filter === "all" ? products : products.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#442D1C] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-[#442D1C] mb-6">
            Our Creations
          </h1>
          <p className="text-xl md:text-2xl text-[#652810] leading-relaxed italic bg-white/60 rounded-2xl p-6 shadow-lg border-2 border-[#EDD8B4]/50 max-w-4xl mx-auto">
            Each piece tells a story, shaped by hand, fired with passion
          </p>
        </div>

        {/* Main Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/90 rounded-2xl p-4 shadow-lg border-2 border-[#EDD8B4]">
            <div className="flex gap-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  filter === "all"
                    ? "bg-[#8E5022] text-white shadow-xl"
                    : "text-[#442D1C] hover:bg-[#EDD8B4]/50"
                }`}
              >
                Ready-made Pottery
              </button>
              <button
                onClick={() => setFilter("custom-gallery")}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  filter === "custom-gallery"
                    ? "bg-[#8E5022] text-white shadow-xl"
                    : "text-[#442D1C] hover:bg-[#EDD8B4]/50"
                }`}
              >
                Custom Orders Gallery
              </button>
            </div>
          </div>
        </div>

        {/* Content based on filter */}
        {filter === "custom-gallery" ? (
          <div className="space-y-8">
            {/* Custom Orders Gallery */}
            <div className="bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4] mb-12">
              <h2 className="text-4xl font-bold text-[#442D1C] mb-8 text-center">Previous Custom Creations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Mock custom orders data - in real app, fetch from API */}
                {[
                  {
                    id: 1,
                    name: "Wedding Vase",
                    description: "Custom floral vase for wedding ceremony",
                    images: [
                      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center",
                      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&crop=center"
                    ]
                  },
                  {
                    id: 2,
                    name: "Coffee Mug Set",
                    description: "Personalized mugs for office team",
                    images: [
                      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=200&fit=crop&crop=center",
                      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop&crop=center"
                    ]
                  },
                  {
                    id: 3,
                    name: "Dinnerware Set",
                    description: "Complete dinner set for family of 4",
                    images: [
                      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop&crop=center",
                      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center"
                    ]
                  }
                ].map((order) => (
                  <div key={order.id} className="bg-[#F5E6C3]/50 rounded-xl p-6 border border-[#8E5022]/20 hover:shadow-lg transition-shadow">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {order.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          className="w-full h-24 object-cover rounded-lg border-2 border-white"
                          alt={`${order.name} - ${index + 1}`}
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold text-[#442D1C] mb-2 text-lg">{order.name}</h3>
                    <p className="text-[#652810] text-sm">{order.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Order Form */}
            <div className="bg-white/90 rounded-3xl p-12 shadow-2xl border-2 border-[#EDD8B4] organic-shadow clay-texture">
              <h2 className="text-4xl font-bold text-[#442D1C] mb-10 text-center">Request Your Custom Piece</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                alert("Custom order request submitted!");
                // Send emails
                // sendConfirmationEmails();
              }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[#442D1C] font-semibold text-lg">Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors bg-white/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#442D1C] font-semibold text-lg">Email Address</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
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
                    className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors bg-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#442D1C] font-semibold text-lg">Describe Your Vision</label>
                  <textarea
                    placeholder="Tell us about your dream pottery piece. Include details like size, shape, color preferences, intended use, and any special features..."
                    className="w-full p-4 border-2 border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors h-40 resize-none bg-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#442D1C] font-semibold text-lg">Additional Notes (Optional)</label>
                  <textarea
                    placeholder="Any specific requirements, timeline preferences, or other details..."
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
                    className="w-full p-4 border-2 border-dashed border-[#EDD8B4] rounded-2xl focus:border-[#8E5022] focus:outline-none transition-colors file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8E5022] file:text-white hover:file:bg-[#652810] bg-white/50"
                  />
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
        ) : (
          /* Ready-made Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => (
              <Link href={`/products/${p.slug}`} key={p._id}>
                <div className="group bg-white/90 rounded-2xl shadow-lg border-2 border-[#EDD8B4] overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Single main image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={p.images?.[0]}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={p.title}
                    />
                    <div className="absolute top-4 right-4 bg-[#8E5022] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {p.category === "ready-made" ? "Ready-made" : "Custom"}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-gradient-to-br from-white to-[#EDD8B4]/30">
                    <h2 className="font-bold text-xl text-[#442D1C] mb-3 leading-tight">
                      {p.title}
                    </h2>
                    <p className="text-[#652810] mb-4 font-medium italic">{p.material}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-[#8E5022]">₹{p.price}</p>
                      <div className="w-10 h-10 bg-[#442D1C] rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#652810] transition-colors">
                        <span className="text-white text-lg">→</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
                          if (favorites.includes(p._id)) {
                            const newFavorites = favorites.filter((id: string) => id !== p._id);
                            localStorage.setItem("favorites", JSON.stringify(newFavorites));
                          } else {
                            favorites.push(p._id);
                            localStorage.setItem("favorites", JSON.stringify(favorites));
                          }
                        }}
                        className="w-full bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white py-2 px-4 rounded-lg font-semibold hover:from-[#8E5022] hover:to-[#652810] transition-colors"
                      >
                        ♥ Fav
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && filter !== "custom-gallery" && (
          <div className="text-center py-16">
            <div className="bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4]">
              <h3 className="text-[#442D1C] text-2xl font-bold mb-4">No products found</h3>
              <p className="text-[#652810] text-lg">Try exploring our other handcrafted creations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}