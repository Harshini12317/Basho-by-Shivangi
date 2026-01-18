"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./GsapSlider.css";

gsap.registerPlugin(ScrollTrigger);

interface SliderImage {
  _id?: string;
  imageUrl: string;
  altText?: string;
  title?: string;
  description?: string;
}

const DEFAULT_SLIDER_IMAGES = [
  { imageUrl: '/images/pottery-hero.png', altText: 'Slider Image 1' },
  { imageUrl: '/images/p1.png', altText: 'Slider Image 2' },
  { imageUrl: '/images/common.png', altText: 'Slider Image 3' },
  { imageUrl: '/images/p2.jpg', altText: 'Slider Image 4' },
  { imageUrl: '/images/common3.png', altText: 'Slider Image 5' },
  { imageUrl: '/images/p3.jpg', altText: 'Slider Image 6' },
  { imageUrl: '/images/product1.png', altText: 'Slider Image 7' },
  { imageUrl: '/images/p4.jpg', altText: 'Slider Image 8' },
  { imageUrl: '/images/product2.png', altText: 'Slider Image 9' },
];

export default function GsapSlider() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [typedText, setTypedText] = useState("");
  const [sliderImages, setSliderImages] = useState<SliderImage[]>(DEFAULT_SLIDER_IMAGES);
  const phrases = ["Welcome to Basho!!", "Each piece is handcrafted with passion and care.", "Discover timeless pottery..", "We celebrate the beauty of imperfection in clay.", "Custom creations made for you.", "Feel the joy of handmade pottery.", "Crafted by skilled hands.", "Transform your space with bespoke ceramics.", "Where tradition meets contemporary design.", "Every piece tells a unique story.", "Bringing pottery into your everyday moments.", "Creating heirlooms meant to be cherished forever."];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const typingTimeoutRef = useRef<number | null>(null);
  const phraseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Fetch home page content to get dynamic images
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/homepage');
        const data = await response.json();
        
        if (data.gsapSlider && data.gsapSlider.length > 0) {
          const activeImages = data.gsapSlider
            .filter((img: any) => img.isActive)
            .sort((a: any, b: any) => a.order - b.order);
          setSliderImages(activeImages);
        }
      } catch (error) {
        console.error('Error fetching home page content:', error);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    let index = 0;
    const fullText = phrases[currentPhraseIndex];

    const typeWriter = () => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index += 1;
        typingTimeoutRef.current = window.setTimeout(typeWriter, 150);
      } else {
        phraseTimeoutRef.current = window.setTimeout(() => {
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 1500);
      }
    };

    typeWriter();

    return () => {
      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      if (phraseTimeoutRef.current !== null) {
        window.clearTimeout(phraseTimeoutRef.current);
      }
    };
  }, [currentPhraseIndex, phrases.length]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const cards = cardsRef.current;
    const total = cards.length;

    const state = {
      rotation: 0,
      dragRotation: 0,
    };

    const getRadius = () => {
      const size = wrapper.offsetWidth;
      return size / 2.4;
    };

    const update = () => {
      const radius = getRadius();

      cards.forEach((card, i) => {
        const spread = 370;
        const angle =
          (spread / total) * i +
          state.rotation +
          state.dragRotation;

        const rad = (angle * Math.PI) / 180;

        gsap.set(card, {
          x: Math.cos(rad) * radius,
          y: Math.sin(rad) * radius,
          rotate: angle + 90,
        });
      });
    };

    update();

    const scrollTrigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        state.rotation = self.progress * 360;
        update();
      },
    });

    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX;
      state.dragRotation = deltaX * 0.35;
      update();
    };

    const handleTouchEnd = () => {
      gsap.to(state, {
        dragRotation: 0,
        duration: 1,
        ease: "power3.out",
        onUpdate: update,
      });
    };

    wrapper.addEventListener("touchstart", handleTouchStart);
    wrapper.addEventListener("touchmove", handleTouchMove);
    wrapper.addEventListener("touchend", handleTouchEnd);

    const handleResize = () => update();
    window.addEventListener("resize", handleResize);

    return () => {
      scrollTrigger.kill();

      window.removeEventListener("resize", handleResize);

      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <section className="gsap-slider-section">
      <div className="gsap-slider-grid">
        <div ref={wrapperRef} className="gsap-slider-circle">
          <div className="gsap-slider-text">
            {typedText}
            <span className="typewriter-cursor">|</span>
          </div>

          {sliderImages.map((image, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="gsap-slider-card"
            >
              <img
                src={image.imageUrl}
                alt={image.altText || "Slider Image"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
