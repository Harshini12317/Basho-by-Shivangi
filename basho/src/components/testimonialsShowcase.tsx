"use client"
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
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
  const { data: session } = useSession();
  const [activePhotoSlide, setActivePhotoSlide] = useState(0);
  const [activeTextSlide, setActiveTextSlide] = useState(0);
  const [formSending, setFormSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textScrollContainerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    rating: 5,
    image: '',
    videoUrl: '',
    testimonialType: 'text' as 'text' | 'video'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [textTestimonials, setTextTestimonials] = useState<Testimonial[]>([]);
  const [photoTestimonials, setPhotoTestimonials] = useState<Testimonial[]>([]);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();

      const textOnes = data.filter((t: Testimonial) => t.testimonialType === 'text' && !t.image);
      const photoOnes = data.filter((t: Testimonial) => t.testimonialType === 'text' && t.image);
      const videoOnes = data.filter((t: Testimonial) => t.testimonialType === 'video').map((t: Testimonial) => ({
        who: t.name,
        description: t.message,
        videoUrl: t.videoUrl || ''
      }));

      setTextTestimonials(textOnes);
      setPhotoTestimonials(photoOnes);
      setVideoTestimonials(videoOnes);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      setLoading(false);
    }
  };

  const nextPhotoSlide = () => setActivePhotoSlide((prev) => (prev + 1) % photoTestimonials.length);
  const prevPhotoSlide = () => setActivePhotoSlide((prev) => (prev - 1 + photoTestimonials.length) % photoTestimonials.length);

  const getSlidesPerView = () => {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 1024) return 2;
    return 3;
  };

  const scrollTextCarouselTo = (index: number) => {
    const container = textScrollContainerRef.current;
    if (!container) return;
    const perView = getSlidesPerView();
    const slideWidth = container.offsetWidth / perView;
    container.scrollTo({ left: Math.max(0, index * slideWidth), behavior: 'smooth' });
  };

  const nextTextSlide = () => {
    if (textTestimonials.length === 0) return;
    const next = (activeTextSlide + 1) % textTestimonials.length;
    setActiveTextSlide(next);
    scrollTextCarouselTo(next);
  };

  const prevTextSlide = () => {
    if (textTestimonials.length === 0) return;
    const prev = (activeTextSlide - 1 + textTestimonials.length) % textTestimonials.length;
    setActiveTextSlide(prev);
    scrollTextCarouselTo(prev);
  };

  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
      }));
    }
  }, [session]);

  // Auto-rotate photo testimonials every 4 seconds
  useEffect(() => {
    if (photoTestimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setActivePhotoSlide((prev) => (prev + 1) % photoTestimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [photoTestimonials.length]);

  // Keep text carousel aligned when window resizes or active index changes
  useEffect(() => {
    scrollTextCarouselTo(activeTextSlide);
  }, [activeTextSlide]);

  useEffect(() => {
    const onResize = () => scrollTextCarouselTo(activeTextSlide);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize);
      }
    };
  }, [activeTextSlide]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      alert('Please login to submit a review');
      return;
    }

    setFormSending(true);

    try {
      let imageUrl = '';
      let videoUrl = '';

      // Upload file to Cloudinary if selected
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (selectedFile.type.startsWith('video/')) {
            videoUrl = uploadData.url;
          } else {
            imageUrl = uploadData.url;
          }
        } else {
          throw new Error('Failed to upload file');
        }
      }

      // Submit review with email from session
      const reviewData = {
        name: formData.name,
        email: session.user.email,
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
          name: session.user.name || '',
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
                  <iframe src={`${v.videoUrl}?autoplay=1&muted=1`} title={v.who} allowFullScreen />
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
        {photoTestimonials.length > 0 ? (
          <div className="ts-slider-wrapper">
            <button className="ts-nav-btn ts-prev" onClick={prevPhotoSlide}><FiChevronLeft /></button>
            <div className="ts-slider-main">
              <div className="ts-slide-image-box">
                <img src={photoTestimonials[activePhotoSlide].image || '/images/img10.png'} alt={photoTestimonials[activePhotoSlide].name} />
              </div>
              <div className="ts-slide-text-box">
                <div className="ts-rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={i < photoTestimonials[activePhotoSlide].rating ? 'star-active' : 'star-inactive'} />
                  ))}
                </div>
                <p className="ts-quote-text">&quot;{photoTestimonials[activePhotoSlide].message}&quot;</p>
                <div className="ts-author-info">
                  <span className="ts-author-name"> — {photoTestimonials[activePhotoSlide].name}</span>
                </div>
              </div>
            </div>
            <button className="ts-nav-btn ts-next" onClick={nextPhotoSlide}><FiChevronRight /></button>
          </div>
        ) : (
          <p className="ts-no-testimonials">No testimonials available yet.</p>
        )}
        {photoTestimonials.length > 1 && (
          <div className="ts-pagination">
            {photoTestimonials.map((_, i) => (
              <div key={i} className={`ts-p-dot ${i === activePhotoSlide ? 'active' : ''}`} onClick={() => setActivePhotoSlide(i)} />
            ))}
          </div>
        )}
      </div>

      {/* Text Reviews Section */}
      {textTestimonials.length > 0 && (
        <div className="ts-text-reviews-section">
          <h3 className="ts-section-title">What Our Customers Say</h3>
          <div className="ts-text-carousel-wrapper">
            <button className="ts-nav-btn ts-prev" onClick={prevTextSlide}><FiChevronLeft /></button>
            <div className="ts-text-carousel-container" ref={textScrollContainerRef}>
              <div className="ts-text-carousel">
                {textTestimonials.map((review, index) => (
                  <div 
                    key={review._id} 
                    className={`ts-text-review-card ${index === activeTextSlide ? 'active' : ''}`}
                  >
                    <div className="ts-text-rating">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={i < review.rating ? 'star-active' : 'star-inactive'} />
                      ))}
                    </div>
                    <p className="ts-text-review-message">&quot;{review.message}&quot;</p>
                    <div className="ts-text-review-author">
                      <strong>{review.name}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="ts-nav-btn ts-next" onClick={nextTextSlide}><FiChevronRight /></button>
          </div>
          {textTestimonials.length > 1 && (
            <div className="ts-pagination">
              {textTestimonials.map((_, i) => (
                <div key={i} className={`ts-p-dot ${i === activeTextSlide ? 'active' : ''}`} onClick={() => setActiveTextSlide(i)} />
              ))}
            </div>
          )}
        </div>
      )}

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
            {!session?.user?.email ? (
              <div className="ts-success-msg">
                <FiCheckCircle className="success-icon" />
                <h4>Login Required</h4>
                <p>Please login to share your story with us.</p>
                <Link href="/auth" className="ts-premium-btn" style={{ display: 'inline-block', marginTop: '1rem' }}>
                  Login
                </Link>
              </div>
            ) : formSubmitted ? (
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
