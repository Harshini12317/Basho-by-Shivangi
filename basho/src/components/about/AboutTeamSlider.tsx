"use client";

import "./AboutTeamSlider.css";

const teamMembers = [
  {
    id: 1,
    name: "Shivangi",
    role: "Founder · Basho",
    description: "Rooted in Japanese pottery traditions and slow craft, embracing imperfection and quiet presence.",
    image: "/images/pottery-hero.png"
  },
  {
    id: 2,
    name: "Meera",
    role: "Glaze Specialist",
    description: "Works with natural ash glazes and firing variations, allowing fire to define the final form.",
    image: "/images/pottery-hero.png"
  },
  {
    id: 3,
    name: "Riku",
    role: "Wheel Specialist",
    description: "Inspired by repetition and movement found in traditional Japanese wheel work.",
    image: "/images/pottery-hero.png"
  },
  {
    id: 4,
    name: "Aarav",
    role: "Ceramic Artist",
    description: "Focused on balance, rhythm, and raw clay textures. Pottery that feels lived-in, not pristine.",
    image: "/images/pottery-hero.png"
  }
];

export default function AboutTeamSlider() {
  return (
    <section className="team-slider-section">
      <div className="container mx-auto px-6">
        <div className="team-slider-header">
          <h2>Meet Our Founder</h2>
        </div>
        <div className="founder-story-image">
          <img src="/images/bashostory1.jpg" alt="Basho Founder Story" />
        </div>
      </div>
    </section>
  );
}
