import "./FeaturesSection.css";

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">

        {/* HEADER */}
        <div className="features-header">
          <h2>Thoughtfully Crafted Experiences</h2>
          <p>
            Basho brings together craftsmanship, customization,
            and care — shaping objects meant to be lived with.
          </p>
        </div>

        {/* FEATURES */}
        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-image">
              <img src="/images/pottery-hero.png" alt="Pottery workshop" />
            </div>
            <div className="feature-content">
              <h3>Hands-on Workshops</h3>
              <p>
                Experience the joy of shaping clay yourself through
                guided, small-group pottery workshops.
              </p>
            </div>
          </div>

          <div className="feature-card offset">
            <div className="feature-image">
              <img src="/images/pottery-hero.png" alt="Custom pottery" />
            </div>
            <div className="feature-content">
              <h3>Custom Creations</h3>
              <p>
                Each piece can be tailored — from form to glaze —
                crafted specifically for your space and story.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img src="/images/pottery-hero.png" alt="Fine pottery quality" />
            </div>
            <div className="feature-content">
              <h3>Refined Quality</h3>
              <p>
                We work slowly and intentionally, ensuring balance,
                durability, and elegance in every finished piece.
              </p>
            </div>
          </div>

          <div className="feature-card offset">
            <div className="feature-image">
              <img src="/images/pottery-hero.png" alt="Safe materials" />
            </div>
            <div className="feature-content">
              <h3>Natural & Safe Materials</h3>
              <p>
                Crafted using high-quality clay and food-safe glazes,
                made to be used and cherished daily.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
