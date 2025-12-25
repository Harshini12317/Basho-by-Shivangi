"use client";
import React, { useRef } from 'react';
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

  return (
    <div className="bg-[#F8F7F2] min-h-screen py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-sm">
        <div className="-mx-8 md:-mx-16 -mt-8 md:-mt-16 mb-12">
          <div className="rounded-t-[40px] bg-[#D8A7B1] text-white text-center py-8">
            <h2 className="text-3xl md:text-4xl font-semibold">Pottery Workshop</h2>
          </div>
        </div>
        
        
        {/* Workshop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
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
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-6 py-5 shadow-sm ring-1 ring-[#E2C48D]">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center">
                    <FaLeaf />
                  </div>
                  <div className="mt-3 font-medium">Eco‑Friendly</div>
                </div>
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-6 py-5 shadow-sm ring-1 ring-[#E2C48D]">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center">
                    <FaHandSparkles />
                  </div>
                  <div className="mt-3 font-medium">Artisanal</div>
                </div>
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-6 py-5 shadow-sm ring-1 ring-[#E2C48D]">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center">
                    <FaStar />
                  </div>
                  <div className="mt-3 font-medium">High Quality</div>
                </div>
                <div className="flex flex-col items-center bg-[#F7EFE7] text-[#3B3428] rounded-[28px] px-6 py-5 shadow-sm ring-1 ring-[#E2C48D]">
                  <div className="w-12 h-12 rounded-full bg-[#6A2424] text-[#F9E8E4] flex items-center justify-center">
                    <FaChair />
                  </div>
                  <div className="mt-3 font-medium">Ergonomic</div>
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
        <div className="overflow-hidden mb-16 bg-[#4B5D3A] mt-12">
          <div className="grid md:grid-cols-2">
            <div className="relative h-[420px] md:h-[520px]">
              <img src="/images/women1.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#4B5D3A]/60" />
              <div className="relative z-10 h-full flex flex-col items-start justify-center px-6 md:px-10 text-white">
                <div className="text-3xl md:text-5xl font-semibold">Celebrate with Clay</div>
                <div className="text-lg md:text-2xl mt-2">Pottery for Events & Workshops</div>
                <p className="mt-4 max-w-xl text-sm md:text-base opacity-90">
                  Craft memories. Mold moments. Experience a unique celebration.
                </p>
              </div>
            </div>
            <div className="h-[420px] md:h-[520px] flex flex-col items-center justify-center px-8 text-center text-white">
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
      </div>
    </div>
  );
}
