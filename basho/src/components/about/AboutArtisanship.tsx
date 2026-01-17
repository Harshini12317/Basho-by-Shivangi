"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./AboutArtisanship.css";

gsap.registerPlugin(ScrollTrigger);

export default function AboutArtisanship() {
  useEffect(() => {
    gsap.fromTo(
      ".artisan-content",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".artisanship-section",
          start: "top 75%",
        },
      }
    );

    gsap.fromTo(
      ".artisan-image",
      { scale: 0.95, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".artisanship-section",
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <section className="artisanship-section">
      <div className="artisan-wrapper">
        <div className="artisan-content">
          <h2>Handcrafted with Care</h2>
          
          <div className="artisan-feature">
            <h3>✓ Food-Safe & Durable</h3>
            <p>Dishwasher-safe, microwave-safe, made to last a lifetime</p>
          </div>

          <div className="artisan-feature">
            <h3>✓ Traditional Craft</h3>
            <p>Hand-thrown on the wheel, glazed, and kiln-fired with intention</p>
          </div>

          <div className="artisan-feature">
            <h3>✓ Care & Longevity</h3>
            <p>Each piece improves with age. Handwash preferred, but dishwasher safe.</p>
          </div>
        </div>
        <div className="artisan-image">
          <img src="/images/bashostory2.jpg" alt="Artisanship" />
        </div>
      </div>
    </section>
  );
}
