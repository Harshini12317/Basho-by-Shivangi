"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./AboutPhilosophy.css";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPhilosophy() {
  useEffect(() => {
    gsap.fromTo(
      ".philosophy-inner",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".philosophy-section",
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <section className="philosophy-section">
      <div className="philosophy-inner">
        <h3>The Philosophy of Basho</h3>

        <p>
          Basho is a quiet practice of patience and presence. Each piece begins
          as earth, shaped slowly by hand, guided not by perfection but by
          intention.
        </p>

        <p>
          Subtle irregularities are not corrected — they are preserved, allowing
          the vessel to carry memory, time, and the marks of its making.
        </p>
      </div>
    </section>
  );
}
