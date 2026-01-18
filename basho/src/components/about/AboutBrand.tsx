"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./AboutBrand.css";
import { useState } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function AboutBrand() {
  const ab2Fallbacks = ["/images/ab2.jpeg", "/images/ab2.jpg", "/images/ab2.png", "/images/bashostory2.jpg", "/images/common.png"];
  const ab1Fallbacks = ["/images/ab1.jpeg", "/images/ab1.jpg", "/images/ab1.png", "/images/bashostory1.jpg", "/images/common.png"];
  const [ab2Index, setAb2Index] = useState(0);
  const [ab1Index, setAb1Index] = useState(0);
  const ab2Src = ab2Fallbacks[ab2Index];
  const ab1Src = ab1Fallbacks[ab1Index];
  useEffect(() => {
    gsap.fromTo(
      ".brand-content",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".brand-section",
          start: "top 75%",
        },
      }
    );

    gsap.fromTo(
      ".brand-image",
      { scale: 0.95, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".brand-section",
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <section className="brand-section">
      <div className="brand-wrapper">
        <div className="brand-image">
          <img
            src={ab2Src}
            onError={() => setAb2Index((i) => Math.min(i + 1, ab2Fallbacks.length - 1))}
            alt="Basho Brand Story"
          />
        </div>
        <div className="brand-content">
          <h2>Basho: Where Earth Meets Intent</h2>
          <p>
            Inspired by Japanese poetry and centuries of ceramic tradition, Basho Art creates handmade pottery for those who believe everyday objects deserve beauty.
          </p>
          <p>
            Each piece is a quiet meditation—shaped by earth, refined by fire, and ready to become part of your story.
          </p>
        </div>
      </div>
      <div className="brand-wrapper">
        <div className="brand-content">
          <h2>Crafted by Hand, Sculpted by Soul</h2>
          <p>
            Discover a collection where every curve tells a story. At Basho, our artisanal pottery is more than just clay; it is a celebration of individuality and the quiet beauty of everyday objects. Each piece is shaped by earth and refined by fire, ready to bring warmth into your home.
          </p>
        </div>
        <div className="brand-image">
          <img
            src={ab1Src}
            onError={() => setAb1Index((i) => Math.min(i + 1, ab1Fallbacks.length - 1))}
            alt="Basho Artisanship"
          />
        </div>
      </div>
    </section>
  );
}
