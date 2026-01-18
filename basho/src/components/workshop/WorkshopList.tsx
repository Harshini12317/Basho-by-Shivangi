"use client";
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { FaLeaf, FaHandSparkles, FaStar, FaChair, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Experience {
  image: string;
  title: string;
  description: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  locationLink?: string;
  images: string[];
  type: string;
  isPublished: boolean;
}

interface Workshop {
  _id: string;
  slug: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  images: string[];
  location: string;
  googleMapLink?: string;
  whatYouWillLearn: string[];
  includes: string[];
  moreInfo?: string;
  seats: number;
  createdAt: string;
  updatedAt: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  image: string;
  category: string;
}

const studentImages = ['img13.png', 'img34.png', 'img12.png', 'img31.png', 'img25.png', 'img32.png', 'img5.png', 'img15.png', 'img33.png', 'img27.png', 'img3.png', 'img2.png'];

// Props coming from server page (optional, will map to the static shape)
interface DBWorkshop {
  slug?: string;
  image?: string; // Cloudinary or local path
  title?: string;
  date?: string | Date;
  price?: number;
  description?: string;
  level?: string;
  seats?: number; // total seats (not necessarily spots left)
}

type PopupItem = {
  name: string;
  isActive: boolean;
  pages: string[];
  targetSlug?: string;
  image?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  triggerType?: 'page_load' | 'delay' | 'scroll';
  triggerDelayMs?: number;
  frequency?: 'once_per_session' | 'once_per_day' | 'always';
  startAt?: string;
  endAt?: string;
};

export default function WorkshopList({ workshops: initialWorkshops }: { workshops?: DBWorkshop[] }) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [workshopGalleryImages, setWorkshopGalleryImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await fetch('/api/workshop');
        if (response.ok) {
          const data = await response.json();
          setWorkshops(data);
        }
      } catch (error) {
        console.error('Failed to fetch workshops:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchExperiences = async () => {
      try {
        const response = await fetch('/api/admin/static-data');
        if (response.ok) {
          const data = await response.json();
          setExperiences(data.experiences || []);
        }
      } catch (error) {
        console.error('Failed to fetch experiences:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.filter((e: Event) => e.isPublished));
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    const fetchWorkshopGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          // Filter only workshop category images
          const workshopImages = data.filter((item: GalleryItem) => item.category === 'workshop');
          setWorkshopGalleryImages(workshopImages);
        }
      } catch (error) {
        console.error('Failed to fetch workshop gallery images:', error);
      }
    };

    fetchWorkshops();
    fetchExperiences();
    fetchEvents();
    fetchWorkshopGallery();
  }, []);

  // Use fetched workshops if available, otherwise use initial props or empty array
  const workshopData = workshops.length > 0 ? workshops : (initialWorkshops || []);

  // Map workshops to display format
  const displayList = workshopData.map((w) => {
    // Determine image based on type
    let imgSrc = '/images/img12.png';
    if ('images' in w && Array.isArray(w.images)) {
      imgSrc = w.images[0] || imgSrc;
    } else if ('image' in w && w.image) {
      imgSrc = w.image;
    }
    
    return {
      slug: w.slug,
      img: imgSrc,
      title: w.title,
      date: 'Select Date', // Since users choose their own date
      level: w.level,
      price: w.price,
      description: w.description,
      spotsLeft: w.seats // Could calculate based on registrations if needed
    };
  });

  const filenameOf = (src: string) => {
    const s = src || '';
    const base = s.split('/').pop() || s;
    return base;
  };

  const resolveImgSrc = (src: string) => {
    if (!src) return '/images/img12.png';
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) return src;
    return `/images/${src}`;
  };
  const studentScrollerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [reg, setReg] = useState({ name: '', email: '', mobile: '', date: '' });
  const [regStatus, setRegStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [popup, setPopup] = useState<PopupItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const openBookingModal = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowModal(true);
    setRegStatus('idle');
  };

  const closeBookingModal = () => {
    setShowModal(false);
    setSelectedEventId(null);
    setReg({ name: '', email: '', mobile: '', date: '' });
  };

  const openModal = (slug: string) => {
    setSelectedSlug(slug);
    setShowModal(true);
    setRegStatus('idle');
  };

  const submitBooking = async () => {
    if (!selectedEventId || !reg.name || !reg.email || !reg.mobile || !reg.date) {
      setRegStatus('error');
      return;
    }

    setRegStatus('loading');
    try {
      const response = await fetch('/api/admin/event-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          customerName: reg.name,
          customerEmail: reg.email,
          customerPhone: reg.mobile,
          bookingDate: reg.date,
          numberOfGuests: 1,
          status: 'pending',
        }),
      });

      if (response.ok) {
        setRegStatus('success');
        setTimeout(() => {
          closeBookingModal();
        }, 2000);
      } else {
        setRegStatus('error');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setRegStatus('error');
    }
  };

  const shouldShowByFrequency = (p: PopupItem) => {
    const key = `popup_${p.name}_seen`;
    if (p.frequency === 'always') return true;
    const last = localStorage.getItem(key);
    if (!last) return true;
    const lastTime = Number(last);
    if (p.frequency === 'once_per_session') return false;
    if (p.frequency === 'once_per_day') {
      const oneDay = 24 * 60 * 60 * 1000;
      return Date.now() - lastTime > oneDay;
    }
    return true;
  };
  const markSeen = (p: PopupItem) => {
    const key = `popup_${p.name}_seen`;
    localStorage.setItem(key, String(Date.now()));
  };
  const withinSchedule = (p: PopupItem) => {
    const now = new Date();
    const startOk = p.startAt ? now >= new Date(p.startAt) : true;
    const endOk = p.endAt ? now <= new Date(p.endAt) : true;
    return startOk && endOk;
  };
  const evaluatePopups = (list: PopupItem[]) => {
    const candidates = list.filter(
      (p) =>
        p.isActive &&
        (p.pages || []).includes('workshops') &&
        !p.targetSlug &&
        withinSchedule(p)
    );
    const first = candidates[0] || null;
    if (!first) return;
    if (!shouldShowByFrequency(first)) return;
    setPopup(first);
    const showNow = first.triggerType === 'page_load';
    if (showNow) setShowPopup(true);
    if (first.triggerType === 'delay') {
      const ms = first.triggerDelayMs || 0;
      setTimeout(() => setShowPopup(true), ms);
    }
    if (first.triggerType === 'scroll') {
      const onScroll = () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= 40) {
          setShowPopup(true);
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll);
    }
  };
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_popups') || '[]';
      const data = JSON.parse(raw);
      if (Array.isArray(data)) evaluatePopups(data);
    } catch {}
  }, []);

  return (
    <div className="bg-[#F8F7F2] min-h-screen py-16 px-4 sm:px-8 bg-cover bg-center bg-fixed" style={{backgroundImage: 'url(/images/i2.jpg)'}}>
      {popup && showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="rounded-3xl bg-white shadow-2xl w-[92%] max-w-md overflow-hidden">
            {popup.image ? <img src={popup.image} alt="" className="w-full h-40 object-cover" /> : null}
            <div className="p-5">
              {popup.title ? <div className="text-lg font-semibold text-slate-900">{popup.title}</div> : null}
              {popup.description ? <p className="mt-2 text-sm text-slate-700">{popup.description}</p> : null}
              <div className="mt-4 flex items-center gap-3">
                {popup.ctaText && popup.ctaLink ? (
                  <a href={popup.ctaLink} className="px-4 py-2 rounded-full bg-[#E76F51] text-white shadow-md hover:bg-[#D35400]">
                    {popup.ctaText}
                  </a>
                ) : null}
                <button
                  onClick={() => {
                    setShowPopup(false);
                    markSeen(popup);
                  }}
                  className="px-4 py-2 rounded-full bg-white ring-1 ring-[#E2C48D] text-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-3xl lg:rounded-[40px] p-4 sm:p-8 md:p-12 lg:p-16 shadow-sm">
        <div className="-mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16 -mt-4 sm:-mt-8 md:-mt-12 lg:-mt-16 mb-8 sm:mb-12">
          <div className="overflow-hidden rounded-t-2xl sm:rounded-t-3xl lg:rounded-t-[40px] workshop-hero text-white text-center py-8 sm:py-10">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="nav-title px-4">Discover the Art of Clay</h1>
              <p className="nav-subtitle">Hands‑on pottery workshops for beginners & creators</p>
              <div className="mt-3 flex justify-center gap-3">
                <a href="#workshops" className="px-4 py-2 rounded-full bg-[#2F6F5A] text-white shadow-md hover:bg-[#265D4C] transition-colors">Workshops</a>
                <a href="#events" className="px-4 py-2 rounded-full bg-white text-[#3d2b1f] ring-1 ring-[#EDD8B4] hover:bg-[#fffaf3] transition-colors">Experience</a>
              </div>
            </div>
          </div>
        </div>

        

        {/* Workshop Grid */}
        <div id="workshops" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-4 sm:gap-6 lg:gap-8 mb-24 scroll-mt-24">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-[#FFF8F2] rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : displayList.length > 0 ? (
            displayList.map((ws, idx) => (
              <Link key={`${ws.slug}-${idx}`} href={`/workshop/${ws.slug}`} className="group cursor-pointer h-full">
                <div className="bg-[#FFF8F2] rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-lg ring-1 ring-[#E2C48D] flex flex-col h-full">
                  <div className="relative aspect-square">
                    <img src={resolveImgSrc(ws.img)} alt={ws.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <h3 className="text-base sm:text-lg font-bold serif text-[#3d2b1f] mb-1 line-clamp-2">{ws.title}</h3>
                    <p className="text-[#6b5a4c] text-xs mb-3 line-clamp-1">{ws.description}</p>
                    <div className="flex items-center gap-2 text-[#6b5a4c] text-xs mb-3 sm:mb-4">
                      <span>🗓 {ws.date}</span>{ws.level ? <span>• {ws.level}</span> : null}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg font-bold">₹{ws.price}</span>
                      <span className="text-slate-400 text-[10px]">per person</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 text-lg">No workshops available at the moment.</p>
              <p className="text-slate-400 text-sm mt-2">Check back soon for new pottery workshops!</p>
            </div>
          )}
        </div>

        <div className="rounded-3xl overflow-hidden mb-16">
          <div
            className="py-10 md:py-14 px-6 md:px-10 text-[#F9E8E4]"
            style={{ backgroundImage: 'linear-gradient(180deg, #7E2A2A 0%, #6A2424 100%)' }}
          >
            <div className="grid md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-2">
                <div className="text-[11px] tracking-wide uppercase opacity-80">The Best Things In Life</div>
                <div className="text-2xl md:text-3xl font-semibold">Are Handmade!</div>
              </div>
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-2 py-5 shadow-sm ring-1 ring-[#E2C48D] h-full justify-start">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center flex-shrink-0">
                    <FaLeaf />
                  </div>
                  <div className="mt-3 font-medium text-sm md:text-base text-center break-words w-full leading-tight">Eco-Friendly</div>
                </div>
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-2 py-5 shadow-sm ring-1 ring-[#E2C48D] h-full justify-start">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center flex-shrink-0">
                    <FaHandSparkles />
                  </div>
                  <div className="mt-3 font-medium text-sm md:text-base text-center break-words w-full leading-tight">Artisanal</div>
                </div>
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-2 py-5 shadow-sm ring-1 ring-[#E2C48D] h-full justify-start">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center flex-shrink-0">
                    <FaStar />
                  </div>
                  <div className="mt-3 font-medium text-sm md:text-base text-center break-words w-full leading-tight">High Quality</div>
                </div>
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-2 py-5 shadow-sm ring-1 ring-[#E2C48D] h-full justify-start">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center flex-shrink-0">
                    <FaChair />
                  </div>
                  <div className="mt-3 font-medium text-sm md:text-base text-center break-words w-full leading-tight">Ergonomic</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Creations Section */}
        <div className="rounded-2xl ring-1 ring-[#E2C48D] bg-[#FFF8F2] p-6 md:p-10 relative">
          <div className="flex items-center justify-center gap-6 mb-3">
            <img src="/images/star.png" alt="" className="w-14 h-14 md:w-16 md:h-16" />
            <h2 className="text-2xl font-semibold text-slate-800 text-center uppercase">Student Creations</h2>
            <img src="/images/star.png" alt="" className="w-14 h-14 md:w-16 md:h-16" />
          </div>
          <p className="text-slate-600 text-sm md:text-base mb-8 text-center max-w-2xl mx-auto">
            Explore the beautiful pottery pieces crafted by our talented students. Each creation tells a unique story
            of dedication, creativity, and craftsmanship.
          </p>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2" ref={studentScrollerRef}>
            {(workshopGalleryImages.length > 0 ? workshopGalleryImages : studentImages.map(img => ({ _id: img, image: resolveImgSrc(img), title: 'Student work', category: 'workshop' }))).map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] h-[300px] flex-none rounded-xl overflow-hidden flex items-center justify-center snap-start"
              >
                <img src={typeof item === 'string' ? resolveImgSrc(item) : item.image} className="w-full h-full object-cover" alt={typeof item === 'string' ? 'Student work' : item.title} />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
            <button
              onClick={() => studentScrollerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 ring-1 ring-[#E2C48D] text-[#6A2424] flex items-center justify-center hover:bg-white"
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => studentScrollerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 ring-1 ring-[#E2C48D] text-[#6A2424] flex items-center justify-center hover:bg-white"
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div className="relative">
          <div id="events" className="relative isolate overflow-hidden mb-16 bg-[#4B5D3A] mt-12 scroll-mt-24">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[420px] md:h-[520px] bg-transparent">
                <img src="/images/w4.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="min-h-[420px] md:h-[520px] flex flex-col items-center justify-center px-8 text-center text-white py-12 md:py-0">
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Plan Your Special Day</h3>
                <p className="mb-8 max-w-sm opacity-90">
                  Host a memorable creative gathering for birthdays, team building, or bridal showers.
                </p>
                
              </div>
            </div>
          </div>
          
          {experiences.length > 0 || events.length > 0 ? (
            <>
              {experiences.map((experience, index) => (
                <div key={`exp-${index}`} className="grid md:grid-cols-2 items-stretch gap-8 mb-16">
                  <div className="flex justify-center md:justify-start items-center group cursor-pointer bg-white rounded-2xl p-2 ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md h-[360px] md:h-[420px]">
                    <img src={experience.image} alt={experience.title} className="max-h-full w-auto object-contain rounded-xl transition-all group-hover:shadow-md" />
                  </div>
                  <div className="bg-[#FFF8F2] text-slate-800 text-base md:text-lg px-4 md:px-6 py-5 rounded-2xl ring-1 ring-[#E2C48D] shadow-sm text-left md:text-left transition-shadow hover:shadow-md h-[360px] md:h-[420px] flex flex-col justify-center">
                    <div className="text-[12px] md:text-sm font-semibold uppercase tracking-wide mb-2 text-[#6A2424]">{experience.title}</div>
                    <div className="h-1 w-12 bg-[#E76F51] rounded-full mb-4"></div>
                    <p className="leading-relaxed max-w-md md:max-w-lg">
                      {experience.description}
                    </p>
                    <Link href="/contact" className="inline-block mt-4 bg-[#E76F51] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#D35400] transition-colors">Book Now</Link>
                  </div>
                </div>
              ))}
              {events.map((event, index) => (
                <div key={`event-${event._id}`} className="grid md:grid-cols-2 items-stretch gap-8 mb-16">
                  <div className="flex justify-center md:justify-start items-center group cursor-pointer bg-white rounded-2xl p-2 ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md h-[360px] md:h-[420px]">
                    {event.images.length > 0 ? (
                      <img src={event.images[0]} alt={event.title} className="max-h-full w-auto object-contain rounded-xl transition-all group-hover:shadow-md" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                        <p className="text-gray-500">No image</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-[#FFF8F2] text-slate-800 text-base md:text-lg px-4 md:px-6 py-5 rounded-2xl ring-1 ring-[#E2C48D] shadow-sm text-left md:text-left transition-shadow hover:shadow-md h-[360px] md:h-[420px] flex flex-col justify-center">
                    <div className="text-[12px] md:text-sm font-semibold uppercase tracking-wide mb-2 text-[#6A2424]">{event.title}</div>
                    <div className="h-1 w-12 bg-[#E76F51] rounded-full mb-4"></div>
                    {event.locationLink ? (
                      <p className="text-sm text-slate-600 mb-2">📍 <a href={event.locationLink} target="_blank" rel="noopener noreferrer" className="text-[#E76F51] hover:underline">{event.location}</a></p>
                    ) : (
                      <p className="text-sm text-slate-600 mb-2">📍 {event.location}</p>
                    )}
                    <p className="leading-relaxed max-w-md md:max-w-lg mb-4">
                      {event.description}
                    </p>
                    <button onClick={() => openBookingModal(event._id)} className="inline-block bg-[#E76F51] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#D35400] transition-colors">Book Now</button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No items available at the moment.</p>
              <p className="text-slate-400 text-sm mt-2">Check back soon!</p>
            </div>
          )}

          {/* Booking Modal */}
          {showModal && selectedEventId && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg ring-1 ring-[#E2C48D]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Book This Event</h3>
                  <button onClick={closeBookingModal} className="text-slate-600 hover:text-slate-900">✕</button>
                </div>

                {regStatus === 'success' ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">✓</div>
                    <p className="text-slate-900 font-semibold">Booking Confirmed!</p>
                    <p className="text-slate-600 text-sm mt-2">We'll contact you soon to confirm details.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={reg.name}
                        onChange={(e) => setReg({ ...reg, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E2C48D]"
                        placeholder="Your Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={reg.email}
                        onChange={(e) => setReg({ ...reg, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E2C48D]"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mobile *</label>
                      <input
                        type="tel"
                        required
                        value={reg.mobile}
                        onChange={(e) => setReg({ ...reg, mobile: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E2C48D]"
                        placeholder="Your Mobile Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={reg.date}
                        onChange={(e) => setReg({ ...reg, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E2C48D]"
                      />
                    </div>
                    {regStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        Please fill all fields correctly
                      </div>
                    )}
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={closeBookingModal}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitBooking}
                        disabled={regStatus === 'loading'}
                        className="flex-1 px-4 py-2 rounded-lg bg-[#E76F51] text-white hover:bg-[#D35400] disabled:opacity-50 transition-colors"
                      >
                        {regStatus === 'loading' ? 'Booking...' : 'Submit Booking'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
