"use client"
import { useState, useEffect, useRef } from 'react'
import './TestimonialsShowcase.css'
import { colors } from '../constants/colors'
import { FiPlay, FiChevronLeft, FiChevronRight, FiMessageSquare, FiUpload, FiStar, FiCheckCircle } from 'react-icons/fi'

interface Testimonial {
  _id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  image?: string;
  videoUrl?: string;
  testimonialType: 'text' | 'video';
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5,
    image: '',
    videoUrl: '',
    testimonialType: 'text' as 'text' | 'video'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [textTestimonials, setTextTestimonials] = useState<Testimonial[]>([]);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();

      const textOnes = data.filter((t: Testimonial) => t.testimonialType === 'text');
      const videoOnes = data.filter((t: Testimonial) => t.testimonialType === 'video').map((t: Testimonial) => ({
        who: t.name,
        description: t.message,
        videoUrl: t.videoUrl || ''
      }));

      setTextTestimonials(textOnes);
      setVideoTestimonials(videoOnes);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      setLoading(false);
    }
  };

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % textTestimonials.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + textTestimonials.length) % textTestimonials.length);

  useEffect(() => {
    if (textTestimonials.length > 0) {
      const timer = setInterval(nextSlide, 4000);
      return () => clearInterval(timer);
    }
  }, [textTestimonials.length]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSending(true);

    try {
      const imageUrl = '';
      const videoUrl = '';

      // For now, we'll skip file upload and just submit the text data
      // TODO: Implement proper file upload when Cloudinary is configured
      if (selectedFile) {
        console.log('File selected but upload not implemented yet:', selectedFile.name);
        // For now, we'll just submit without the file
      }

      // Submit review
      const reviewData = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        rating: formData.rating,
        image: imageUrl || formData.image,
        videoUrl: videoUrl || formData.videoUrl,
        testimonialType: selectedFile && selectedFile.type.startsWith('video/') ? 'video' : 'text'
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        setFormSubmitted(true);
        setFormData({
          name: '',
          email: '',
          message: '',
          rating: 5,
          image: '',
          videoUrl: '',
          testimonialType: 'text'
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => setFormSubmitted(false), 5000);
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setFormSending(false);
    }
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
          {videoTestimonials.length > 0 ? videoTestimonials.map((v, i) => (
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
          )) : (
            <p className="ts-no-testimonials">No video testimonials available yet.</p>
          )}
        </div>
      </div>

      <div className="ts-slider-section">
        <h3 className="ts-section-title">Customer Spotlight</h3>
        {textTestimonials.length > 0 ? (
          <div className="ts-slider-wrapper">
            <button className="ts-nav-btn ts-prev" onClick={prevSlide}><FiChevronLeft /></button>
            <div className="ts-slider-main">
              <div className="ts-slide-image-box">
                <img src={textTestimonials[activeSlide].image || '/images/img10.png'} alt={textTestimonials[activeSlide].name} />
              </div>
              <div className="ts-slide-text-box">
                <div className="ts-rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={i < textTestimonials[activeSlide].rating ? 'star-active' : 'star-inactive'} />
                  ))}
                </div>
                <p className="ts-quote-text">&quot;{textTestimonials[activeSlide].message}&quot;</p>
                <div className="ts-author-info">
                  <span className="ts-author-name"> — {textTestimonials[activeSlide].name}</span>
                </div>
              </div>
            </div>
            <button className="ts-nav-btn ts-next" onClick={nextSlide}><FiChevronRight /></button>
          </div>
        ) : (
          <p className="ts-no-testimonials">No testimonials available yet.</p>
        )}
        {textTestimonials.length > 1 && (
          <div className="ts-pagination">
            {textTestimonials.map((_, i) => (
              <div key={i} className={`ts-p-dot ${i === activeSlide ? 'active' : ''}`} onClick={() => setActiveSlide(i)} />
            ))}
          </div>
        )}
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
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="ts-input-group">
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    required
                  >
                    <option value="" disabled>Overall Rating</option>
                    <option value="5">★★★★★ - Amazing</option>
                    <option value="4">★★★★☆ - Great</option>
                    <option value="3">★★★☆☆ - Good</option>
                    <option value="2">★★☆☆☆ - Fair</option>
                    <option value="1">★☆☆☆☆ - Poor</option>
                  </select>
                </div>

                <textarea
                  placeholder="Tell us your story..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                ></textarea>

                <div className="ts-upload-area" onClick={() => fileInputRef.current?.click()}>
                  <FiUpload className="ts-upload-icon" />
                  <div className="ts-upload-text">
                    <span>{selectedFile ? selectedFile.name : 'Click to upload Photo or Video'}</span>
                    <p>Max file size: 50MB</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                  />
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
