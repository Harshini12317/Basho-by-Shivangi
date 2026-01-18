"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./AboutProducts.css";

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    title: "Tableware",
    description: "Hand-thrown bowls, plates, cups designed for daily use",
    image: "/images/table.jpeg"
  },
  {
    title: "Custom Pottery",
    description: "Bespoke pieces created just for you",
    image: "/images/p2.jpeg"
  },
  {
    title: "Limited Editions",
    description: "Seasonal releases with experimental glazes",
    image: "/images/p1.jpeg"
  }
];

export default function AboutProducts() {
  useEffect(() => {
    gsap.fromTo(
      ".product-item",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".products-section",
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <section className="products-section">
      <div className="products-container">
        <h2>What We Create</h2>
        
        <div className="products-grid">
          {products.map((item, index) => (
            <div key={index} className="product-item">
              <div className="product-image">
                <img src={item.image} alt={item.title} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
