"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNotification, NotificationContainer } from "@/components/Notification";

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
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [slug, setSlug] = useState<string>("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const { data: session, status } = useSession();
  const { addNotification, notifications, removeNotification } = useNotification();

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
      fetch(`/api/products/${resolvedParams.slug}`)
        .then((res) => res.json())
        .then(setProduct);
    });

    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(savedFavorites);

    // Listen for localStorage changes
    const handleStorageChange = () => {
      const updatedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(updatedFavorites);
    };

    // Listen for visibility changes to refresh wishlist status
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const updatedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(updatedFavorites);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [params]);

  const checkWishlistStatus = useCallback(async () => {
    if (!session || !slug || isUpdatingWishlist) return;

    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const wishlistData = await response.json();
        const isInWishlist = wishlistData.items?.some((item: { productSlug: string }) => item.productSlug === slug) || false;
        setIsInWishlist(isInWishlist);
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsInitialLoad(false);
    }
  }, [session, slug, isUpdatingWishlist]);

  useEffect(() => {
    if (product) {
      if (session && isInitialLoad && !isUpdatingWishlist) {
        // For authenticated users, check API only on initial load
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkWishlistStatus();
      } else if (!session) {
        // For non-authenticated users, check localStorage
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsInWishlist(favorites.includes(product._id));
        setIsInitialLoad(false);
      }
    }
  }, [session, product, favorites, isInitialLoad, isUpdatingWishlist, checkWishlistStatus]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#442D1C] text-xl">Loading...</div>
      </div>
    );
  }

  const addToCheckout = async () => {
    if (status === "loading") {
      return; // Wait for session to load
    }

    if (!session) {
      alert("Please sign in to add items to your cart.");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug: slug,
          qty: 1,
          price: product!.price,
          weight: product!.weight,
        }),
      });

      if (response.ok) {
        addNotification("Item added to cart successfully!", "success");
        // Trigger cart update in navbar
        window.dispatchEvent(new Event('cartUpdated'));
        // window.location.href = "/checkout";
      } else {
        const error = await response.json();
        addNotification(`Failed to add item to cart: ${error.error}`, "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      addNotification("An error occurred while adding the item to cart.", "error");
    }
  };

  const toggleWishlist = async () => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      // For non-authenticated users, use localStorage
      if (!product) return;
      const newFavorites = favorites.includes(product._id)
        ? favorites.filter(id => id !== product._id)
        : [...favorites, product._id];
      setFavorites(newFavorites);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      setIsInWishlist(!isInWishlist);
      return;
    }

    // For authenticated users, use optimistic updates for better UX
    if (!product) return;

    // Optimistically update the UI immediately
    const wasInWishlist = isInWishlist;
    setIsInWishlist(!wasInWishlist);
    setIsUpdatingWishlist(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug: slug,
          productTitle: product.title,
          productImage: product.images?.[0] || '/images/product1.png',
          productPrice: product.price,
        }),
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        const isNowInWishlist = updatedWishlist.items?.some((item: { productSlug: string }) => item.productSlug === slug) || false;
        
        // Update with the actual server state
        setIsInWishlist(isNowInWishlist);
        setIsUpdatingWishlist(false);
        
        // For authenticated users, we don't need to sync with localStorage
        // The wishlist is managed server-side
      } else {
        // Revert optimistic update on error
        setIsInWishlist(wasInWishlist);
        setIsUpdatingWishlist(false);
        const error = await response.json();
        alert(`Failed to update wishlist: ${error.error}`);
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsInWishlist(wasInWishlist);
      setIsUpdatingWishlist(false);
      console.error("Error updating wishlist:", error);
      alert("An error occurred while updating your wishlist.");
    }
  };

  return (
    <div className="min-h-screen py-16" style={{backgroundImage: 'url(/images/i2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Product Card */}
        <div className="bg-white/90 backdrop-blur-sm elegant-rounded-xl shadow-2xl border-2 border-[#EDD8B4] overflow-hidden clay-texture relative">
          <button
            onClick={() => router.back()}
            className="absolute top-2 right-2 w-12 h-12 rounded-full bg-white shadow-xl border border-[#EDD8B4] flex items-center justify-center text-[#442D1C] text-2xl hover:bg-[#F3E6D6] transition-all hover:-translate-y-[1px] active:scale-[0.96] z-10"
            aria-label="Close"
          >
            ×
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative p-8 lg:p-12">
              <div
                className="relative overflow-hidden backdrop-blur-sm shadow-xl transition-transform duration-500 elegant-rounded-xl"
                style={{
                  boxShadow: "0 10px 30px rgba(90,58,40,0.12)",
                  backgroundImage: "url(/images/i2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <img
                  src={product.images?.[selectedImage] || '/images/placeholder.png'}
                  className="w-full h-80 lg:h-96 object-cover transition-all duration-700 hover:scale-[1.02]"
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
                    className={`flex-shrink-0 w-20 h-20 elegant-rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-[1.04] shadow-md ${
                      selectedImage === index
                        ? "border-[#B85C2E] shadow-lg"
                        : "border-[#EDD8B4] hover:border-[#C85428] opacity-60 hover:opacity-100"
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
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#442D1C] leading-tight serif">
                    {product.title}
                  </h1>
                  <button
                    onClick={toggleWishlist}
                    className="mt-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-colors duration-300"
                    style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
                  >
                    {isInWishlist ? (
                      <FaHeart className="text-[#E86A5E] text-xl" />
                    ) : (
                      <FaRegHeart className="text-[#5A3A28] text-xl" />
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-[#F3E6D6] text-[#7A4A2E] rounded-full px-3 py-1 text-[12px] font-medium">
                    {product.material}
                  </span>
                </div>
                <div className="text-[22px] lg:text-[24px] font-semibold text-[#B85C2E]">₹{product.price}</div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-[#442D1C] mb-2 serif">The Story</h3>
                  <p className="text-[#5A3A28] leading-relaxed text-[14px]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>{product.description}</p>
                </div>

                {/* Craft Details */}
                <div>
                  <h3 className="text-lg font-semibold text-[#442D1C] mb-3 serif">Craft Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FDF6EC] rounded-[14px] p-4 border border-[rgba(90,58,40,0.08)]">
                      <div className="text-[#7A4A2E]/70 uppercase text-[12px] mb-1">Material</div>
                      <div className="text-[#5A3A28] font-semibold text-[15px]">{product.material}</div>
                    </div>
                    <div className="bg-[#FDF6EC] rounded-[14px] p-4 border border-[rgba(90,58,40,0.08)]">
                      <div className="text-[#7A4A2E]/70 uppercase text-[12px] mb-1">Weight</div>
                      <div className="text-[#5A3A28] font-semibold text-[15px]">{product.weight} kg</div>
                    </div>
                  </div>
                </div>

                {/* Care Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-[#442D1C] mb-2 serif">Care Instructions</h3>
                  <p className="text-[#5A3A28] leading-relaxed text-[14px]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>{product.care}</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  onClick={addToCheckout}
                  className="w-full bg-gradient-to-r from-[#B85C2E] to-[#9E4A25] text-white px-4 font-semibold text-sm transition-all duration-300 transform hover:-translate-y-[1px] hover:shadow-lg hover:scale-105 active:scale-[0.98]"
                  style={{ borderRadius: '14px', height: '56px', letterSpacing: '0.3px', boxShadow: '0 8px 20px rgba(184,92,46,0.3)' }}
                >
                  Add to Cart - ₹{product.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
}
