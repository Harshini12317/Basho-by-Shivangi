import HeroPot from "@/components/HeroPot";
import GsapSlider from "@/components/GsapSlider";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";


export default function Home() {
  return (
    <>
      {/* ================= HERO SECTION (UNCHANGED) ================= */}
      <section className="relative min-h-screen">
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
                  className="
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
            </div>

            {/* RIGHT — 3D POT */}
            <div className="flex justify-center lg:justify-end">
              <HeroPot />
            </div>

          </div>
        </div>
      </section>

      {/* ================= GSAP PRODUCT SLIDER ================= */}
      <GsapSlider />
      <FeaturesSection />
      
      
    </>
  );
}
