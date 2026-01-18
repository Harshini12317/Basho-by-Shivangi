"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { FiCircle } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";
import { TbDots } from "react-icons/tb";
import { GiPalette } from "react-icons/gi";
import "./AboutJapaneseCulture.css";

gsap.registerPlugin(ScrollTrigger);

const philosophies = [
  {
    title: "Wabi-Sabi",
    description: "Beauty in imperfection and simplicity"
  },
  {
    title: "Minimalism",
    description: "Form follows essence"
  },
  {
    title: "Clay",
    description: "Connection to earth and nature"
  },
  {
    title: "Craft",
    description: "The maker's presence in every piece"
  }
];

const getIcon = (title: string) => {
  switch (title) {
    case "Wabi-Sabi":
      return <MdAutoAwesome />;
    case "Minimalism":
      return <FiCircle />;
    case "Clay":
      return <TbDots />;
    case "Craft":
      return <GiPalette />;
    default:
      return null;
  }
};

export default function AboutJapaneseCulture() {
  useEffect(() => {
    gsap.fromTo(
      ".philosophy-item",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".japanese-culture-section",
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <section className="japanese-culture-section">
      <div className="culture-container">
        <h2>Our Philosophy</h2>
        <p className="philosophy-subtitle">The principles that guide every form we shape.</p>
        <div className="philosophy-divider"></div>
        
        <div className="philosophy-grid">
          {philosophies.map((item, index) => (
            <div key={index} className="philosophy-item">
              <div className="philosophy-icon">
                {getIcon(item.title)}
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
