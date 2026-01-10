"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { FaLeaf, FaHandSparkles, FaStar, FaChair, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface StaticWorkshop {
  slug: string;
  img: string; // can be filename under /images or full/absolute URL
  title: string;
  date: string;
  level: string;
  price: number;
  description: string;
  spotsLeft?: number;
}

// Fallback static workshops (exactly 6) to match the reference layout
const staticWorkshops: StaticWorkshop[] = [
  { slug: 'cobalt-botanical', img: 'img12.png', title: 'Cobalt Botanical', date: 'Jan 25, 2026', level: 'Advanced', price: 95, description: 'Master the art of traditional blue and white pottery.' },
  { slug: 'rose-garden', img: 'img13.png', title: 'Garden Sculpting', date: 'Jan 29, 2026', level: 'Advanced', price: 65, description: 'Decorate fine ceramic mugs with delicate floral motifs.' },
  { slug: 'tropical-teal', img: 'img31.png', title: 'Tropical Teal', date: 'Feb 1, 2026', level: 'Advanced', price: 65, description: 'Create stunning platters with vibrant teal glazes.' },
  { slug: 'sage-minimalist', img: 'img18.png', title: 'Sage Minimalist', date: 'Feb 5, 2026', level: 'Beginner', price: 65, description: 'Focus on the beauty of simplicity and smooth finishes.', spotsLeft: 3 },
  { slug: 'wildflower-tea', img: 'img9.png', title: 'Wildflower Amber', date: 'Feb 12, 2026', level: 'Intermediate', price: 65, description: 'Design matching tea sets with whimsical patterns.' },
  { slug: 'matcha-ceremony', img: 'img33.png', title: 'Matcha Ceremony', date: 'Feb 18, 2026', level: 'Advanced', price: 65, description: 'Craft and decorate your own authentic Matcha bowl.' },
  { slug: 'pastel-parchment', img: 'sculp1.png', title: 'Pastel & Parchment', date: 'Mar 5, 2026', level: 'Intermediate', price: 85, description: 'Step into the world of traditional Indian pottery to explore the relationship between form and nature.' },
  { slug: 'earthen-legacy', img: 'p3.jpg', title: 'The Earthen Legacy', date: 'Mar 12, 2026', level: 'Beginner', price: 75, description: 'Uncover the tactile joy of hand-molding raw clay into contemporary functional art.' },
  { slug: 'rustic-light', img: 'p4.jpg', title: 'The Rustic Light', date: 'Mar 15, 2026', level: 'Beginner', price: 70, description: 'Combine the art of pottery with the warmth of candle making in a session focused on texture and light.' },
  { slug: 'artisan-tableware', img: 'p1.png', title: 'The Artisan Tableware', date: 'Mar 20, 2026', level: 'Advanced', price: 90, description: 'Transform raw clay into sophisticated, deep-form serving ware designed for artistic dining.' },
  { slug: 'botanical-garden', img: 'img2.png', title: 'Botanical Garden', date: 'Mar 22, 2026', level: 'Intermediate', price: 80, description: 'Elevate your home decor with this stunning decorative tray featuring a lush, whimsical botanical scene.' },
  { slug: 'heritage-in-hand', img: 'img10.png', title: 'Heritage in Hand', date: 'Mar 28, 2026', level: 'Advanced', price: 95, description: 'Dive into the intersection of two ancient crafts: embossed ceramic textures paired with custom-fitted wooden elements.' },
  { slug: 'blue-pottery', img: 'img4.png', title: 'Blue Pottery', date: 'Apr 5, 2026', level: 'Advanced', price: 90, description: 'Classic Cobalt Blue Chinoiserie and Indigo pottery with hand-painted botanical motifs on a white ceramic base.' },
];

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

