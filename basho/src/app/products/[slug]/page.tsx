"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
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
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#442D1C] leading-tight serif">
                    {product.title}
                  </h1>
                  <button
                    key={isInWishlist ? 'filled' : 'empty'}
                    onClick={toggleWishlist}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      isInWishlist
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
                    }`}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isInWishlist ? <FaHeart className="text-xl text-red-600" /> : <FaRegHeart className="text-xl text-gray-400" />}
                  </button>
                </div>
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
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
}