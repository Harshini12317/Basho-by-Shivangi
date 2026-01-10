"use client"
import { useState, useEffect, useRef } from 'react'
import './TestimonialsShowcase.css'
import { colors } from '../constants/colors'
import { FiPlay, FiChevronLeft, FiChevronRight, FiMessageSquare, FiUpload, FiStar, FiCheckCircle } from 'react-icons/fi'

interface Testimonial {
  who: string;
  text: string;
  rating: number;
  image?: string;
}

interface VideoTestimonial {
  who: string;
  description: string;
  videoUrl: string;
}

export default function TestimonialsShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [formSending, setFormSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textTestimonials: Testimonial[] = [
    { who: 'Asha K.', text: 'Beautiful craftsmanship — I love my piece! The textures are so unique and bring such a natural feel to my home.', rating: 5, image: '/images/product1.png' },
    { who: 'Ravi M.', text: 'Great workshop, learned so much in a single day. The instructor was very patient and explained the techniques perfectly.', rating: 5, image: '/images/product2.png' },
    { who: 'Priya S.', text: 'Friendly team and excellent service. My custom order arrived perfectly packaged and even more beautiful than the photos.', rating: 5, image: '/images/img10.png' },
    { who: 'Ananya R.', text: 'The custom vase I ordered exceeded all my expectations. Truly a work of art that stands out in my living room.', rating: 5, image: '/images/img12.png' },
    { who: 'Vikram S.', text: 'Basho captures the soul of pottery. Every piece tells a story of tradition and contemporary elegance.', rating: 5, image: '/images/img13.png' }
  ];

  const videoTestimonials: VideoTestimonial[] = [
    { 
      who: 'Meera J.', 
      description: 'The workshop was a meditative experience. I never thought I could create something so beautiful with my own hands. The guidance was exceptional and the environment so peaceful.', 
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' 
    },
    { 
      who: 'Suresh B.', 
      description: 'I commissioned a set of dinnerware for my new home. The attention to detail and the warm clay tones have transformed my dining experience. Every meal feels like a celebration now.', 
      videoUrl: 'https://www.youtube.com/embed/3JZ_D3ELwOQ' 
    }
  ];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % textTestimonials.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + textTestimonials.length) % textTestimonials.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSending(true);
    setTimeout(() => {
      setFormSending(false);
      setFormSubmitted(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <section className="ts-root serif">
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

      <div className="ts-header">
        <h2 className="ts-title">Community Stories</h2>
        <p className="ts-subtitle">Experience the impact of handcrafted artistry through our customers&apos; eyes.</p>
      </div>

      <div className="ts-video-section">
        <h3 className="ts-section-title">In Their Own Words</h3>
        <div className="ts-zigzag-container">
          {videoTestimonials.map((v, i) => (
            <div key={i} className={`ts-zigzag-item ${i % 2 !== 0 ? 'reverse' : ''}`}>
              <div className="ts-video-box">
                <div className="ts-video-frame">
                  <iframe src={v.videoUrl} title={v.who} allowFullScreen />
                </div>
              </div>
              <div className="ts-video-desc">
                <div className="ts-desc-content">
                  <FiPlay className="ts-play-icon" />
                  <h4>{v.who}</h4>
                  <p>{v.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ts-slider-section">
        <h3 className="ts-section-title">Customer Spotlight</h3>
        <div className="ts-slider-wrapper">
          <button className="ts-nav-btn ts-prev" onClick={prevSlide}><FiChevronLeft /></button>
          <div className="ts-slider-main">
            <div className="ts-slide-image-box">
              <img src={textTestimonials[activeSlide].image} alt={textTestimonials[activeSlide].who} />
            </div>
            <div className="ts-slide-text-box">
              <div className="ts-rating">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={i < textTestimonials[activeSlide].rating ? 'star-active' : 'star-inactive'} />
                ))}
              </div>
              <p className="ts-quote-text">&quot;{textTestimonials[activeSlide].text}&quot;</p>
              <div className="ts-author-info">
                <span className="ts-author-name"> — {textTestimonials[activeSlide].who}</span>
              </div>
            </div>
          </div>
          <button className="ts-nav-btn ts-next" onClick={nextSlide}><FiChevronRight /></button>
        </div>
        <div className="ts-pagination">
          {textTestimonials.map((_, i) => (
            <div key={i} className={`ts-p-dot ${i === activeSlide ? 'active' : ''}`} onClick={() => setActiveSlide(i)} />
          ))}
        </div>
      </div>

      <div className="ts-form-section">
        <div className="ts-form-glass">
          <div className="ts-form-side-text">
            <FiMessageSquare className="ts-form-brand-icon" />
            <h3>Your Story Matters</h3>
            <p>Every piece we make finds a new home. Tell us how your Basho piece has brought a touch of soul to your space.</p>
            <div className="ts-form-features">
              <div className="ts-f-item"><FiCheckCircle /> <span>Personal Review</span></div>
              <div className="ts-f-item"><FiCheckCircle /> <span>Photo Upload</span></div>
              <div className="ts-f-item"><FiCheckCircle /> <span>Video Message</span></div>
            </div>
          </div>
          
          <div className="ts-form-container">
            {formSubmitted ? (
              <div className="ts-success-msg">
                <FiCheckCircle className="success-icon" />
                <h4>Thank You!</h4>
                <p>Your story has been shared with our team. We&apos;ll review it soon!</p>
              </div>
            ) : (
              <form className="ts-main-form" onSubmit={handleFormSubmit}>
                <div className="ts-input-group">
                  <input type="text" placeholder="Full Name" required />
                  <input type="email" placeholder="Email Address" required />
                </div>
                
                <div className="ts-input-group">
                  <select required defaultValue="">
                    <option value="" disabled>Overall Rating</option>
                    <option value="5">★★★★★ - Amazing</option>
                    <option value="4">★★★★☆ - Great</option>
                    <option value="3">★★★☆☆ - Good</option>
                    <option value="2">★★☆☆☆ - Fair</option>
                    <option value="1">★☆☆☆☆ - Poor</option>
                  </select>
                </div>

                <textarea placeholder="Tell us your story..." required></textarea>

                <div className="ts-upload-area" onClick={() => fileInputRef.current?.click()}>
                  <FiUpload className="ts-upload-icon" />
                  <div className="ts-upload-text">
                    <span>Click to upload Photo or Video</span>
                    <p>Max file size: 50MB</p>
                  </div>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*" multiple />
                </div>

                <button type="submit" className="ts-premium-btn" disabled={formSending}>
                  {formSending ? 'Processing...' : 'Submit Your Story'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