export default function WorkshopList({ workshops }: { workshops?: DBWorkshop[] }) {
  // Map incoming DB workshops (if any) to our display shape; otherwise use static content.
  const mapped: StaticWorkshop[] = Array.isArray(workshops) && workshops.length > 0
    ? workshops.map((w) => {
        const dateStr = w.date
          ? typeof w.date === 'string'
            ? w.date
            : new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'TBD';
        const img = w.image || 'img12.png';
        return {
          slug: w.slug || 'workshop',
          img,
          title: w.title || 'Workshop',
          date: dateStr,
          level: w.level || 'Beginner',
          price: typeof w.price === 'number' ? w.price : 65,
          description: w.description || 'Join us for an immersive pottery experience.',
        };
      })
    : staticWorkshops;

  // Normalize titles by slug so listing shows updated names regardless of data source
  const nameBySlug: Record<string, string> = {
    'rose-garden': 'Garden Sculpting',
    'tropical-teal': 'Tropical Teal',
    'wildflower-tea': 'Wildflower Amber',
  };
  const displayList = mapped.map((ws) => ({ ...ws, title: nameBySlug[ws.slug] || ws.title }));

  const filenameOf = (src: string) => {
    const s = src || '';
    const base = s.split('/').pop() || s;
    return base;
  };

  const orderImages = ['sculp1.png', 'img12.png', 'p3.jpg', 'p4.jpg', 'img2.png', 'img10.png', 'img33.png', 'p4.jpg', 'img31.png'];
  const orderedFirst: StaticWorkshop[] = [];
  for (const imgName of orderImages) {
    const found = displayList.find((ws) => filenameOf(ws.img) === imgName);
    if (found) orderedFirst.push(found);
  }
  const usedSlugs = new Set(orderedFirst.map((w) => w.slug));
  const rest = displayList.filter((ws) => !usedSlugs.has(ws.slug));
  const finalList = [...orderedFirst, ...rest];

  const resolveImgSrc = (src: string) => {
    if (!src) return '/images/img12.png';
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) return src;
    return `/images/${src}`;
  };
  const studentScrollerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [reg, setReg] = useState({ name: '', email: '' });
  const [regStatus, setRegStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [popup, setPopup] = useState<PopupItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const openModal = (slug: string) => {
    setSelectedSlug(slug);
    setShowModal(true);
    setRegStatus('idle');
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedSlug(null);
    setReg({ name: '', email: '' });
  };
  const submitRegistration = async () => {
    if (!selectedSlug || !reg.name || !reg.email) {
      setRegStatus('error');
      return;
    }
    try {
      setRegStatus('loading');
      const res = await fetch('/api/workshop/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopSlug: selectedSlug, name: reg.name, email: reg.email }),
      });
      if (!res.ok) {
        setRegStatus('error');
        return;
      }
      setRegStatus('success');
      setTimeout(() => {
        closeModal();
      }, 900);
    } catch {
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
    <div className="bg-[#F8F7F2] min-h-screen py-16 px-4 sm:px-8">
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
      <div className="max-w-6xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-sm">
        <div className="-mx-8 md:-mx-16 -mt-8 md:-mt-16 mb-12">
          <div className="overflow-hidden rounded-t-[40px] bg-[#D8A7B1] text-white text-center py-8">
            <h2 className="text-3xl md:text-4xl font-semibold">Pottery Workshop</h2>
          </div>
        </div>

        <div className="sticky top-0 z-20 -mx-8 md:-mx-16 bg-white/80 backdrop-blur border-b border-[#EDD8B4]">
          <div className="max-w-6xl mx-auto px-8 md:px-16">
            <div className="flex items-center gap-3 py-3">
              <a href="#workshops" className="px-4 py-2 rounded-full bg-[#FFF8F2] ring-1 ring-[#E2C48D] text-slate-900 hover:bg-white">Workshops</a>
              <a href="#events" className="px-4 py-2 rounded-full bg-[#FFF8F2] ring-1 ring-[#E2C48D] text-slate-900 hover:bg-white">Events</a>
            </div>
          </div>
        </div>
        
        
        {/* Workshop Grid */}
        <div id="workshops" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 scroll-mt-24">
          {finalList.map((ws, idx) => (
            <Link key={`${ws.slug}-${idx}`} href={`/workshop/${ws.slug}`} className="group cursor-pointer">
              <div className="bg-[#F9F9F9] rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-lg">
                <div className="relative aspect-square">
                  <img src={resolveImgSrc(ws.img)} alt={ws.title} className="w-full h-full object-cover" />
                  {/* Removed the level badge completely */}
                  {typeof ws.spotsLeft === 'number' && (
                    <div
                      className={`absolute bottom-3 left-3 bg-[#E74C3C] text-white text-[10px] px-2 py-1 rounded-full ${ws.spotsLeft <= 3 ? 'animate-pulse ring-2 ring-white shadow-md' : ''}`}
                    >
                      Only {ws.spotsLeft} spots left
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{ws.title}</h3>
                  <p className="text-slate-400 text-xs mb-3 line-clamp-1">{ws.description}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                    <span>🗓 {ws.date}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">₹{ws.price}</span>
                    <span className="text-slate-400 text-[10px]">per person</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
            {studentImages.map((img, idx) => (
              <div
                key={idx}
                className="w-[300px] h-[300px] flex-none rounded-xl overflow-hidden flex items-center justify-center snap-start"
              >
                <img src={resolveImgSrc(img)} className="w-full h-full object-cover" alt="Student work" />
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
                <Link href="/contact" className="inline-block bg-[#E76F51] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#D35400] transition-colors">
                  Book Your Event
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 items-center gap-8 mb-16">
            <div className="flex justify-center md:justify-start group cursor-pointer bg-white rounded-2xl p-2 ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md">
              <img src="/images/ev1.png" alt="" className="w-[360px] md:w-[480px] h-auto object-contain rounded-xl transition-all group-hover:scale-105 group-hover:shadow-md hover:scale-105 active:scale-105" />
            </div>
            <div className="bg-[#FFF8F2] text-slate-800 text-base md:text-lg px-4 md:px-6 py-5 rounded-2xl ring-1 ring-[#E2C48D] shadow-sm text-left md:text-left transition-shadow hover:shadow-md">
              <div className="text-[12px] md:text-sm font-semibold uppercase tracking-wide mb-2 text-[#6A2424]">Date Night: Crafting Memories</div>
              <div className="h-1 w-12 bg-[#E76F51] rounded-full mb-4"></div>
              <p className="leading-relaxed max-w-md md:max-w-lg">
                Spend a romantic evening in our serene studio, connecting through the tactile experience of shaping raw earth together on the pottery wheel. It’s a mindful escape for couples.
              </p>
              <div className="flex gap-2 flex-wrap mt-4">
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">Couples</span>
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">Guided</span>
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">All Levels</span>
              </div>
              <Link href="/contact" className="inline-block mt-4 bg-[#E76F51] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#D35400] transition-colors">Book Date Night</Link>
              <button onClick={() => openModal('date-night')} className="inline-block mt-3 ml-2 bg-white text-slate-900 px-4 py-2 rounded-full ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md">Register Interest</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 items-center gap-8 mb-16">
            <div className="flex justify-center md:justify-start group cursor-pointer bg-white rounded-2xl p-2 ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md">
              <img src="/images/e3.png" alt="" className="w-[360px] md:w-[480px] h-auto object-contain rounded-xl transition-all group-hover:scale-105 group-hover:shadow-md hover:scale-105 active:scale-105" />
            </div>
            <div className="bg-[#FFF8F2] text-slate-800 text-base md:text-lg px-4 md:px-6 py-5 rounded-2xl ring-1 ring-[#E2C48D] shadow-sm text-left md:text-left transition-shadow hover:shadow-md">
              <div className="text-[12px] md:text-sm font-semibold uppercase tracking-wide mb-2 text-[#6A2424]">Birthday Bash: Creative Celebrations</div>
              <div className="h-1 w-12 bg-[#E76F51] rounded-full mb-4"></div>
              <p className="leading-relaxed max-w-md md:max-w-lg">
                Our Birthday Blast Workshop is the ultimate creative party where guests trade traditional gifts for a hands-on adventure in clay. Under the guidance of our expert instructors, your group will dive into the mess and magic of the pottery wheel, crafting their very own "Earthen Legacy" pieces from scratch.
              </p>
              <div className="flex gap-2 flex-wrap mt-4">
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">Group Fun</span>
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">Instructor‑Led</span>
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">All Ages</span>
              </div>
              <Link href="/contact" className="inline-block mt-4 bg-[#E76F51] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#D35400] transition-colors">Plan A Birthday Bash</Link>
              <button onClick={() => openModal('birthday-bash')} className="inline-block mt-3 ml-2 bg-white text-slate-900 px-4 py-2 rounded-full ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md">Register Interest</button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 items-center gap-8 mb-16">
            <div className="flex justify-center md:justify-start group cursor-pointer bg-white rounded-2xl p-2 ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md">
              <img src="/images/e5.png" alt="" className="w-[360px] md:w-[480px] h-auto object-contain rounded-xl transition-all group-hover:scale-105 group-hover:shadow-md hover:scale-105 active:scale-105" />
            </div>
            <div className="bg-[#FFF8F2] text-slate-800 text-base md:text-lg px-4 md:px-6 py-5 rounded-2xl ring-1 ring-[#E2C48D] shadow-sm text-left md:text-left transition-shadow hover:shadow-md">
              <div className="text-[12px] md:text-sm font-semibold uppercase tracking-wide mb-2 text-[#6A2424]">Team Building: Hands‑On Harmony</div>
              <div className="h-1 w-12 bg-[#E76F51] rounded-full mb-4"></div>
              <p className="leading-relaxed max-w-md md:max-w-lg">
                Escape the conventional office setting and immerse your team in a dynamic pottery workshop designed to foster genuine connection and collaborative spirit. Our "Hands‑On Harmony" session encourages communication, problem‑solving, and creative thinking as colleagues learn to shape clay together.
              </p>
              <div className="flex gap-2 flex-wrap mt-4">
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">Team Bonding</span>
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">Communication</span>
                <span className="px-2 py-1 text-[11px] bg-white rounded-full ring-1 ring-[#E2C48D]">Creative Thinking</span>
              </div>
              <Link href="/contact" className="inline-block mt-4 bg-[#E76F51] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#D35400] transition-colors">Book Team Session</Link>
              <button onClick={() => openModal('team-building')} className="inline-block mt-3 ml-2 bg-white text-slate-900 px-4 py-2 rounded-full ring-1 ring-[#E2C48D] shadow-sm hover:shadow-md">Register Interest</button>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg ring-1 ring-[#E2C48D]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Register Interest</h3>
                  <button onClick={closeModal} className="text-slate-600 hover:text-slate-900">✕</button>
                </div>
                <div className="space-y-3">
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#E2C48D]"
                    placeholder="Your Name"
                    value={reg.name}
                    onChange={(e) => setReg((r) => ({ ...r, name: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#E2C48D]"
                    placeholder="Email"
                    value={reg.email}
                    onChange={(e) => setReg((r) => ({ ...r, email: e.target.value }))}
                  />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={submitRegistration}
                    className="px-4 py-2 rounded-full bg-[#E76F51] text-white shadow-md hover:bg-[#D35400]"
                  >
                    {regStatus === 'loading' ? 'Submitting...' : 'Submit'}
                  </button>
                  <button onClick={closeModal} className="px-4 py-2 rounded-full bg-white ring-1 ring-[#E2C48D] text-slate-900">
                    Cancel
                  </button>
                </div>
                {regStatus === 'error' && (
                  <div className="mt-3 text-sm text-red-600">Please fill all fields correctly.</div>
                )}
                {regStatus === 'success' && (
                  <div className="mt-3 text-sm text-green-600">Registered! We will contact you soon.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
