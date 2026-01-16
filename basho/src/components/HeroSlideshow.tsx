'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const SLIDESHOW_IMAGES = [
  '/images/product1.png',
  '/images/p1.png',
  '/images/p2.jpg',
  '/images/p3.jpg',
  '/images/p4.jpg',
  '/images/pottery-hero.png',
  '/images/common.png',
  '/images/common3.png',
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDESHOW_IMAGES.length) % SLIDESHOW_IMAGES.length);
    setIsAutoPlay(false);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px] flex items-center justify-center group order-1 lg:order-1">
      {/* Main Slideshow Container */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
        {/* Slides */}
        {SLIDESHOW_IMAGES.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/product1.png';
              }}
            />
          </div>
        ))}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none"></div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-[var(--text-primary)] rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-[var(--text-primary)] rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {SLIDESHOW_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'bg-white w-8 h-2 shadow-lg'
                  : 'bg-white/50 hover:bg-white/75 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Autoplay indicator */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg flex items-center gap-2 ${
              isAutoPlay
                ? 'bg-white/90 hover:bg-white'
                : 'bg-[var(--accent-clay)]/90 hover:bg-[var(--accent-clay)]'
            }`}
            aria-label={isAutoPlay ? 'Pause autoplay' : 'Play autoplay'}
          >
            {isAutoPlay ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#8E5022' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span style={{ color: '#8E5022' }}>Auto</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#fff' }}>
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span style={{ color: '#fff' }}>Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating decorative element */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-[rgba(237,216,180,0.3)] to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-20 -left-20 w-32 h-32 bg-gradient-to-br from-[rgba(199,107,63,0.2)] to-transparent rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
