import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LEFT — BRAND */}
        <div className="footer-brand">
          <h3>Basho</h3>
          <p>
            Handcrafted pottery shaped slowly,
            with intention and quiet care.
          </p>
        </div>

        {/* CENTER — LINKS */}
        <div className="footer-links">
          <div>
            <span>Explore</span>
            <a href="#">Collection</a>
            <a href="#">Workshops</a>
            <a href="#">Custom Orders</a>
          </div>

          <div>
            <span>About</span>
            <a href="#">Our Story</a>
            <a href="#">Craft Process</a>
            <a href="#">Contact</a>
          </div>

          <div>
            <span>More</span>
            <a href="/testimonial">Testimonials</a>
            <a href="/corporate">Corporate</a>
          </div>
        </div>

        {/* RIGHT — STUDIO & CONTACT */}
        <div className="footer-studio">
          <div className="studio-info">
            <h4>Visit Our Studio</h4>
            <p className="studio-address">311, Silent Zone, Gavier,<br />Dumas Road, Surat-395007</p>
            <p className="studio-phone">
              <a href="tel:+919879575601">+91 9879575601</a>
            </p>
          </div>

          <div className="studio-socials">
            <span>Follow Us</span>
            <a href="https://www.instagram.com/bashobyyshivangi?igsh=NnBhMzh3NTVwbzA4" target="_blank" rel="noopener noreferrer" className="social-link instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <circle cx="17.5" cy="6.5" r="1.5"></circle>
              </svg>
              Instagram
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Basho by Shivangi</span>
      </div>
    </footer>
  );
}
