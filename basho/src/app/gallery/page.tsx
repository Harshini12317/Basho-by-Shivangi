"use client"

import { useState } from "react"
import "./gallery.css"

type Category = "Products" | "Workshop" | "Studio"

type ImageItem = {
  id: number
  src: string
  category: Category
  likes: number
  title: string
  description: string
}

const images: ImageItem[] = [
  {
    id: 1,
    src: "/images/pottery-hero.png",
    category: "Products",
    likes: 124,
    title: "Handcrafted Pottery",
    description: "Each piece is shaped by hand, celebrating natural textures and timeless forms."
  },
  {
    id: 2,
    src: "/images/pottery-hero.png",
    category: "Products",
    likes: 89,
    title: "Earth Toned Vessels",
    description: "Inspired by soil, fire, and tradition, these vessels bring warmth to any space."
  },
  {
    id: 3,
    src: "/images/pottery-hero.png",
    category: "Workshop",
    likes: 63,
    title: "Studio Workshop",
    description: "Moments from our hands-on pottery workshops where creativity takes shape."
  },
  {
    id: 4,
    src: "/images/pottery-hero.png",
    category: "Studio",
    likes: 91,
    title: "In the Studio",
    description: "A quiet look into the studio where ideas are formed and refined."
  }
]

export default function GalleryPage() {
  const [filter, setFilter] = useState<"All" | Category>("All")
  const [liked, setLiked] = useState<number[]>([])
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null)

  const visibleImages =
    filter === "All" ? images : images.filter(img => img.category === filter)

  const toggleLike = (id: number) => {
    setLiked(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  return (
    <main className="ms-root pt-24">
      {/* HERO */}
      <header className="ms-hero">
        <h1 className="ms-hero-title">Thoughtfully Crafted Experiences</h1>
      </header>

      {/* HORIZONTAL AUTO SCROLL */}
      <section className="ms-horizontal">
        <div className="ms-horizontal-track">
          {[...images, ...images].map((img, i) => (
            <div
              key={i}
              className="ms-horizontal-item"
              onClick={() => setActiveImage(img)}
            >
              <img src={img.src} alt={img.title} />
            </div>
          ))}
        </div>
      </section>

      {/* FILTERS */}
      <div className="ms-filters">
        {["All", "Products", "Workshop", "Studio"].map(f => (
          <button
            key={f}
            className={`filter-box ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f as "All" | Category)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* FEATURED (ENLARGED) VIEW */}
      {activeImage && (
  <div className="ms-overlay">
    <div className="ms-overlay-panel">
      <button
        className="close-btn"
        onClick={() => setActiveImage(null)}
        aria-label="Close preview"
      >
        ✕
      </button>

      <div className="overlay-content">
        <img
          src={activeImage.src}
          alt={activeImage.title}
        />

        <div className="overlay-text">
          <h2>{activeImage.title}</h2>
          <p>{activeImage.description}</p>

          <div className="featured-like">
            <button
              className={`like-btn ${
                liked.includes(activeImage.id) ? "liked" : ""
              }`}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                toggleLike(activeImage.id)
              }}
            >
              ♥
            </button>
            <span>
              {activeImage.likes +
                (liked.includes(activeImage.id) ? 1 : 0)}{" "}
              likes
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* GRID */}
      <section className="ms-image-grid">
        {visibleImages.map(img => (
          <figure
            key={img.id}
            className="ms-image-card"
            onClick={() => setActiveImage(img)}
          >
            <img src={img.src} alt={img.title} />

            <div
              className="ms-image-actions"
           onClick={(e: React.MouseEvent<HTMLDivElement>) => {
  e.stopPropagation()
}}

            >
             <button
  className={`like-btn ${liked.includes(img.id) ? "liked" : ""}`}
  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    toggleLike(img.id)
  }}
>
  ♥
</button>

              <span>
                {img.likes + (liked.includes(img.id) ? 1 : 0)}
              </span>
            </div>
          </figure>
        ))}
      </section>
    </main>
  )
}