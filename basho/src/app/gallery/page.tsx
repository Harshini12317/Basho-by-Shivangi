"use client"
import { useState } from 'react'
import './gallery.css'
import { colors } from '../../constants/colors'

const images = [
  { src: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
  { src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
  { src: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
  { src: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
  { src: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
  { src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
  { src: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
  { src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
  { src: 'https://images.unsplash.com/photo-1475688621402-6a9e6d4d2b97?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
  { src: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1200&q=80&auto=format&fit=crop', category: 'Studio' },
  { src: 'https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=1200&q=80&auto=format&fit=crop', category: 'Studio' },
  { src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80&auto=format&fit=crop', category: 'Studio' },
  { src: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200&q=80&auto=format&fit=crop', category: 'Studio' }
]

export default function GalleryPage(){
  const [filter, setFilter] = useState<'All'|'Products'|'Workshop'|'Studio'>('All')
  const visible = images.filter(i => filter === 'All' ? true : i.category === filter)

  return (
    <main className="ms-root serif">
      <style>{`
        :root{
          --c-1: ${colors[0].hex};
          --c-2: ${colors[1].hex};
          --c-3: ${colors[2].hex};
          --c-4: ${colors[3].hex};
          --c-5: ${colors[4].hex};
        }
      `}</style>

      <header className="ms-hero">
        <div>
          <h1 className="ms-hero-title">Gallery</h1>
          <p className="ms-hero-sub">Photos — products, workshops, and events.</p>
        </div>
      </header>

      <section className="ms-gallery-area">
        <div className="ms-filters">
          {['All','Products','Workshop','Studio'].map((f:any) => (
            <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="ms-image-grid">
          {visible.map((img, i) => (
            <figure key={i} className="ms-image-card">
              <img src={img.src} alt={`${img.category}-${i}`} />
            </figure>
          ))}
        </div>
      </section>
    </main>
  )
}
