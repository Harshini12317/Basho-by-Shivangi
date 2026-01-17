import AboutHero from "@/components/about/AboutHero";
import AboutPhilosophy from "@/components/about/AboutPhilosophy";
import AboutProcess from "@/components/about/AboutProcess";
import AboutTeamSlider from "@/components/about/AboutTeamSlider";
import StudioPage from "@/app/studio/page";

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutPhilosophy />
      <AboutProcess />
      <AboutTeamSlider />
      <StudioPage />
    </main>
  );
}
