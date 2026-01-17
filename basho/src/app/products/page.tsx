"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useNotification, NotificationContainer } from "@/components/Notification";
import { FaHeart, FaRegHeart, FaShoppingCart, FaFilter, FaSortAmountDownAlt } from "react-icons/fa";

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
      if (!response.ok) {
        console.error("Categories API returned error:", data);
        setCategories([]);
        return;
      }
      const list = Array.isArray(data) ? data : [];
      setCategories(list.map((cat: any) => cat.name).filter(Boolean));
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
    <div className="page-bg min-h-screen py-8 sm:py-12 bg-cover bg-center bg-fixed" style={{backgroundImage: 'url(/images/i2.jpg)'}}>
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
          <div className="filters bg-white/90 elegant-rounded-xl border-2 border-[#EDD8B4] p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-center">
              {/* Category Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label htmlFor="category" className="flex items-center gap-2 text-[#442D1C] font-semibold text-base sm:text-lg">
                  <FaFilter className="text-[#8E5022]" />
                  <span>Category</span>
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#EDD8B4]/30 border border-[#8E5022]/30 rounded-lg px-3 py-2 text-[#442D1C] text-sm sm:text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]/50 focus:border-[#8E5022] transition-all duration-300"
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
                <label htmlFor="sort" className="flex items-center gap-2 text-[#442D1C] font-semibold text-base sm:text-lg">
                  <FaSortAmountDownAlt className="text-[#8E5022]" />
                  <span>Sort by</span>
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#EDD8B4]/30 border border-[#8E5022]/30 rounded-lg px-3 py-2 text-[#442D1C] text-sm sm:text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]/50 focus:border-[#8E5022] transition-all duration-300"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="oldest">Early Creations</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Search Input */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name..."
                    className="bg-[#EDD8B4]/30 border border-[#8E5022]/30 rounded-lg pr-10 pl-3 py-2 text-[#442D1C] focus:outline-none focus:ring-2 focus:ring-[#8E5022]/50 focus:border-[#8E5022] transition-all duration-300 w-full sm:w-80 lg:w-96"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#442D1C]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSortBy("newest");
                    setSearchQuery("");
                    setDebouncedSearchQuery("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#8E5022] border border-[#8E5022]/40 rounded-full hover:bg-[#EDD8B4]/40 transition-colors"
                >
                  Clear filters
                </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8 items-stretch">
            {products.map((p) => (
                <Link href={`/products/${p.slug}`} key={p._id} className="block h-full">
                  <div className="group h-full flex flex-col card-depth elegant-rounded-xl border-2 border-[#EDD8B4] overflow-hidden transition-all duration-300">
                    {/* Image container with hover effect */}
                    <div className="relative image-frame">
                      <img
                        src={p.images?.[0] || '/images/placeholder.png'}
                        className="w-full h-40 sm:h-48 rounded-[14px] object-contain sm:object-cover bg-white transition-opacity transition-transform duration-500 group-hover:opacity-0 group-hover:scale-105"
                        alt={p.title}
                      />
                      <img
                        src={p.images?.[1] || p.images?.[0] || '/images/placeholder.png'}
                        className="absolute top-0 left-0 w-full h-40 sm:h-48 rounded-[14px] object-contain sm:object-cover bg-white opacity-0 transition-opacity transition-transform duration-500 group-hover:opacity-100 group-hover:scale-105"
                        alt={p.title}
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p);
                          }}
                          title={isInWishlist(p) ? "Remove from Wishlist" : "Add to Wishlist"}
                          aria-label={isInWishlist(p) ? "Remove from Wishlist" : "Add to Wishlist"}
                          className="wishlist-pill rounded-full p-2"
                        >
                          {isInWishlist(p) ? (
                            <FaHeart className="text-red-500 text-lg" />
                          ) : (
                            <FaRegHeart className="text-[#8E5022] text-lg" />
                          )}
                        </button>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-3 sm:p-4 bg-gradient-to-br from-white to-[#EDD8B4]/30 relative">
                      <h2 className="product-title font-bold text-lg sm:text-xl text-[#442D1C] mb-1 leading-tight serif">
                        {p.title}
                      </h2>
                      <p className="meta-text text-xs sm:text-sm text-[#6B4A2F]/80 mb-3">
                        Handmade{p.material ? ` • ${p.material}` : ""}{p.category?.name ? ` • ${p.category.name}` : ""}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xl sm:text-2xl font-bold text-black">₹{p.price}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(p);
                        }}
                        className="add-to-cart mt-auto w-full inline-flex items-center justify-center gap-2 bg-[#B35A2A] hover:bg-[#8E451C] text-white py-2 px-6 rounded-full font-semibold text-sm transition-all duration-300"
                      >
                        <FaShoppingCart className="text-sm" />
                        <span>Add to Cart</span>
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

      {/* Floating Custom Order Concierge Card */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="concierge-card bg-white/96 backdrop-blur-sm max-w-xs p-4 sm:p-5 lift-hover">
          <div className="flex items-start gap-3">
            <div className="accent-circle flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <p className="text-[#442D1C] text-sm font-semibold mb-1">
                ✨ Want it made just for you?
              </p>
              <p className="text-[#6B4A2F] text-xs sm:text-sm mb-3 leading-relaxed">
                Choose size, shape, or glaze — handcrafted to your taste.
              </p>
              <Link
                href="/custom-order"
                className="btn-glow inline-flex items-center gap-2 bg-[#B35A2A] hover:bg-[#8E451C] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
              >
                <span>Create Your Piece</span>
                <span className="text-xs">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
}
