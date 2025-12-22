"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./GsapSlider.css";

gsap.registerPlugin(ScrollTrigger);

export default function GsapSlider() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const cards = cardsRef.current;
    const total = cards.length;
    const radius = 420;

    const state = { rotation: 0 };

    const update = () => {
      cards.forEach((card, i) => {
       const spread = 370; // ⬅ increase to reduce overlap
const angle = (spread / total) * i + state.rotation;


        const rad = (angle * Math.PI) / 180;

        gsap.set(card, {
          x: Math.cos(rad) * radius,
          y: Math.sin(rad) * radius,
          rotate: angle + 90,
        });
      });
    };

    update();

    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        state.rotation = self.progress * 360;
        update();
      },
    });
  }, []);

  return (
    <section className="gsap-slider-section">
      <div className="gsap-slider-grid">
        <div ref={wrapperRef} className="gsap-slider-circle">
          <div className="gsap-slider-text">Collection</div>

        {[...Array(9)].map((_, i) => (
  <div
    key={i}
    ref={(el) => {
      if (el) cardsRef.current[i] = el;
    }}
    className="gsap-slider-card"
  >
    <img
      src="/images/pottery-hero.png"
      alt="Pottery"
    />
  </div>
))}

        </div>
      </div>
    </section>
  );
}
