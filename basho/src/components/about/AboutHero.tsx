"use client";

import { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import Physics2DPlugin from "gsap/Physics2DPlugin";
import "./AboutHero.css";

gsap.registerPlugin(ScrollTrigger, SplitText, Physics2DPlugin);

export default function AboutHero() {
  useEffect(() => {
    const split = new SplitText("[data-drop-text]", { type: "chars" });

    gsap.fromTo(
      split.chars,
      { y: 0, autoAlpha: 1 },
      {
        scrollTrigger: {
          trigger: ".about-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        physics2D: {
          velocity: 700,
          angle: 90,
          gravity: 2800,
        },
        autoAlpha: 0,
        ease: "none",
      }
    );

    return () => {
      split.revert();
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <section className="about-hero">
      {/* Background Image */}
      <Image
        src="/images/pottery-hero.png"
        alt="Basho pottery"
        fill
        priority
        className="hero-bg"
      />

      {/* Text */}
      <div className="hero-content">
        <h1 data-drop-text className="hero-h1">
          Basho Art
        </h1>

        <h2 data-drop-text className="hero-h2">
          Handmade pottery shaped by earth and intention
        </h2>
      </div>
    </section>
  );
}
