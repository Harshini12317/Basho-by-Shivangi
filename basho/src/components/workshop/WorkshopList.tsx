"use client";
import React from 'react';
import Link from 'next/link';

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
];

const studentImages = ['img13.png', 'img34.png', 'img12.png', 'img31.png', 'img25.png', 'img32.png', 'img5.png'];

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
    ? workshops.slice(0, 6).map((w) => {
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

  const resolveImgSrc = (src: string) => {
    if (!src) return '/images/img12.png';
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) return src;
    return `/images/${src}`;
  };

  return (
    <div className="bg-[#F8F7F2] min-h-screen py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-sm">
        <h2 className="text-3xl font-semibold text-slate-800 mb-12">Pottery Workshops</h2>
        
        {/* Workshop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {displayList.map((ws) => (
            <Link key={ws.slug} href={`/workshop/${ws.slug}`} className="group cursor-pointer">
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

        {/* Student Creations Section */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-8">Student Creations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {studentImages.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                <img src={resolveImgSrc(img)} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Student work" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}