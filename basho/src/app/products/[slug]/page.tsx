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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Product Card */}
        <div className="bg-white/90 backdrop-blur-sm elegant-rounded-xl shadow-2xl border-2 border-[#EDD8B4] overflow-hidden clay-texture">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative p-8 lg:p-12">
              <div className="relative overflow-hidden bg-[#EDD8B4]/30 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform duration-500 elegant-rounded-xl">
                <img
                  src={product.images?.[selectedImage] || '/images/placeholder.png'}
                  className="w-full h-80 lg:h-96 object-cover transition-all duration-700 hover:scale-105"
                  alt={product.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-6 h-6 bg-[#8E5022]/20 elegant-rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-[#C85428]/10 elegant-rounded-full"></div>
              </div>

              {/* Thumbnails for all product images */}
              <div className="flex space-x-4 overflow-x-auto pb-4 px-2 mt-6">
                {product.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 elegant-rounded-lg overflow-hidden border-3 transition-all duration-300 transform hover:scale-110 shadow-md ${
                      selectedImage === index
                        ? "border-[#8E5022] shadow-lg"
                        : "border-[#EDD8B4] hover:border-[#C85428]"
                    }`}
                  >
                    <img
                      src={image}
                      className="w-full h-full object-cover"
                      alt={`${product.title} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="p-8 lg:p-12 space-y-6">
              {/* Title and Basic Info */}
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-[#442D1C] leading-tight serif">
                  {product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[#652810] font-semibold text-base italic bg-[#EDD8B4]/50 px-3 py-1 elegant-rounded-lg">
                    {product.material}
                  </span>
                </div>
                <div className="text-3xl font-bold text-[#8E5022]">₹{product.price}</div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-[#442D1C] mb-2 serif">The Story</h3>
                  <p className="text-[#652810] leading-relaxed text-sm italic">{product.description}</p>
                </div>

                {/* Craft Details */}
                <div>
                  <h3 className="text-lg font-semibold text-[#442D1C] mb-3 serif">Craft Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#EDD8B4]/30 elegant-rounded-lg p-3">
                      <div className="text-[#8E5022] font-semibold text-xs mb-1">Material</div>
                      <div className="text-[#442D1C] font-bold text-sm">{product.material}</div>
                    </div>
                    <div className="bg-[#EDD8B4]/30 elegant-rounded-lg p-3">
                      <div className="text-[#8E5022] font-semibold text-xs mb-1">Weight</div>
                      <div className="text-[#442D1C] font-bold text-sm">{product.weight} kg</div>
                    </div>
                  </div>
                </div>

                {/* Care Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-[#442D1C] mb-2 serif">Care Instructions</h3>
                  <p className="text-[#652810] leading-relaxed italic text-sm">{product.care}</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  onClick={addToCheckout}
                  className="w-full bg-gradient-to-r from-[#8E5022] to-[#C85428] hover:from-[#652810] hover:to-[#8E5022] text-white py-4 px-6 elegant-rounded-xl font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl organic-button hover-lift"
                >
                  Add to Cart - ₹{product.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}