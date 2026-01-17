"use client"


import { useState, useEffect, useRef } from "react"
import "./gallery.css"

type Category = "Products" | "Workshop" | "Studio" | "Others"

type ImageItem = {
  _id: string
  src: string
  category: Category
  title: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"All" | Category>("All")
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      const mappedData = data.map((item: any) => ({
        _id: item._id,
        src: item.image,
        category: item.category === 'product' ? 'Products' :
                 item.category === 'workshop' ? 'Workshop' :
                 item.category === 'studio' ? 'Studio' : 'Others',
        title: item.title
      }))
      setImages(mappedData)
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const visibleImages = filter === "All" ? images : images.filter(i => i.category === filter)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImage) {
        if (e.key === 'Escape') {
          setActiveImage(null);
        } else if (e.key === 'ArrowLeft') {
          const currentIndex = visibleImages.findIndex(img => img._id === activeImage._id);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleImages.length - 1;
          setActiveImage(visibleImages[prevIndex]);
        } else if (e.key === 'ArrowRight') {
          const currentIndex = visibleImages.findIndex(img => img._id === activeImage._id);
          const nextIndex = currentIndex < visibleImages.length - 1 ? currentIndex + 1 : 0;
          setActiveImage(visibleImages[nextIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeImage, visibleImages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div style={{backgroundImage: 'url(/images/i2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh'}}>
      <main className="ms-root">
      <header className="ms-hero">
        <h1 className="ms-hero-title">Gallery — Work & Workshops</h1>
        <p className="ms-hero-sub">A curated collection of pieces, moments from our studio, and highlights from our workshops.</p>
      </header>

      <section className="ms-horizontal-carousel" aria-label="Continuous image carousel">
        <div className="ms-carousel-wrapper">
          <div className="ms-carousel-track">
            {/* Original images */}
            {images.map((img) => (
              <div 
                key={`carousel-${img._id}`} 
                className="ms-carousel-item" 
                onClick={() => setActiveImage(img)}
              >
                <img src={img.src} alt={img.title} loading="lazy" />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {images.map((img) => (
              <div 
                key={`carousel-duplicate-${img._id}`} 
                className="ms-carousel-item" 
                onClick={() => setActiveImage(img)}
              >
                <img src={img.src} alt={img.title} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ms-filters" role="tablist">
        {["All", "Products", "Workshop", "Studio", "Others"].map(f => (
          <button
            key={f}
            className={`filter-box ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f as any)}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>

      {activeImage && (
        <div className="ms-overlay" onClick={() => setActiveImage(null)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="ms-overlay-panel" onClick={e => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setActiveImage(null)}
              aria-label="Close gallery modal"
            >
              ✕
            </button>

            {/* Navigation arrows */}
            {visibleImages.length > 1 && (
              <>
                <button
                  className="nav-arrow nav-arrow-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = visibleImages.findIndex(img => img._id === activeImage._id);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleImages.length - 1;
                    setActiveImage(visibleImages[prevIndex]);
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="nav-arrow nav-arrow-right"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = visibleImages.findIndex(img => img._id === activeImage._id);
                    const nextIndex = currentIndex < visibleImages.length - 1 ? currentIndex + 1 : 0;
                    setActiveImage(visibleImages[nextIndex]);
                  }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <div className="overlay-content">
              <img src={activeImage.src} alt={activeImage.title} />
              <div className="overlay-text">
                <h2 id="modal-title">{activeImage.title}</h2>
                <p className="text-sm text-gray-600">{activeImage.category}</p>
                {visibleImages.length > 1 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {visibleImages.findIndex(img => img._id === activeImage._id) + 1} of {visibleImages.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="ms-image-grid" aria-label="Gallery images">
        {visibleImages.length > 0 ? (
          visibleImages.map(img => (
            <figure key={img._id} className="ms-image-card" onClick={() => setActiveImage(img)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveImage(img); } }} tabIndex={0} role="button" aria-label={`View ${img.title} in full size`}>
              <img src={img.src} alt={img.title} loading="lazy" />
              <figcaption className="ms-card-caption">
                <strong>{img.title}</strong>
                <span className="ms-card-cat">{img.category}</span>
              </figcaption>
            </figure>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No images found in this category.</p>
            <button
              onClick={() => setFilter("All")}
              className="mt-4 px-4 py-2 bg-[#3d2b1f] text-white rounded-lg hover:bg-[#2d2118] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d2b1f] focus:ring-offset-2"
            >
              View All Images
            </button>
          </div>
        )}
      </section>
      </main>
    </div>
  )
}