"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiHeart, FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";
import "./Wishlist.css";

type WishlistItem = {
  id: number;
  title: string;
  category: string;
  image: string;
  price: string;
  stock: string;
};

const initialItems: WishlistItem[] = [
  {
    id: 1,
    title: "Blush Stoneware Plate",
    category: "Products",
    image: "/images/pottery-hero.png",
    price: "₹1,200",
    stock: "In Stock",
  },
  {
    id: 2,
    title: "Hand-thrown Bowl Set",
    category: "Studio",
    image: "/images/pottery-hero.png",
    price: "₹2,800",
    stock: "In Stock",
  },
  {
    id: 3,
    title: "Weekend Pottery Workshop",
    category: "Workshop",
    image: "/images/pottery-hero.png",
    price: "₹3,500",
    stock: "Limited Slots",
  },
];

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const { data: session, status } = useSession();

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = async (item: WishlistItem) => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      alert("Please sign in to add items to your cart.");
      return;
    }

    try {
      // Extract price as number (remove ₹ symbol)
      const price = parseFloat(item.price.replace("₹", "").replace(",", ""));

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug: item.title.toLowerCase().replace(/\s+/g, "-"), // Create slug from title
          qty: 1,
          price: price,
          weight: 1, // Default weight, you might want to adjust this
        }),
      });

      if (response.ok) {
        alert("Item added to cart successfully!");
        // Trigger cart update in navbar
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await response.json();
        alert(`Failed to add item to cart: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("An error occurred while adding the item to cart.");
    }
  };

  return (
    <section className="wishlist-page">
      {/* CLOSE */}
      <button className="wishlist-close" onClick={() => router.back()}>
        <FiX />
      </button>

      {/* HEADER */}
      <header className="wishlist-header">
        <div className="wishlist-icon">
          <FiHeart />
        </div>
        <h1>Wishlist</h1>
        <p>Pieces you love, saved for later</p>
      </header>

      {/* LIST */}
      <div className="wishlist-list">
        {items.map((item) => (
          <div className="wishlist-row" key={item.id}>
            {/* IMAGE */}
            <div className="wishlist-row-image">
              <Image src={item.image} alt={item.title} fill />
            </div>

            {/* INFO */}
            <div className="wishlist-row-info">
              <span className="wishlist-category">{item.category}</span>
              <h3>{item.title}</h3>
              <span className="wishlist-stock">{item.stock}</span>
            </div>

            {/* PRICE */}
            <div className="wishlist-row-price">
              {item.price}
            </div>

            {/* ACTION */}
            <div className="wishlist-row-action">
              <button className="add-cart-btn" onClick={() => addToCart(item)}>Add to Cart</button>
              <button
                className="remove-link"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
