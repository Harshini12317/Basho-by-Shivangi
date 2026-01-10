"use client"


import { useState, useEffect } from "react"
import "./gallery.css"

type Category = "Products" | "Workshop" | "Studio"

type ImageItem = {
  id: number
  src: string
  category: Category
  title: string
  description?: string
}

const images: ImageItem[] = [
  { id: 1, src: "/images/pottery-hero.png", category: "Products", title: "Handcrafted Pottery" },
  { id: 2, src: "/images/img10.png", category: "Products", title: "Earth Toned Vessels" },
  { id: 3, src: "/images/img12.png", category: "Workshop", title: "Studio Workshop" },
  { id: 4, src: "/images/img13.png", category: "Studio", title: "In the Studio" }
]

export default function GalleryPage() {
  const [filter, setFilter] = useState<"All" | Category>("All")
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null)
  const [tick, setTick] = useState(0)

  const visibleImages = filter === "All" ? images : images.filter(i => i.category === filter)

  // simple timer to advance horizontal marquee animation starting point (keeps it lively)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="ms-root">
      <header className="ms-hero">
        <h1 className="ms-hero-title">Gallery — Work & Workshops</h1>
        <p className="ms-hero-sub">A curated collection of pieces, moments from our studio, and highlights from our workshops.</p>
      </header>

      <section className="ms-horizontal" aria-hidden>
        <div className={`ms-horizontal-track animate-${tick % 2}`}>
          {images.concat(images).map((img, i) => (
            <div key={i} className="ms-horizontal-item" onClick={() => setActiveImage(img)}>
              <img src={img.src} alt={img.title} />
            </div>
          ))}
        </div>
      </section>

      <div className="ms-filters" role="tablist">
        {["All", "Products", "Workshop", "Studio"].map(f => (
          <button key={f} className={`filter-box ${filter === f ? "active" : ""}`} onClick={() => setFilter(f as any)}>
            {f}
          </button>
        ))}
      </div>

      {activeImage && (
        <div className="ms-overlay" onClick={() => setActiveImage(null)}>
          <div className="ms-overlay-panel" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setActiveImage(null)} aria-label="Close">✕</button>
            <div className="overlay-content">
              <img src={activeImage.src} alt={activeImage.title} />
              <div className="overlay-text">
                <h2>{activeImage.title}</h2>
                {activeImage.description && <p>{activeImage.description}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="ms-image-grid">
        {visibleImages.map(img => (
          <figure key={img.id} className="ms-image-card" onClick={() => setActiveImage(img)}>
            <img src={img.src} alt={img.title} />
            <figcaption className="ms-card-caption">
              <strong>{img.title}</strong>
              <span className="ms-card-cat">{img.category}</span>
            </figcaption>
          </figure>
        ))}
      </section>
    </main>
  )
}