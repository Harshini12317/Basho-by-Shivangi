'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { FiArrowRight } from 'react-icons/fi';

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
        className="hero hero-submerged relative min-h-[70vh]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(237,216,180,0.22)), url("/images/pottery-hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto max-w-7xl px-10 pt-8">
         <div className="min-h-[60vh] grid grid-cols-1 lg:grid-cols-2 items-center">

           <div className="hero-content max-w-xl ml-auto text-left lg:text-right">

              <p className="hero-badge">FLAT 25% DISCOUNT</p>
              <h1 className="text-5xl font-medium leading-tight text-[var(--text-primary)]">
                Multipurpose Ceramic<br />Dotted Kitchen
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)]">
                Calm, balanced tableware designed for modern homes. Crafted with food-safe glazes and artisanal care.
              </p>
              <div className="mt-10 flex gap-4 justify-end">
                <button className="hero-cta inline-flex items-center rounded-full px-8 py-4 text-base font-medium text-white">
                  Get Started
                  <FiArrowRight style={{ marginLeft: 8 }} />
                </button>
                <button className="inline-flex items-center rounded-full px-8 py-4 text-base font-medium border border-[rgba(42,31,23,0.12)] text-[var(--text-primary)] bg-white">
                  Browse
                </button>
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
