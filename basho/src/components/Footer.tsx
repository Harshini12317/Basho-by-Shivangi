import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LEFT — BRAND & TAGLINE */}
        <div className="footer-brand">
          <h3>Basho</h3>
          <p>
            Handcrafted pottery shaped slowly,
            with intention and quiet care.
          </p>
          <div className="footer-tagline">
            Bringing artistry and soul to every piece.
          </div>
        </div>

        {/* CENTER — NAVIGATION LINKS */}
        <div className="footer-links">
          <div className="link-group">
            <span>Shop</span>
            <a href="/products">Collections</a>
            <a href="/custom-order">Custom Orders</a>
            <a href="/gallery">Gallery</a>
            <a href="/profile">Wishlist</a>
            <a href="/checkout">Cart</a>
          </div>

          <div className="link-group">
            <span>Experience</span>
            <a href="/workshop">Workshops</a>
            <a href="/workshop#events">Events</a>
            <a href="/studio">Studio Visit</a>
            <a href="/testimonial">Testimonials</a>
          </div>

          <div className="link-group">
            <span>Company</span>
            <a href="/about">About Us</a>
            <a href="/corporate">Corporate</a>
            <a href="/profile">Account</a>
            <a href="mailto:bashoshivangi@gmail.com">Contact</a>
          </div>
        </div>

        {/* RIGHT — STUDIO & SOCIAL */}
        <div className="footer-studio">
          <div className="studio-section">
            <h4>Visit Our Studio</h4>
            <p className="studio-address">
              311, Silent Zone, Gavier,<br />
              Dumas Road, Surat-395007
            </p>
            <a href="tel:+919879575601" className="studio-phone">
              +91 9879575601
            </a>
          </div>

          <div className="studio-section socials-section">
            <h4>Connect With Us</h4>
            <a 
              href="https://www.instagram.com/bashobyyshivangi?igsh=NnBhMzh3NTVwbzA4" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Basho by Shivangi. All rights reserved.</span>
      </div>
    </footer>
  );
}
