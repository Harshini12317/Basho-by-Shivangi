"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSearch, FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import { FaTwitter, FaInstagram, FaPinterestP } from "react-icons/fa";
import { MdAccountCircle, MdHistory, MdFavoriteBorder, MdSettings, MdLogout } from "react-icons/md";
import "./Navbar.css";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="navbar-inner">

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
</div>

    <div className="nav-logo">
      <span className="logo-main">BASHO</span>
      <span className="logo-sub">BY SHIVANGI</span>
    </div>

    <div className="nav-links right-links">
      <Link href="/products">Products</Link>
      <Link href="/workshop/register">Workshop</Link>
    </div>

  </div>

  {/* RIGHT ICONS */}
 <div className="nav-icons">
  <button aria-label="Search">
    <FiSearch />
  </button>

  <Link href="/checkout" aria-label="Cart">
    <FiShoppingBag />
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
        <Link href="/favorites" className="menu-item">
          <MdFavoriteBorder /> Wishlist
        </Link>
        <Link href="/settings" className="menu-item">
          <MdSettings /> Settings
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
