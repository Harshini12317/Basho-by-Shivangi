"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import "./AboutProcess.css";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Handcrafted by the Artisan",
    text:
      "Every piece is shaped by hand, not machines, guided by years of practice and intuition.",
    imageSrc: "/images/t0.png",
    imageAlt: "Handcrafted icon",
  },
  {
    title: "Prepared Clay",
    text:
      "Meticulously wedged and prepared for the wheel, ensuring purity and readiness.",
    imageSrc: "/images/t1.png",
    imageAlt: "Prepared clay icon",
  },
  {
    title: "Shaped with Care",
    text:
      "Gently formed on the wheel and refined by hand, balancing artistry with skilled technique.",
    imageSrc: "/images/t2.png",
    imageAlt: "Shaped with care icon",
  },
  {
    title: "Carefully Fired",
    text:
      "Heated slowly in the kiln, ensuring each piece is sturdy, durable, and unique.",
    imageSrc: "/images/t3.png",
    imageAlt: "Carefully fired icon",
  },
];

export default function AboutProcess() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray(".process-row") as HTMLElement[];
      gsap.set(rows, { opacity: 0, y: 60 });

      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
              toggleActions: "play reverse play reverse",
              invalidateOnRefresh: true,
            },
          }
        );

        const dot = row.querySelector(".timeline-dot");
        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0.7, opacity: 0.6 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
              scrollTrigger: {
                trigger: row,
                start: "top 85%",
                toggleActions: "play reverse play reverse",
                invalidateOnRefresh: true,
              },
            }
          );
        }

        const icon = row.querySelector(".process-icon-img");
        if (icon) {
          gsap.fromTo(
            icon,
            { opacity: 0.85 },
            {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: row,
                start: "top 85%",
                toggleActions: "play reverse play reverse",
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="process-section" ref={sectionRef}>
      <div className="process-header">
        <h2>Crafted with care</h2>
        <h3>by skilled hands</h3>
        <div className="header-image-container">
          <Image
            src="/images/t0.png"
            alt="Pottery Wheel"
            width={260}
            height={160}
            className="process-hero-img"
          />
        </div>
      </div>

      <div className="process-timeline-container">
        <div className="process-timeline-line"></div>

        {steps.map((step, index) => (
          <div key={index} className="process-row">
            <div className="timeline-marker">
              <div className="timeline-dot"></div>
              <div className="timeline-connector"></div>
            </div>

            <div className="process-card">
              <div className="process-icon-wrapper">
                <Image
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  width={80}
                  height={80}
                  className="process-icon-img"
                />
              </div>
              <div className="process-content">
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
