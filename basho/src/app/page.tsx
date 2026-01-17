'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import HeroSlideshow from '@/components/HeroSlideshow';

const GsapSlider = dynamic(() => import('@/components/GsapSlider'), {
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />
  ),
  ssr: false,
});

const FeaturesSection = dynamic(() => import('@/components/FeaturesSection'), {
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />
  ),
  ssr: true,
});

export default function Home() {
  return (
    <>
      <section
        className="hero hero-submerged relative min-h-screen w-full flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(237,216,180,0.18)), url("/images/i2.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none"></div>
        
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 py-10 lg:py-16 w-full relative z-10">
         <div className="min-h-[60vh] grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">

           <HeroSlideshow />

           <div className="hero-content max-w-xl mx-auto lg:ml-0 lg:mr-auto text-center lg:text-left order-2 lg:order-2">

              <p className="hero-kicker text-sm sm:text-base font-medium tracking-[0.18em] uppercase text-[var(--accent-clay)] mb-2">
                Thoughtfully shaped. Quietly powerful.
              </p>

              <p className="hero-badge inline-block mb-4 sm:mb-6 hover:scale-105 transition-transform duration-300">
                FLAT 25% DISCOUNT
              </p>
              
              <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight text-[var(--text-primary)] mb-6 sm:mb-8">
                Multipurpose Ceramic<br className="hidden sm:block" />Dotted Kitchen
              </h1>
              
              <p className="hero-body mt-6 text-base sm:text-lg leading-relaxed text-[var(--text-muted)] max-w-md mx-auto lg:mx-0 mb-8 sm:mb-10">
                Calm, balanced tableware designed for modern homes. Crafted with food-safe glazes and artisanal care.
              </p>
              
              <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth">
                  <button className="hero-cta inline-flex items-center justify-center rounded-full px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95 whitespace-nowrap group w-full sm:w-auto">
                    Get Started
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                
                <Link href="/products">
                  <button className="inline-flex items-center justify-center rounded-full px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 border-[rgba(42,31,23,0.15)] text-[var(--text-primary)] bg-white/85 backdrop-blur-sm hover:bg-white hover:border-[rgba(42,31,23,0.25)] shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 whitespace-nowrap w-full sm:w-auto">
                    Browse
                  </button>
                </Link>
              </div>

              <div className="trust-strip">
                <span>Handmade in India</span>
                <span>Food-safe glazes</span>
                <span>Small-batch crafted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />
        }
      >
      <section className="relative z-10 mt-24 overflow-hidden">
      <GsapSlider />
     </section>

      </Suspense>

      <Suspense
        fallback={
          <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />
        }
      >
        <FeaturesSection />
      </Suspense>
    </>
  );
}
