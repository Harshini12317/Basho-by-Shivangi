'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic imports for heavy components
const HeroPot = dynamic(() => import('@/components/HeroPot'), {
  loading: () => <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />,
  ssr: true,
});

const GsapSlider = dynamic(() => import('@/components/GsapSlider'), {
  loading: () => <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />,
  ssr: false, // This is animation-heavy
});

const FeaturesSection = dynamic(() => import('@/components/FeaturesSection'), {
  loading: () => <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />,
  ssr: true,
});

export default function Home() {
  return (
    <>
      <section className="hero relative min-h-screen">
        <div className="mx-auto max-w-7xl px-10 pt-8">
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            
            {/* LEFT — TEXT */}
            <div className="max-w-xl">
              <h1 className="text-5xl font-medium leading-tight text-[var(--text-primary)]">
                Experience the Artistry <br />
                of Handmade Pottery
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)]">
                Discover the beauty and craftsmanship of Basho, where every
                piece is thoughtfully handcrafted to bring warmth, balance,
                and quiet elegance into your living space.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  className="hero-cta
                    inline-flex items-center
                    rounded-full
                    bg-[var(--accent-clay)]
                    px-8 py-4
                    text-base font-medium
                    text-white
                    transition-transform
                    hover:scale-[1.03]
                  "
                >
                  Explore Collection
                </button>
              </div>

              <div className="trust-strip">
                <span>✔ Handmade</span>
                <span>✔ Food-safe glazes</span>
                <span>✔ Crafted in India</span>
              </div>
            </div>

            {/* RIGHT — 3D POT */}
            <div className="hero-image flex justify-center lg:justify-end">
              <Suspense fallback={<div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />}>
                <HeroPot />
              </Suspense>
            </div>

          </div>
        </div>
        <div className="scroll-hint">Scroll</div>
      </section>

      {/* ================= GSAP PRODUCT SLIDER ================= */}
      <Suspense fallback={<div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />}>
        <GsapSlider />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse" />}>
        <FeaturesSection />
      </Suspense>
      
    </>
  );
}
