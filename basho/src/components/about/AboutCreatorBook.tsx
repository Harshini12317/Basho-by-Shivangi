"use client";

import { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./AboutCreatorBook.css";

gsap.registerPlugin(ScrollTrigger);

export default function AboutCreatorBook() {
useEffect(() => {
  const spread1 = document.querySelector<HTMLElement>(".spread-1");
  const spread2 = document.querySelector<HTMLElement>(".spread-2");

  if (!spread1 || !spread2) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".book-stage",
      start: "top top",
      end: "+=300%",
      scrub: true,
      pin: true,
      invalidateOnRefresh: true,
    },
  });

  // Spread 1: flip pages inward and then move up to reveal next spread
  const s1Left = spread1.querySelector<HTMLElement>(".page-left");
  const s1Right = spread1.querySelector<HTMLElement>(".page-right");

    if (s1Left && s1Right) {
    // initial readable pause
    tl.to({}, { duration: 0.25 });

    // flip pages inward (left -> open right, right -> open left)
    tl.to(
      s1Left,
      { rotateY: 110, transformOrigin: "right center", ease: "none", duration: 0.7 },
      "flip1"
    );
    tl.to(
      s1Right,
      { rotateY: -110, transformOrigin: "left center", ease: "none", duration: 0.7 },
      "flip1"
    );

    // reveal the page content slightly as it opens
    tl.to(
      s1Right.querySelectorAll<HTMLElement>(".page-content, img"),
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 },
      "flip1+=0.05"
    );

    // give a moment then slide spread1 up so spread2 becomes visible
    tl.to({}, { duration: 0.2 });
    tl.to(spread1, { y: "-100%", ease: "none", duration: 0.6 });
  }

    // Spread 2: when revealed, flip its pages inward as well
  const s2Left = spread2.querySelector<HTMLElement>(".page-left");
  const s2Right = spread2.querySelector<HTMLElement>(".page-right");

  if (s2Left && s2Right) {
      // Ensure spread2 stays visually below spread1 until spread1 moves away
      tl.set(spread2, { zIndex: 1 });
      tl.set(spread1, { zIndex: 2 });

      // small pause after reveal
      tl.to({}, { duration: 0.15 });

      tl.to(s2Left, { rotateY: 110, transformOrigin: "right center", ease: "none", duration: 0.7 }, "+=0");
      tl.to(s2Right, { rotateY: -110, transformOrigin: "left center", ease: "none", duration: 0.7 }, "<");

      tl.to(s2Right.querySelectorAll<HTMLElement>(".page-content, img"), { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }, "+=0.05");
  }

  // final small pause
  tl.to({}, { duration: 0.2 });

  return () => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    tl.kill();
  };
}, []);



  return (
    <section className="book-stage">
      <div className="book">

        {/* ================= SPREAD 1 ================= */}
        <div className="spread spread-1">

          <div className="page page-left">
            <Image src="/images/pottery-hero.png" alt="Shivangi" fill />
            <div className="page-content left">
              <h2>Shivangi</h2>
              <span>Founder · Basho</span>
              <p>
                Rooted in Japanese pottery traditions and slow craft,
                embracing imperfection and quiet presence.
              </p>
            </div>
          </div>

          <div className="spine" />

          <div className="page page-right">
            <Image src="/images/pottery-hero.png" alt="Aarav" fill />
            <div className="page-content right">
              <h2>Aarav</h2>
              <span>Ceramic Artist</span>
              <p>
                Focused on balance, rhythm, and raw clay textures.
                Pottery that feels lived-in, not pristine.
              </p>
            </div>
          </div>

        </div>

        {/* ================= SPREAD 2 ================= */}
        <div className="spread spread-2">

          <div className="page page-left">
            <Image src="/images/pottery-hero.png" alt="Meera" fill />
            <div className="page-content left">
              <h2>Meera</h2>
              <span>Glaze Specialist</span>
              <p>
                Works with natural ash glazes and firing variations,
                allowing fire to define the final form.
              </p>
            </div>
          </div>

          <div className="spine" />

          <div className="page page-right">
            <Image src="/images/pottery-hero.png" alt="Riku" fill />
            <div className="page-content right">
              <h2>Riku</h2>
              <span>Wheel Specialist</span>
              <p>
                Inspired by repetition and movement found in
                traditional Japanese wheel work.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
