export const workshops = [
  {
    slug: "cobalt-botanical",
    title: "Cobalt Botanical",
    image: "/images/img4.png",
    description: "In this session, you'll learn professional glazing techniques and surface decoration on stoneware.",
  },
  {
    slug: "crimson-flora",
    title: "Crimson Flora",
    image: "/images/img3.png",
    description: "Explore vibrant color techniques and floral design patterns in ceramic art.",
  },
  {
    slug: "rose-garden",
    title: "Tropical Teal",
    image: "/images/img2.png",
    description: "Master tropical-inspired glazing and hand-painting techniques on stoneware.",
  },
  {
    slug: "sage-minimalist",
    title: "Sage Minimalist",
    image: "/images/img18.png",
    description: "Learn minimalist design principles and sage-tone glazing for contemporary pottery.",
  },
  {
    slug: "wildflower-amber",
    title: "Wildflower Amber",
    image: "/images/img9.png",
    description: "Create beautiful wildflower-inspired designs using amber glazes and surface techniques.",
  },
  {
    slug: "matcha-ceremony",
    title: "Matcha Ceremony",
    image: "/images/img33.png",
    description: "Learn traditional Japanese ceramic techniques used in matcha ceremony vessels.",
  },
];

export function getWorkshopBySlug(slug: string | string[] | undefined) {
  const slugStr = typeof slug === "string" ? slug : slug?.[0] || "";
  return workshops.find((w: { slug: string; title: string; image: string; description: string }) => w.slug === slugStr);
}
