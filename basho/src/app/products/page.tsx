"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useNotification, NotificationContainer } from "@/components/Notification";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface Product {
  _id: string;
  title: string;
  slug: string;
  images: string[];
  price: number;
  material: string;
  category: {
    _id: string;
    name: string;
  };
}

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const fullText = "Our Creations";
  const { data: session } = useSession();
  const { addNotification, notifications, removeNotification } = useNotification();

  // Custom order messages
  const customOrderMessages = [
    "Want this made your way? Place a custom order.",
    "Like this piece, but want it your way? Go custom.",
    "Different size, shape, or idea? We make custom pieces.",
    "Have a design in mind? We'll craft it just for you.",
    "Your idea, our clay — order a custom piece.",
    "Love this, but want it personal? Try a custom order.",
    "Almost perfect? Let's customize it.",
    "This piece, your rules — custom orders welcome.",
    "Want your touch on this? Go custom.",
    "Like this piece, but imagining something different? Request a custom order made just for you.",
    "Have a size, color, or design in mind? We create custom pottery on request.",
    "This is just one possibility. Custom orders let you create your own.",
    "Inspired by this piece? Let us craft a custom version for you."
  ];

  const [randomMessage, setRandomMessage] = useState<string>("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Load favorites from localStorage (for non-authenticated users)
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavorites);

    // For authenticated users, also fetch wishlist from API
    if (session?.user) {
      fetchWishlist();
    }

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

    // Set random custom order message
    const randomIndex = Math.floor(Math.random() * customOrderMessages.length);
    setRandomMessage(customOrderMessages[randomIndex]);
    // Listen for localStorage changes
    const handleStorageChange = () => {
      const updatedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(updatedFavorites);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);  }, [session]); // Added session to dependencies

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (sortBy !== "newest") params.append("sort", sortBy);
      if (debouncedSearchQuery.trim()) params.append("search", debouncedSearchQuery.trim());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.map((cat: any) => cat.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWishlist = async () => {
    if (!session?.user || isUpdatingWishlist) return;
    
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const wishlistData = await response.json();
        // Update favorites state with product IDs from wishlist
        // We need to map slugs back to IDs, but since we don't have the product data yet,
        // we'll store the slugs and check against them in isInWishlist
        const wishlistSlugs = wishlistData.items?.map((item: any) => item.productSlug) || [];
        // For now, we'll use a separate state for wishlist slugs
        setWishlistSlugs(wishlistSlugs);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const isInWishlist = (product: Product) => {
    if (session?.user) {
      // For authenticated users, check wishlist slugs
      return wishlistSlugs.includes(product.slug);
    } else {
      // For non-authenticated users, check localStorage favorites
      return favorites.includes(product._id);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (!session) {
      // For non-authenticated users, use localStorage
      const newFavorites = favorites.includes(product._id)
        ? favorites.filter(id => id !== product._id)
        : [...favorites, product._id];
      setFavorites(newFavorites);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return;
    }

    // For authenticated users, use optimistic updates for better UX
    const wasInWishlist = wishlistSlugs.includes(product.slug);
    
    // Optimistically update the UI immediately
    const optimisticSlugs = wasInWishlist
      ? wishlistSlugs.filter(slug => slug !== product.slug)
      : [...wishlistSlugs, product.slug];
    setWishlistSlugs(optimisticSlugs);
    setIsUpdatingWishlist(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug: product.slug,
          productTitle: product.title,
          productImage: product.images?.[0] || '/images/product1.png',
          productPrice: product.price,
        }),
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        // Update with the actual server state
        const updatedSlugs = updatedWishlist.items?.map((item: any) => item.productSlug) || [];
        setWishlistSlugs(updatedSlugs);
        setIsUpdatingWishlist(false);
      } else {
        // Revert optimistic update on error
        setWishlistSlugs(wishlistSlugs);
        setIsUpdatingWishlist(false);
        console.error("Failed to update wishlist");
      }
    } catch (error) {
      // Revert optimistic update on error
      setWishlistSlugs(wishlistSlugs);
      console.error("Error updating wishlist:", error);
    }
  };

  const addToCart = async (product: Product) => {
    if (!session) {
      addNotification("Please sign in to add items to your cart.", "error");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug: product.slug,
          qty: 1,
          price: product.price,
          weight: 1, // Default weight, you might want to adjust this based on product data
        }),
      });

      if (response.ok) {
        addNotification("Item added to cart successfully!", "success");
        // Trigger cart update in navbar
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await response.json();
        addNotification(`Failed to add item to cart: ${error.error}`, "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      addNotification("An error occurred while adding the item to cart.", "error");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, debouncedSearchQuery]);

  return (
    <div className="min-h-screen py-8 sm:py-12" style={{backgroundImage: 'url(/images/i2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-[#442D1C] mb-4 sm:mb-6 serif">
            {typedText}
            <span className="typewriter-cursor">|</span>
          </h1>
        </div>

        {/* Filters Section */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/90 elegant-rounded-xl shadow-lg border-2 border-[#EDD8B4] p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-center">
              {/* Category Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label htmlFor="category" className="text-[#442D1C] font-semibold text-sm sm:text-base">
                  Category:
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#EDD8B4]/30 border border-[#8E5022]/30 rounded-lg px-3 py-2 text-[#442D1C] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/50 focus:border-[#8E5022] transition-all duration-300"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label htmlFor="sort" className="text-[#442D1C] font-semibold text-sm sm:text-base">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#EDD8B4]/30 border border-[#8E5022]/30 rounded-lg px-3 py-2 text-[#442D1C] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/50 focus:border-[#8E5022] transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Search Input */}
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name..."
                    className="bg-[#EDD8B4]/30 border border-[#8E5022]/30 rounded-lg pr-10 pl-3 py-2 text-[#442D1C] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/50 focus:border-[#8E5022] transition-all duration-300 w-full sm:w-64"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#442D1C]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-[#442D1C] text-xl">Loading products...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
                <Link href={`/products/${p.slug}`} key={p._id}>
                  <div className="group bg-white/90 elegant-rounded-xl shadow-lg border-2 border-[#EDD8B4] overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift">
                    {/* Image container with hover effect */}
                    <div className="relative overflow-hidden">
                      <img
                        src={p.images?.[0] || '/images/placeholder.png'}
                        className="w-full h-40 sm:h-48 object-cover transition-opacity duration-500 group-hover:opacity-0"
                        alt={p.title}
                      />
                      <img
                        src={p.images?.[1] || p.images?.[0] || '/images/placeholder.png'}
                        className="absolute top-0 left-0 w-full h-40 sm:h-48 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        alt={p.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-white to-[#EDD8B4]/30 relative">
                      <h2 className="font-bold text-base sm:text-lg text-[#442D1C] mb-2 leading-tight serif">
                        {p.title}
                      </h2>
                      <p className="text-[#652810] mb-1 font-medium italic text-xs sm:text-sm">{p.material}</p>
                      <p className="text-[#8E5022] mb-3 font-medium text-xs sm:text-sm">{p.category?.name}</p>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-lg sm:text-xl font-bold text-[#8E5022]">₹{p.price}</p>
                        {/* Favorite Heart Icon */}
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(p);
                          }}
                          className="cursor-pointer transition-all duration-300 hover:scale-110"
                        >
                          {isInWishlist(p) ? (
                            <FaHeart className="text-red-500 text-xl transition-colors duration-300" />
                          ) : (
                            <FaRegHeart className="text-gray-400 text-xl transition-colors duration-300 hover:text-red-400" />
                          )}
                        </div>
                      </div>
                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(p);
                        }}
                        className="w-full bg-gradient-to-r from-[#8E5022] to-[#C85428] hover:from-[#652810] hover:to-[#8E5022] text-white py-2 px-4 elegant-rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-[#EDD8B4]">
              <h3 className="text-[#442D1C] text-2xl font-bold mb-4">No products found</h3>
              <p className="text-[#652810] text-lg">Try exploring our other handcrafted creations</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Custom Order Element */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/95 backdrop-blur-sm elegant-rounded-2xl shadow-xl border-2 border-[#EDD8B4]/60 p-4 max-w-xs animate-pulse hover:animate-none transition-all duration-300 hover:shadow-2xl hover:border-[#8E5022]/40">
          <p className="text-[#442D1C] text-sm font-medium mb-3 leading-relaxed">
            {randomMessage}
          </p>
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-[#652810] hover:to-[#8E5022] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Order Custom</span>
            <span className="text-xs">→</span>
          </Link>
        </div>
      </div>
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
}