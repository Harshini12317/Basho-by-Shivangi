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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const fullText = "Our Creations";
  const { data: session } = useSession();
  const { addNotification, notifications, removeNotification } = useNotification();

  const customOrderMessages = [
    "Want this made your way? Place a custom order.",
    "Love this, but want it personal? Try a custom order.",
    "Inspired by this piece? Let us craft a custom version for you.",
  ];
  const [randomMessage, setRandomMessage] = useState("");

  /* ------------------ EFFECTS ------------------ */

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    setFavorites(JSON.parse(localStorage.getItem("favorites") || "[]"));

    if (session?.user) fetchWishlist();

    let index = 0;
    const typeWriter = () => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
        setTimeout(typeWriter, 120);
      }
    };
    typeWriter();

    setRandomMessage(
      customOrderMessages[Math.floor(Math.random() * customOrderMessages.length)]
    );
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, debouncedSearchQuery]);

  /* ------------------ DATA ------------------ */

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (sortBy !== "newest") params.append("sort", sortBy);
      if (debouncedSearchQuery.trim()) params.append("search", debouncedSearchQuery.trim());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.map((c: any) => c.name));
  };

  const fetchWishlist = async () => {
    if (!session?.user || isUpdatingWishlist) return;
    const res = await fetch("/api/wishlist");
    if (res.ok) {
      const data = await res.json();
      setWishlistSlugs(data.items?.map((i: any) => i.productSlug) || []);
    }
  };

  /* ------------------ WISHLIST ------------------ */

  const isInWishlist = (p: Product) =>
    session?.user ? wishlistSlugs.includes(p.slug) : favorites.includes(p._id);

  const toggleWishlist = async (p: Product) => {
    if (!session) {
      const updated = favorites.includes(p._id)
        ? favorites.filter(id => id !== p._id)
        : [...favorites, p._id];
      setFavorites(updated);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return;
    }

    const optimistic = isInWishlist(p)
      ? wishlistSlugs.filter(s => s !== p.slug)
      : [...wishlistSlugs, p.slug];

    setWishlistSlugs(optimistic);
    setIsUpdatingWishlist(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: p.slug,
          productTitle: p.title,
          productImage: p.images?.[0],
          productPrice: p.price,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWishlistSlugs(data.items?.map((i: any) => i.productSlug) || []);
      }
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  /* ------------------ CART ------------------ */

  const addToCart = async (p: Product) => {
    if (!session) {
      addNotification("Please sign in to add items to your cart.", "error");
      return;
    }

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: p.slug,
        qty: 1,
        price: p.price,
        weight: 1,
      }),
    });

    addNotification("Item added to cart successfully!", "success");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen py-8 sm:py-12">

      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <h1 className="text-5xl lg:text-7xl font-bold text-center text-[#442D1C] serif mb-12">
          {typedText}
          <span className="opacity-50">|</span>
        </h1>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-[#EDD8B4] p-6 mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="rounded-xl px-4 py-2 bg-[#EDD8B4]/40 border border-[#8E5022]/30"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="rounded-xl px-4 py-2 bg-[#EDD8B4]/40 border border-[#8E5022]/30"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
            </select>

            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search pottery..."
              className="rounded-xl px-4 py-2 w-64 bg-[#EDD8B4]/40 border border-[#8E5022]/30"
            />
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center py-20 text-[#442D1C] text-xl">
            Loading products...
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <Link key={p._id} href={`/products/${p.slug}`}>
                <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden">

                  {/* IMAGE HOVER (2 IMAGES) */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-[#EDD8B4]/30">
                    <img
                      src={p.images?.[0] || "/images/placeholder.png"}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover 
                                 transition-opacity duration-500 ease-in-out 
                                 group-hover:opacity-0"
                    />
                    <img
                      src={p.images?.[1] || p.images?.[0] || "/images/placeholder.png"}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover 
                                 opacity-0 transition-opacity duration-500 ease-in-out 
                                 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h2 className="font-semibold text-lg text-[#442D1C]">{p.title}</h2>
                    <p className="text-sm text-[#652810] italic">{p.material}</p>
                    <p className="font-bold text-[#8E5022] mt-2">₹{p.price}</p>

                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={e => {
                          e.preventDefault();
                          addToCart(p);
                        }}
                        className="flex-1 mr-2 rounded-xl py-2 bg-gradient-to-r from-[#8E5022] to-[#C85428] 
                                   text-white hover:shadow-lg transition"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={e => {
                          e.preventDefault();
                          toggleWishlist(p);
                        }}
                        className="p-2 rounded-full bg-[#EDD8B4]/50 hover:bg-[#EDD8B4]"
                      >
                        {isInWishlist(p) ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart className="text-[#442D1C]" />
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Floating Custom Order */}
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-4 border border-[#EDD8B4] max-w-xs">
          <p className="text-sm text-[#442D1C] mb-3">{randomMessage}</p>
          <Link
            href="/custom-order"
            className="block text-center bg-[#8E5022] text-white rounded-xl py-2"
          >
            Order Custom →
          </Link>
        </div>

        <NotificationContainer
          notifications={notifications}
          removeNotification={removeNotification}
        />
      </div>
    </div>
  );
}
