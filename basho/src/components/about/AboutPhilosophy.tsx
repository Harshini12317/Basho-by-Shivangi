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
      <div className="philosophy-container">
        <h2>The Philosophy of Basho</h2>
        <div className="philosophy-image">
          <img src="/images/bashostory1.jpg" alt="Basho Philosophy" />
        </div>
      </div>
    </section>
  );
}
