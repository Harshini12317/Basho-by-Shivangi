"use client";


import Link from "next/link";
import { useState, useEffect } from "react";
import { FiSearch, FiShoppingBag, FiMenu, FiX, FiPhone } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import { MdAccountCircle, MdHistory, MdFavoriteBorder, MdSettings, MdLogout, MdAdminPanelSettings, MdHome, MdInfo, MdLocalShipping, MdSchool, MdEdit, MdRateReview, MdPhotoLibrary, MdBusiness } from "react-icons/md";
import { useSession, signOut } from "next-auth/react";
import "./Navbar.css";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
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

      // Check if user is admin
      if (session?.user?.email) {
        try {
          const adminResponse = await fetch('/api/admin/admins?check=true');
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            setIsAdmin(!!adminData.isAdmin);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
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

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial mobile state
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={`navbar-inner ${isScrolled ? 'navbar-scrolled' : ''}`}>

  {/* LEFT ICONS */}
 <div className="nav-socials">
  <a href="https://www.instagram.com/bashobyyshivangi?igsh=NnBhMzh3NTVwbzA4" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <FaInstagram />
  </a>
  <a href="tel:+919879575601" aria-label="Call Us">
    <FiPhone />
  </a>
</div>


  {/* CENTER RAIL (controls spacing) */}
  <div className="nav-center-rail">

  <div className="nav-links left-links">
  <Link href="/">Home</Link>
  <Link href="/about">About</Link>
  <Link href="/custom-order">Custom order</Link>
</div>

<div className="nav-logo">
  <Link href="/">
    <img
      src="/images/basho-logo.png"
      alt="Basho by Shivangi"
    />
  </Link>
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
        {/* Desktop View - Limited Menu */}
        {!isMobile && (
          <>
            {session ? (
              <Link href="/profile" className="menu-item" onClick={() => setMenuOpen(false)}>
                <MdAccountCircle /> Profile
              </Link>
            ) : (
              <Link href="/auth" className="menu-item" onClick={() => setMenuOpen(false)}>
                <MdAccountCircle /> Login
              </Link>
            )}
            <Link href="/corporate" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdBusiness /> Corporate Inquiries
            </Link>
            <Link href="/gallery" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdPhotoLibrary /> Gallery
            </Link>
            {isAdmin && (
              <>
                <hr className="menu-divider" />
                <Link href="/admin/dashboard" className="menu-item" onClick={() => setMenuOpen(false)}>
                  <MdAdminPanelSettings /> Admin Panel
                </Link>
              </>
            )}
            {session && (
              <>
                <hr className="menu-divider" />
                <button className="menu-item logout" onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}>
                  <MdLogout /> Logout
                </button>
              </>
            )}
          </>
        )}

        {/* Mobile View - Full Menu */}
        {isMobile && (
          <>
            <Link href="/" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdHome /> Home
            </Link>
            <Link href="/about" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdInfo /> About
            </Link>
            <Link href="/products" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdLocalShipping /> Products
            </Link>
            <Link href="/workshop" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdSchool /> Workshops
            </Link>
            <Link href="/custom-order" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdEdit /> Custom order
            </Link>
            <Link href="/corporate" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdBusiness /> Corporate Inquiries
            </Link>
            <Link href="/testimonial" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdRateReview /> Testimonials
            </Link>
            <Link href="/gallery" className="menu-item" onClick={() => setMenuOpen(false)}>
              <MdPhotoLibrary /> Gallery
            </Link>
            {isAdmin && (
              <>
                <hr className="menu-divider" />
                <Link href="/admin/dashboard" className="menu-item" onClick={() => setMenuOpen(false)}>
                  <MdAdminPanelSettings /> Admin Panel
                </Link>
              </>
            )}
            {session && (
              <>
                <hr className="menu-divider" />
                <button className="menu-item logout" onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}>
                  <MdLogout /> Logout
                </button>
              </>
            )}
          </>
        )}
      </div>
    )}

  </div>

 </div>

</div>
  );
}