"use client";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  title: string;
  description: string;
  images: string[];
  material: string;
  care: string;
  price: number;
  weight: number;
  category: string;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
      fetch(`/api/products/${resolvedParams.slug}`)
        .then((res) => res.json())
        .then(setProduct);
    });
  }, [params]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#442D1C] text-xl">Loading...</div>
      </div>
    );
  }

  const addToCheckout = () => {
    const checkoutData = [
      {
        productSlug: slug,
        qty: 1,
        price: product!.price,
        weight: product!.weight,
      },
    ];

    localStorage.setItem("checkout", JSON.stringify(checkoutData));
    window.location.href = "/checkout";
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Image Gallery with better alignment */}
          <div className="space-y-8">
            <div className="relative">
              {/* Main image with imperfect shape */}
              <div className="relative overflow-hidden bg-[#EDD8B4]/30 backdrop-blur-sm shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 imperfect-shape-1">
                <img
                  src={product.images[selectedImage]}
                  className="w-full h-96 object-cover transition-all duration-700 hover:scale-105"
                  alt={product.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                {/* Decorative imperfect shapes */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-[#8E5022]/20 rounded-full"></div>
                <div className="absolute bottom-6 right-6 w-12 h-12 bg-[#C85428]/10 rounded-full"></div>
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex space-x-6 overflow-x-auto pb-6 px-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden border-4 transition-all duration-300 transform hover:scale-110 shadow-lg ${
                      selectedImage === index
                        ? "border-[#8E5022] shadow-xl rotate-6"
                        : "border-[#EDD8B4] hover:border-[#C85428] -rotate-3"
                    } ${index % 4 === 0 ? 'imperfect-shape-1' :
                        index % 4 === 1 ? 'imperfect-shape-2' :
                        index % 4 === 2 ? 'imperfect-shape-3' : 'imperfect-shape-4'}`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`${product.title} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info with improved alignment and imperfect shapes */}
          <div className="space-y-10">
            {/* Title Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-10 organic-shadow transform -rotate-1 hover:rotate-0 transition-transform duration-500 clay-texture relative imperfect-shape-1">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#C85428]/20 rounded-full"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#652810]/15 rounded-full"></div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#442D1C] mb-6 leading-tight">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="bg-[#8E5022] text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg transform rotate-3">
                  {product.category === "ready-made" ? "Ready-made" : "Custom Product"}
                </span>
                <span className="text-[#652810] font-semibold text-xl italic bg-[#EDD8B4]/50 px-4 py-2 rounded-2xl">
                  {product.material}
                </span>
              </div>
              <div className="text-6xl font-bold text-[#8E5022] transform -rotate-2">₹{product.price}</div>
            </div>

            {/* Story Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 organic-shadow transform rotate-1 hover:rotate-0 transition-transform duration-500 clay-texture imperfect-shape-2">
              <h3 className="text-2xl font-bold text-[#442D1C] mb-6">The Story</h3>
              <p className="text-[#652810] leading-relaxed text-lg italic">{product.description}</p>
            </div>

            {/* Craft Details Card */}
            <div className="bg-gradient-to-br from-[#EDD8B4] to-[#C85428]/20 rounded-3xl p-8 organic-shadow transform -rotate-1 hover:rotate-0 transition-transform duration-500 clay-texture imperfect-shape-3">
              <h3 className="text-2xl font-bold text-[#442D1C] mb-8">Craft Details</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white/70 rounded-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform shadow-lg">
                  <div className="text-[#8E5022] font-semibold mb-2 text-lg">Material</div>
                  <div className="text-[#442D1C] font-bold text-xl">{product.material}</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 transform -rotate-2 hover:rotate-0 transition-transform shadow-lg">
                  <div className="text-[#8E5022] font-semibold mb-2 text-lg">Weight</div>
                  <div className="text-[#442D1C] font-bold text-xl">{product.weight} kg</div>
                </div>
              </div>
            </div>

            {/* Care Instructions Card */}
            <div className="bg-white/75 backdrop-blur-sm rounded-3xl p-8 organic-shadow transform rotate-1 hover:rotate-0 transition-transform duration-500 clay-texture imperfect-shape-4">
              <h3 className="text-2xl font-bold text-[#442D1C] mb-6">Care Instructions</h3>
              <p className="text-[#652810] leading-relaxed italic text-lg">{product.care}</p>
            </div>

            {/* CTA Button with imperfect shape */}
            <div className="relative text-center">
              <button
                onClick={addToCheckout}
                className="bg-gradient-to-r from-[#8E5022] to-[#C85428] hover:from-[#652810] hover:to-[#8E5022] text-white py-8 px-10 rounded-3xl font-bold text-3xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-2xl hover:shadow-3xl relative z-10 organic-button imperfect-shape-1"
              >
                Add to Cart - ₹{product.price}
              </button>
              {/* Decorative background shapes */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-[#C85428]/20 rounded-full -z-10"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-[#652810]/15 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
