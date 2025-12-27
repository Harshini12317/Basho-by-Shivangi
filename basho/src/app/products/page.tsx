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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [typedText, setTypedText] = useState("");
  const fullText = "Our Creations";

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });

    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavorites);

    // Typewriter effect
    let index = 0;
    const typeWriter = () => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
        setTimeout(typeWriter, 150);
      }
    };
    typeWriter();
  }, []);

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
          <h1 className="text-5xl md:text-7xl font-bold text-[#442D1C] mb-6 serif">
            {typedText}
            <span className="typewriter-cursor">|</span>
          </h1>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
              <Link href={`/products/${p.slug}`} key={p._id}>
                <div className="group bg-white/90 elegant-rounded-xl shadow-lg border-2 border-[#EDD8B4] overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift">
                  {/* Image container with hover effect */}
                  <div className="relative overflow-hidden">
                    <img
                      src={p.images?.[0] || '/images/placeholder.png'}
                      className="w-full h-48 object-cover transition-opacity duration-500 group-hover:opacity-0"
                      alt={p.title}
                    />
                    <img
                      src={p.images?.[1] || p.images?.[0] || '/images/placeholder.png'}
                      className="absolute top-0 left-0 w-full h-48 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      alt={p.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4 bg-gradient-to-br from-white to-[#EDD8B4]/30 relative">
                    <h2 className="font-bold text-lg text-[#442D1C] mb-2 leading-tight serif">
                      {p.title}
                    </h2>
                    <p className="text-[#652810] mb-3 font-medium italic text-sm">{p.material}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-[#8E5022]">₹{p.price}</p>
                      {/* Favorite Heart Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const newFavorites = favorites.includes(p._id)
                            ? favorites.filter(id => id !== p._id)
                            : [...favorites, p._id];
                          setFavorites(newFavorites);
                          localStorage.setItem("favorites", JSON.stringify(newFavorites));
                        }}
                        className="w-10 h-10 bg-white/95 backdrop-blur-sm elegant-rounded-full flex items-center justify-center shadow-lg hover:bg-[#EDD8B4]/30 hover:shadow-xl transition-all duration-300 hover:scale-110 border border-[#EDD8B4]/50 hover:border-[#8E5022]/30"
                      >
                        <span className={`text-xl transition-colors duration-300 ${favorites.includes(p._id) ? 'text-[#442D1C]' : 'text-gray-400'} hover:text-[#652810]`}>
                          {favorites.includes(p._id) ? '♥' : '♡'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        {products.length === 0 && (
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