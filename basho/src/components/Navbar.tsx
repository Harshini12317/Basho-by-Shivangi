"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FiSearch, FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import { FaTwitter, FaInstagram, FaPinterestP } from "react-icons/fa";
import { MdAccountCircle, MdHistory, MdFavoriteBorder, MdSettings, MdLogout } from "react-icons/md";
import { useSession } from "next-auth/react";
import "./Navbar.css";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const updateCartCount = async () => {
      if (session) {
        // Fetch cart count from API for authenticated users
        try {
          const response = await fetch("/api/cart");
          if (response.ok) {
            const cartData = await response.json();
            const totalItems = cartData.items?.reduce((total: number, item: any) => total + item.qty, 0) || 0;
            setCartItemCount(totalItems);
          }
        } catch (error) {
          console.error("Error fetching cart count:", error);
          setCartItemCount(0);
        }
      } else {
        // Get cart count from localStorage for non-authenticated users
        try {
          const checkoutData = localStorage.getItem("checkout");
          if (checkoutData) {
            const items = JSON.parse(checkoutData);
            const totalItems = items.reduce((total: number, item: any) => total + item.qty, 0);
            setCartItemCount(totalItems);
          } else {
            setCartItemCount(0);
          }
        } catch (error) {
          console.error("Error parsing localStorage cart data:", error);
          setCartItemCount(0);
        }
      }
    };

    updateCartCount();

    // Listen for storage changes (for localStorage updates)
    const handleStorageChange = () => {
      updateCartCount();
    };

    // Listen for visibility changes to update cart count when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateCartCount();
      }
    };

    // Listen for custom cart update events
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("cartUpdated", handleCartUpdate);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [session]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`navbar-inner ${isScrolled ? 'navbar-scrolled' : ''}`}>

  {/* LEFT ICONS */}
 <div className="nav-socials">
  <a href="https://twitter.com" aria-label="Twitter">
    <FaTwitter />
  </a>
  <a href="https://instagram.com" aria-label="Instagram">
    <FaInstagram />
  </a>
  <a href="https://pinterest.com" aria-label="Pinterest">
    <FaPinterestP />
  </a>
</div>


  {/* CENTER RAIL (controls spacing) */}
  <div className="nav-center-rail">

  <div className="nav-links left-links">
  <Link href="/">Home</Link>
  <Link href="/about">About</Link>
  <Link href="/gallery">Gallery</Link>
</div>

    <div className="nav-logo">
      <span className="logo-main">basho</span>
      <span className="logo-sub">BYY SHIVANGI</span>
    </div>

    <div className="nav-links right-links">
      <Link href="/products">Products</Link>
      <Link href="/testimonial">Testimonials</Link>
      <Link href="/workshop">Workshop</Link>
    </div>

  </div>

  {/* RIGHT ICONS */}
 <div className="nav-icons">
  {session ? (
    <Link href="/profile" aria-label="Profile">
      <MdAccountCircle />
    </Link>
  ) : (
    <Link href="/auth" aria-label="Login" className="nav-login-text">
      Login
    </Link>
  )}

  <Link href="/checkout" aria-label="Cart" className="nav-cart-container">
    <FiShoppingBag />
    {cartItemCount > 0 && (
      <span className="nav-cart-badge">
        {cartItemCount > 99 ? '99+' : cartItemCount}
      </span>
    )}
  </Link>

  <div className="menu-container">
    <button 
      aria-label="Menu"
      onClick={() => setMenuOpen(!menuOpen)}
      className="menu-toggle"
    >
      {menuOpen ? <FiX /> : <FiMenu />}
    </button>

    {menuOpen && (
      <div className="dropdown-menu">
        <Link href="/profile" className="menu-item">
          <MdAccountCircle /> Profile
        </Link>
        <Link href="/orders" className="menu-item">
          <MdHistory /> Order History
        </Link>
        <Link href="/wishlist" className="menu-item">
          <MdFavoriteBorder /> Wishlist
        </Link>
        <Link href="/settings" className="menu-item">
          <MdSettings /> Settings
        </Link>
        <hr className="menu-divider" />
        <Link href="/" className="menu-item">
          Home
        </Link>
        <Link href="/about" className="menu-item">
          About
        </Link>
        <Link href="/gallery" className="menu-item">
          Gallery
        </Link>
        <Link href="/products" className="menu-item">
          Products
        </Link>
        <Link href="/testimonial" className="menu-item">
          Testimonials
        </Link>
        <Link href="/workshop" className="menu-item">
          Workshop
        </Link>
        <hr className="menu-divider" />
        <button className="menu-item logout" onClick={() => {
          // Add logout logic here
          setMenuOpen(false);
        }}>
          <MdLogout /> Logout
        </button>
      </div>
    )}

  </div>

 </div>

</div>
  );
}