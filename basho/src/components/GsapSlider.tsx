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

    const wrapper = wrapperRef.current;
    const cards = cardsRef.current;
    const total = cards.length;

    /* ---------------- STATE ---------------- */
    const state = {
      rotation: 0,
      dragRotation: 0,
    };

    /* ---------------- RADIUS ---------------- */
    const getRadius = () => {
      const size = wrapper.offsetWidth;
      return size / 2.4;
    };

    /* ---------------- UPDATE ---------------- */
    const update = () => {
      const radius = getRadius();

      cards.forEach((card, i) => {
        const spread = 370;
        const angle =
          (spread / total) * i +
          state.rotation +
          state.dragRotation;

        const rad = (angle * Math.PI) / 180;

        gsap.set(card, {
          x: Math.cos(rad) * radius,
          y: Math.sin(rad) * radius,
          rotate: angle + 90,
        });
      });
    };

    update();

    /* ---------------- SCROLL ---------------- */
    const scrollTrigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        state.rotation = self.progress * 360;
        update();
      },
    });

    /* ---------------- TOUCH ---------------- */
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX;
      state.dragRotation = deltaX * 0.35;
      update();
    };

    const handleTouchEnd = () => {
      gsap.to(state, {
        dragRotation: 0,
        duration: 1,
        ease: "power3.out",
        onUpdate: update,
      });
    };

    wrapper.addEventListener("touchstart", handleTouchStart);
    wrapper.addEventListener("touchmove", handleTouchMove);
    wrapper.addEventListener("touchend", handleTouchEnd);

    /* ---------------- RESIZE (THIS WAS MISSING) ---------------- */
    const handleResize = () => update();
    window.addEventListener("resize", handleResize);

    /* ---------------- CLEANUP ---------------- */
    return () => {
      scrollTrigger.kill();

      window.removeEventListener("resize", handleResize);

      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
    };
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
