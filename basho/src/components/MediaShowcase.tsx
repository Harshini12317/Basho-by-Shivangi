"use client"
import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import './MediaShowcase.css'
import Link from 'next/link'
import { colors } from '../constants/colors'
import { useSearchParams } from 'next/navigation'

export default function MediaShowcase() {
  const images = [
    // Products
    { src: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
    { src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
    { src: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
    { src: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
    { src: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1200&q=80&auto=format&fit=crop', category: 'Products' },
    // Workshop
    { src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
    { src: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
    { src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
    { src: 'https://images.unsplash.com/photo-1475688621402-6a9e6d4d2b97?w=1200&q=80&auto=format&fit=crop', category: 'Workshop' },
    // Studio & Events
    { src: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1200&q=80&auto=format&fit=crop', category: 'Studio' },
    { src: 'https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=1200&q=80&auto=format&fit=crop', category: 'Studio' },
    { src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80&auto=format&fit=crop', category: 'Studio' },
    { src: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200&q=80&auto=format&fit=crop', category: 'Studio' }
  ]

  const videoEmbeds = [
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/3JZ_D3ELwOQ',
    'https://www.youtube.com/embed/jNQXAC9IVRw',
    'https://www.youtube.com/embed/9bZkp7q19f0',
    'https://www.youtube.com/embed/kJQP7kiw5Fk',
    'https://www.youtube.com/embed/fJ9rUzIMcZQ'
  ]

  const initialTestimonials = [
    { who: 'Asha K.', text: 'Beautiful craftsmanship — I love my piece!', rating: 5 },
    { who: 'Ravi M.', text: 'Great workshop, learned so much in a single day.', rating: 5 },
    { who: 'Priya S.', text: 'Friendly team and excellent service.', rating: 4 }
  ]

  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [tab, setTab] = useState<'Gallery'|'Media'>('Gallery')
  const [filter, setFilter] = useState<'All'|'Products'|'Workshop'|'Studio'>('All')
  const [reviewSending, setReviewSending] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const t = searchParams?.get('tab')
    if (t === 'Media' || t === 'Gallery') setTab(t)
  }, [searchParams])

  const visibleImages = images.filter(i => filter === 'All' ? true : i.category === filter)

  return (
    <section className="ms-root serif">
      <style>{`
        :root{
          --c-1: ${colors[0].hex};
          --c-2: ${colors[1].hex};
          --c-3: ${colors[2].hex};
          --c-4: ${colors[3].hex};
          --c-5: ${colors[4].hex};
          --text-color: ${colors[0].hex};
          --muted: ${colors[1].hex}33;
        }
      `}</style>

      <div className="ms-hero">
        <div className="ms-hero-background-icons">
          <div className="ms-bg-icon ms-icon-1">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div className="ms-bg-icon ms-icon-2">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="ms-bg-icon ms-icon-3">
            <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
          </div>
          <div className="ms-bg-icon ms-icon-4">
            <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="ms-bg-icon ms-icon-5">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
        </div>
        <div className="ms-hero-content">
          <div className="ms-hero-icons-top">
            <div className="ms-top-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div className="ms-top-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <div className="ms-top-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
          </div>
          <h1 className="ms-hero-title">Media & Galleries</h1>
          <p className="ms-hero-sub">Explore product photography, workshop moments, and studio events.</p>
          <div className="ms-feature-rotator" aria-hidden>
            <span>Beautiful product detail shots</span>
            <span>Hands-on workshop moments</span>
            <span>Customer reviews & stories</span>
            <span>Studio events & pop-ups</span>
          </div>
        </div>
        <div className="ms-cta">
          <Link href="/custom-order" className="ms-btn">Request a custom piece</Link>
        </div>
      </div>

      {/* Tabs removed: use separate routes (/gallery and /media) to switch views */}

      {tab === 'Gallery' && (
        <div className="ms-gallery-area">
          <div className="ms-gallery-background">
            <div className="ms-gallery-bg-shape ms-gb-shape-1"></div>
            <div className="ms-gallery-bg-shape ms-gb-shape-2"></div>
            <div className="ms-gallery-bg-shape ms-gb-shape-3"></div>
            <div className="ms-gallery-bg-shape ms-gb-shape-4"></div>
            <div className="ms-gallery-bg-shape ms-gb-shape-5"></div>
            <div className="ms-gallery-bg-shape ms-gb-shape-6"></div>
          </div>
          <div className="ms-filters">
            {['All','Products','Workshop','Studio'].map((f:any) => (
              <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="ms-image-grid">
            {visibleImages.map((img, i) => (
              <figure key={i} className="ms-image-card">
                <div className="ms-image-overlay">
                  <svg className="ms-card-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <img src={img.src} alt={`${img.category}-${i}`} />
              </figure>
            ))}
          </div>
        </div>
      )}

      {tab === 'Media' && (
        <div className="ms-media-area">
          <div className="ms-media-background">
            <div className="ms-media-bg-shape ms-mb-shape-1"></div>
            <div className="ms-media-bg-shape ms-mb-shape-2"></div>
            <div className="ms-media-bg-shape ms-mb-shape-3"></div>
            <div className="ms-media-bg-shape ms-mb-shape-4"></div>
            <div className="ms-media-bg-shape ms-mb-shape-5"></div>
            <div className="ms-media-bg-shape ms-mb-shape-6"></div>
          </div>
          <h2 className="ms-gallery-title ms-video-title">
            <svg className="ms-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Video Testimonials
          </h2>
          <div className="ms-video-grid">
            {videoEmbeds.map((src, i) => (
              <div className="msp-video" key={i}>
                <iframe src={src} title={`video-${i}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ))}
          </div>

          <div className="ms-reviews-wrapper">
            <h2 className="ms-gallery-title ms-reviews-title">
              <svg className="ms-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
              Customer Reviews
            </h2>
            <div className="ms-test-grid">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="ms-test">
                  <svg className="ms-quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                  </svg>
                  <p>{t.text}</p>
                  <footer>
                    <svg className="ms-user-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="ms-reviewer-name">{t.who}</span>
                    <span className="ms-stars">{'★'.repeat(t.rating)}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="ms-review-section">
            <h3 className="ms-review-form-title">
              <svg className="ms-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Leave a review
            </h3>
            <form className="ms-review-form" onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const fd = new FormData(form)
              const payload = {
                who: (fd.get('who')||'').toString(),
                email: (fd.get('email')||'').toString(),
                text: (fd.get('text')||'').toString(),
                rating: Number(fd.get('rating')||5)
              }
              setReviewSending(true)
              try {
                const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
                if (res.ok) {
                  const safe = { who: payload.who, text: payload.text, rating: payload.rating }
                  setTestimonials(prev => [safe, ...prev])
                  form.reset()
                } else {
                  console.error('Review submit failed')
                }
              } catch (err) {
                console.error(err)
              } finally {
                setReviewSending(false)
              }
            }}>
              <div className="ms-form-grid">
                <label>
                  <span>
                    <svg className="ms-label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Name
                  </span>
                  <input name="who" className="form-bg" required />
                </label>
                <label>
                  <span>
                    <svg className="ms-label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                  </span>
                  <input name="email" type="email" className="form-bg" />
                </label>
                <label>
                  <span>
                    <svg className="ms-label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Rating
                  </span>
                  <select name="rating" defaultValue="5" className="form-bg">
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </label>
              </div>
              <label className="ms-textarea-label">
                <span>
                  <svg className="ms-label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Message
                </span>
                <textarea name="text" className="form-bg" required />
              </label>
              <div className="ms-submit-wrapper">
                <button type="submit" className="ms-btn-primary" disabled={reviewSending}>
                  <svg className="ms-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  {reviewSending? 'Sending...':'Submit review'}
                </button>
              </div>
            </form>
          </div>

          <div className="ms-custom-section">
            <h2 className="ms-gallery-title ms-custom-title" style={{marginTop:'1.25rem'}}>
              <svg className="ms-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Custom Creations
            </h2>
            <div className="ms-custom-grid">
              {[
                { id:1, name: 'Wedding Vase', images: ['/images/product1.png'] },
                { id:2, name: 'Coffee Mug Set', images: ['/images/product2.png'] },
                { id:3, name: 'Dinnerware Set', images: ['/images/product1.png'] }
              ].map(c => (
                <div key={c.id} className="ms-custom-card">
                  <div className="ms-custom-card-overlay">
                    <svg className="ms-custom-card-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <img src={c.images[0]} alt={c.name} />
                  <div className="ms-custom-info">
                    <h4 className="serif">{c.name}</h4>
                    <Link href="/custom-order" className="ms-btn" style={{marginTop:'.5rem'}}>Request Similar</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  )
}
