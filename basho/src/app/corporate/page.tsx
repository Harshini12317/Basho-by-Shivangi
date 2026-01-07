"use client"
import { useEffect, useRef, useState } from 'react'
import './Corporate.css'
import { FiBriefcase, FiPackage, FiTruck, FiGift, FiMapPin, FiMail, FiPhone, FiChevronRight } from 'react-icons/fi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

export default function CorporatePage() {
  const [activeStep, setActiveStep] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  const steps = [
    { 
      icon: <FiBriefcase />, 
      title: 'Consultation', 
      desc: 'Discuss your brand values and custom timeline.' 
    },
    { 
      icon: <FiGift />, 
      title: 'Proposal', 
      desc: 'Receive tailored pottery and premium packaging options.' 
    },
    { 
      icon: <FiPackage />, 
      title: 'Production', 
      desc: 'Meticulously handcrafted pieces with quality assurance.' 
    },
    { 
      icon: <FiTruck />, 
      title: 'Delivery', 
      desc: 'Global concierge shipping in eco-friendly packaging.' 
    }
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      const sections = gsap.utils.toArray('.reveal-section');
      sections.forEach((section: any) => {
        gsap.fromTo(section, 
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 1, 
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [steps.length]);

  return (
    <div className="corp-root">
      <section className="corp-hero-section">
        <div className="corp-hero-bg"></div>
        <div className="container mx-auto px-6 relative z-10 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="corp-title-3d">Corporate Artistry</h1>
            <p className="corp-subtitle-premium">Handcrafted excellence for your brand's most meaningful connections. Timeless pottery for modern enterprises.</p>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
                className="corp-btn-glow"
              >
                Start Your Journey
              </button>
              <button 
                onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                className="corp-btn-outline"
              >
                Our Process
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white reveal-section">
        <div className="container mx-auto px-6 text-center">
          <span className="text-accent-clay uppercase tracking-widest text-sm font-semibold mb-4 block">OUR EXPERTISE</span>
          <h2 className="text-5xl font-playfair text-[#3d2b1f] mb-4">Collaboration Models</h2>
          <div className="w-20 h-1 bg-[#ffd789] mx-auto mb-16"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Wholesale & Retail */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#fdfaf6] rounded-2xl flex items-center justify-center text-[#3d2b1f] text-3xl mb-8">
                <FiPackage />
              </div>
              <h3 className="text-2xl font-playfair text-[#3d2b1f] mb-4">Wholesale & Retail</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Stock our collections in your store — trade pricing, seasonal drops, and private-label options.
              </p>
              <button 
                onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#3d2b1f] font-bold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Learn More <FiChevronRight />
              </button>
            </div>

            {/* Corporate Gifting */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#fdfaf6] rounded-2xl flex items-center justify-center text-[#3d2b1f] text-3xl mb-8">
                <FiGift />
              </div>
              <h3 className="text-2xl font-playfair text-[#3d2b1f] mb-4">Corporate Gifting</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Curated gift sets with branding and custom packaging for events, clients, and employees.
              </p>
              <button 
                onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#3d2b1f] font-bold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Learn More <FiChevronRight />
              </button>
            </div>

            {/* Press & Collaborations */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#fdfaf6] rounded-2xl flex items-center justify-center text-[#3d2b1f] text-3xl mb-8">
                <FiBriefcase />
              </div>
              <h3 className="text-2xl font-playfair text-[#3d2b1f] mb-4">Press & Collaborations</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Creative partnerships, photoshoots and editorial support — tell us your needs and deadlines.
              </p>
              <button 
                onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#3d2b1f] font-bold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Learn More <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#fdfaf6] reveal-section">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-playfair text-[#3d2b1f] mb-4">What we need from you</h2>
          <p className="text-gray-500 mb-12">Providing these details helps us reply quickly with accurate options.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#3d2b1f] rounded-full flex items-center justify-center text-[#ffd789] shrink-0">
                <FiBriefcase className="text-lg" />
              </div>
              <span className="text-[#3d2b1f] font-medium text-left">Brief description of project or order</span>
            </div>
            
            <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#d4a373] rounded-full flex items-center justify-center text-white shrink-0">
                <FiPackage className="text-lg" />
              </div>
              <span className="text-[#3d2b1f] font-medium text-left">Estimated quantities and timeline</span>
            </div>

            <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#3d2b1f] rounded-full flex items-center justify-center text-[#ffd789] shrink-0">
                <FiGift className="text-lg" />
              </div>
              <span className="text-[#3d2b1f] font-medium text-left">Budget range and pricing expectations</span>
            </div>

            <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#d4a373] rounded-full flex items-center justify-center text-white shrink-0">
                <FiTruck className="text-lg" />
              </div>
              <span className="text-[#3d2b1f] font-medium text-left">Delivery location and logistics needs</span>
            </div>

            <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#3d2b1f] rounded-full flex items-center justify-center text-[#ffd789] shrink-0">
                <FiPackage className="text-lg" />
              </div>
              <span className="text-[#3d2b1f] font-medium text-left">Logo or branding assets for customization</span>
            </div>

            <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#d4a373] rounded-full flex items-center justify-center text-white shrink-0">
                <FiBriefcase className="text-lg" />
              </div>
              <span className="text-[#3d2b1f] font-medium text-left">Packaging and gifting requirements</span>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="corp-process reveal-section">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="section-title-premium text-center mb-16">How it works</h2>
          
          <div className="process-container">
            {/* Steps List (Vertical) */}
            <div className="steps-vertical">
              {steps.map((step, i) => (
                <div 
                  key={i} 
                  className={`corp-step-item ${activeStep === i ? 'active' : ''}`}
                  onMouseEnter={() => setActiveStep(i)}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="corp-step-icon-box">{step.icon}</div>
                  <div className="corp-step-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Display Chart (Side) */}
            <div className="display-chart-side">
              <div className="corp-display-card">
                <div className="corp-display-inner">
                  <div className="corp-display-icon">
                    {steps[activeStep].icon}
                  </div>
                  <div className="corp-display-text">
                    <span className="step-label">STEP {activeStep + 1}</span>
                    <h4 className="step-title">{steps[activeStep].title}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="inquiry" className="inquiry-section reveal-section">
        <div className="container mx-auto px-6">
          <div className="inquiry-glass-card">
            <h2 className="section-title-premium text-center mb-10">Start a Consultation</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
              <div className="input-field-premium">
                <input type="text" placeholder="Company Name" required />
              </div>
              <div className="input-field-premium">
                <input type="email" placeholder="Professional Email" required />
              </div>
              <div className="input-field-premium md:col-span-2">
                <textarea placeholder="Tell us about your event or project..." rows={5} required></textarea>
              </div>
              <button type="submit" className="corp-submit-premium md:col-span-2">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
