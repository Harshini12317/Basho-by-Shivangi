"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./AboutProcess.css";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Clay",
    text: "The earth is gathered and prepared by hand, grounding each piece in its natural origin.",
  },
  {
    title: "Wheel",
    text: "Form takes shape through rhythm and balance, guided by quiet repetition.",
  },
  {
    title: "Fire",
    text: "Flames transform the fragile into the enduring, leaving behind traces of chance.",
  },
  {
    title: "Silence",
    text: "The final form rests, complete yet imperfect, ready to be held and lived with.",
  },
];

export default function AboutProcess() {
  useEffect(() => {
  gsap.fromTo(
    ".process-item",
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".process-section",
        start: "top 75%",
      },
    }
  );

  // DOT GLOW ON SCROLL
 gsap.utils.toArray<HTMLElement>(".process-dot").forEach((dot) => {
  gsap.to(dot, {
    background: "rgba(21, 19, 18, 1)",
    
    duration: 0.6,
    scrollTrigger: {
      trigger: dot,
      start: "top 70%",
      toggleActions: "play reverse play reverse",
    },
  });
});
}, []);


  return (
   <section className="process-section">
  <div className="process-timeline">
    {steps.map((step, index) => (
      <div key={index} className="process-item">
        <div className="process-dot" />
        <div className="process-card">
          <h4>{step.title}</h4>
          <p>{step.text}</p>
        </div>
      </div>
    ))}
  </div>
</section>

  );
}
