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
        </div>

        {/* RIGHT — NOTE */}
        <div className="footer-note">
          <p>
            Made with patience,<br />
            inspired by earth.
          </p>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Basho by Shivangi</span>
      </div>
    </footer>
  );
}
