import AboutHero from "@/components/about/AboutHero";
import AboutBrand from "@/components/about/AboutBrand";
import AboutJapaneseCulture from "@/components/about/AboutJapaneseCulture";
import AboutProducts from "@/components/about/AboutProducts";
import AboutProcess from "@/components/about/AboutProcess";
import AboutArtisanship from "@/components/about/AboutArtisanship";
import StudioPage from "@/app/studio/page" ;

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutBrand />
      <AboutJapaneseCulture />
      <AboutProducts />
      <AboutProcess />
      <AboutArtisanship />
      <StudioPage />
    </main>
  );
}
