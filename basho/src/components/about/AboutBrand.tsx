"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./AboutBrand.css";

gsap.registerPlugin(ScrollTrigger);

export default function AboutBrand() {
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
          <img src="/images/bashostory1.jpg" alt="Basho Brand Story" />
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
    </section>
  );
}
