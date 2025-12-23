"use client";

import { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import "./AboutCreatorBook.css";

export default function AboutCreatorBook() {
  useEffect(() => {
    const book = document.querySelector<HTMLElement>(".book");
    if (!book) return;

    const totalWidth = book.scrollWidth / 2;

    // Infinite cinematic horizontal movement
    gsap.to(book, {
      x: -totalWidth,
      duration: 40, // ⬅ slower = more cinematic
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => `${parseFloat(x) % totalWidth}px`,
      },
    });

    // Soft text reveal (subtle, cinematic)
    gsap.fromTo(
      ".page-content",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 2,
        stagger: 0.6,
        ease: "power2.out",
        delay: 0.8,
      }
    );
  }, []);

  return (
    <section className="book-stage">
      <div className="book">

        {/* ===== LOOP SET 1 ===== */}
        {creators.map((c, i) => (
          <div className="spread" key={`a-${i}`}>
            <div className="page">
              <Image src={c.image} alt={c.name} fill />
              <div className={`page-content ${c.align}`}>
                <h2>{c.name}</h2>
                <span>{c.role}</span>
                <p>{c.desc}</p>
              </div>
            </div>
          </div>
        ))}

        {/* ===== LOOP SET 2 (for seamless loop) ===== */}
        {creators.map((c, i) => (
          <div className="spread" key={`b-${i}`}>
            <div className="page">
              <Image src={c.image} alt={c.name} fill />
              <div className={`page-content ${c.align}`}>
                <h2>{c.name}</h2>
                <span>{c.role}</span>
                <p>{c.desc}</p>
              </div>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}

/* ===== DATA ===== */

const creators = [
  {
    name: "Shivangi",
    role: "Founder · Basho",
    desc:
      "Rooted in Japanese pottery traditions and slow craft, embracing imperfection and quiet presence.",
    image: "/images/pottery-hero.png",
    align: "left",
  },
  {
    name: "Aarav",
    role: "Ceramic Artist",
    desc:
      "Focused on balance, rhythm, and raw clay textures. Pottery that feels lived-in, not pristine.",
    image: "/images/pottery-hero.png",
    align: "right",
  },
  {
    name: "Meera",
    role: "Glaze Specialist",
    desc:
      "Works with natural ash glazes and firing variations, allowing fire to define the final form.",
    image: "/images/pottery-hero.png",
    align: "left",
  },
  {
    name: "Riku",
    role: "Wheel Specialist",
    desc:
      "Inspired by repetition and movement found in traditional Japanese wheel work.",
    image: "/images/pottery-hero.png",
    align: "right",
  },
];
