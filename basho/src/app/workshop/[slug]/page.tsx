"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import RegistrationModal from '@/components/workshop/RegistrationModal'; // Adjust path if needed
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaRupeeSign, FaGraduationCap, FaQuestionCircle, FaLeaf, FaFire, FaTshirt } from 'react-icons/fa';

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const slugStr = slug?.toString() || '';
  const title = slugStr.replace(/-/g, ' ');

  // Map slug to an existing image under /public/images
  const imageBySlug: Record<string, string> = {
    'cobalt-botanical': '/images/img4.png',
    'rose-garden': '/images/img3.png',
    'tropical-teal': '/images/img2.png',
    'sage-minimalist': '/images/img18.png',
    'wildflower-tea': '/images/img9.png',
    'matcha-ceremony': '/images/img33.png',
    'pastel-parchment': '/images/sculp1.png',
    'earthen-legacy': '/images/p3.jpg',
    'rustic-light': '/images/p4.jpg',
    'artisan-tableware': '/images/p1.png',
    'botanical-garden': '/images/img2.png',
    'heritage-in-hand': '/images/img10.png',
    'blue-pottery': '/images/img4.png',
  };
  const heroSrc = imageBySlug[slugStr] || '/images/img12.png';

  const workshopDetails: Record<string, {
    title: string;
    image: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    date: string;
    price: number;
    description: string;
    learn: string[];
    includes: string[];
    duration: string;
    timings: string;
    venue: string;
    mode: string;
    instructor: string;
    seats: number;
    prerequisites: string[];
    bring: string[];
    contact: string;
  }> = {
    'cobalt-botanical': {
      title: 'Cobalt Botanical',
      image: '/images/img4.png',
      level: 'Advanced',
      date: 'Jan 25, 2026',
      price: 95,
      description: 'Master the art of traditional blue and white pottery with brushwork and layering.',
      learn: [
        'Cobalt oxide brush painting basics',
        'Layering glazes for depth',
        'Kiln safety and firing schedules'
      ],
      includes: [
        'All materials & tools provided',
        'Firing and glazing included',
        'Take home one finished piece'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 20,
      prerequisites: ['Basic pottery knowledge recommended'],
      bring: ['Comfortable clothing', 'Water bottle'],
      contact: 'contact@bashoatelier.in'
    },
    'rose-garden': {
      title: 'Crimson Flora',
      image: '/images/img13.png',
      level: 'Advanced',
      date: 'Jan 29, 2026',
      price: 65,
      description: 'Decorate fine ceramic mugs with delicate floral motifs and soft gradients.',
      learn: [
        'Underglaze illustration techniques',
        'Gradient shading and transfers',
        'Finishing and sealing'
      ],
      includes: [
        'Studio tools & materials',
        'One mug per participant',
        'Snacks & beverages'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 20,
      prerequisites: ['Basic pottery knowledge recommended'],
      bring: ['Comfortable clothing', 'Water bottle'],
      contact: 'contact@bashoatelier.in'
    },
    'tropical-teal': {
      title: 'Tropical Teal',
      image: '/images/img31.png',
      level: 'Advanced',
      date: 'Feb 1, 2026',
      price: 65,
      description: 'Create stunning platters with vibrant teal glazes and tropical accents.',
      learn: [
        'Wide-surface glazing methods',
        'Tropical motif placement',
        'Platter finishing'
      ],
      includes: [
        'All materials provided',
        'Firing included',
        'Studio apron'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 20,
      prerequisites: ['Basic pottery knowledge recommended'],
      bring: ['Comfortable clothing', 'Water bottle'],
      contact: 'contact@bashoatelier.in'
    },
    'sage-minimalist': {
      title: 'Sage Minimalist',
      image: '/images/img18.png',
      level: 'Beginner',
      date: 'Feb 5, 2026',
      price: 65,
      description: 'Focus on the beauty of simplicity and smooth finishes with minimalist glazing.',
      learn: [
        'Minimalist palette selection',
        'Surface smoothing & burnishing',
        'Basic kiln firing knowledge'
      ],
      includes: [
        'Materials & glazing',
        'One piece to take home',
        'Guided instruction'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 20,
      prerequisites: ['No prior experience required'],
      bring: ['Comfortable clothing', 'Water bottle'],
      contact: 'contact@bashoatelier.in'
    },
    'wildflower-tea': {
      title: 'Wildflower Amber',
      image: '/images/img9.png',
      level: 'Intermediate',
      date: 'Feb 12, 2026',
      price: 65,
      description: 'Design a matching tea set with whimsical wildflower patterns.',
      learn: [
        'Pattern planning on sets',
        'Repeat motifs & transfers',
        'Glaze compatibility'
      ],
      includes: [
        'Tools & materials',
        'Firing for two items',
        'Light refreshments'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 20,
      prerequisites: ['Comfort with basic pottery tools'],
      bring: ['Comfortable clothing', 'Water bottle'],
      contact: 'contact@bashoatelier.in'
    },
    'matcha-ceremony': {
      title: 'Matcha Ceremony',
      image: '/images/img33.png',
      level: 'Advanced',
      date: 'Feb 18, 2026',
      price: 65,
      description: 'Craft and decorate your own authentic Matcha bowl with traditional finishing.',
      learn: [
        'Bowl shaping & trimming',
        'Traditional finish techniques',
        'Final glazing & firing'
      ],
      includes: [
        'Studio materials & tools',
        'One matcha bowl',
        'Tea tasting'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 20,
      prerequisites: ['Basic pottery knowledge recommended'],
      bring: ['Comfortable clothing', 'Water bottle'],
      contact: 'contact@bashoatelier.in'
    },
    'pastel-parchment': {
      title: 'Pastel & Parchment',
      image: '/images/sculp1.png',
      level: 'Intermediate',
      date: 'Mar 5, 2026',
      price: 85,
      description: 'Step into the world of traditional Indian pottery at Indian Art Atelier to explore the relationship between form and nature. This hands-on experience invites you to connect with age-old crafts while finding your own artistic voice. Guided by skilled artisans, you’ll shape clay into timeless pieces, learning how to handle the material to achieve organic, petal-like edges. This session ensures you carry forward a beautiful legacy while crafting your own pastel-glazed dinnerware in this workshop.',
      learn: [
        'Organic shaping techniques',
        'Pastel glazing methods',
        'Dinnerware functionality'
      ],
      includes: [
        'Clay and glazes',
        'Dinnerware set firing',
        'Expert guidance'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 15,
      prerequisites: ['None'],
      bring: ['Comfortable clothing', 'Apron'],
      contact: 'contact@bashoatelier.in'
    },
    'earthen-legacy': {
      title: 'The Earthen Legacy',
      image: '/images/p3.jpg',
      level: 'Beginner',
      date: 'Mar 12, 2026',
      price: 75,
      description: 'Uncover the tactile joy of hand-molding raw clay into contemporary functional art. Explore the balance of organic silhouettes and modern pastel glazes in this immersive heritage workshop.',
      learn: [
        'Hand-molding fundamentals',
        'Organic silhouette creation',
        'Pastel glaze application'
      ],
      includes: [
        'Raw clay and tools',
        'Firing of created pieces',
        'Refreshments'
      ],
      duration: '1 Day',
      timings: '11:00 AM - 2:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Aarav (Ceramic Artist)',
      seats: 18,
      prerequisites: ['Enthusiasm for clay'],
      bring: ['Old clothes'],
      contact: 'contact@bashoatelier.in'
    },
    'rustic-light': {
      title: 'The Rustic Light',
      image: '/images/p4.jpg',
      level: 'Beginner',
      date: 'Mar 15, 2026',
      price: 70,
      description: 'Combine the art of pottery with the warmth of candle making in a session focused on texture and light. Blend custom fragrances and hand-pour wax into artisanal ribbed vessels during this restorative workshop.',
      learn: [
        'Ribbed vessel construction',
        'Candle wax pouring',
        'Fragrance blending'
      ],
      includes: [
        'Clay for vessels',
        'Wax and wicks',
        'Custom fragrances'
      ],
      duration: '1 Day',
      timings: '3:00 PM - 6:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Meera (Glaze Specialist)',
      seats: 12,
      prerequisites: ['None'],
      bring: ['Notebook'],
      contact: 'contact@bashoatelier.in'
    },
    'artisan-tableware': {
      title: 'The Artisan Tableware',
      image: '/images/p1.png',
      level: 'Advanced',
      date: 'Mar 20, 2026',
      price: 90,
      description: 'Transform raw clay into sophisticated, deep-form serving ware designed for artistic dining. Master the tactile art of shaping and hand-decorating vessels that celebrate the beauty of handcrafted ceramics in this workshop.',
      learn: [
        'Deep-form shaping',
        'Hand-decorating techniques',
        'Serving ware design'
      ],
      includes: [
        'High-quality clay',
        'Specialty tools',
        'Firing services'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 2:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Riku (Wheel Specialist)',
      seats: 10,
      prerequisites: ['Previous wheel experience'],
      bring: ['Pottery tool kit'],
      contact: 'contact@bashoatelier.in'
    },
    'botanical-garden': {
      title: 'Botanical Garden',
      image: '/images/img2.png',
      level: 'Intermediate',
      date: 'Mar 22, 2026',
      price: 80,
      description: 'Elevate your home decor with this stunning decorative tray featuring a lush, whimsical botanical scene. Set against a vibrant turquoise backdrop, the design showcases intricately detailed birds and a delicate butterfly fluttering among blooming pink hibiscus and soft lavender foliage.',
      learn: [
        'Botanical motif composition',
        'Surface prep and painting',
        'Glaze layering on decor ware'
      ],
      includes: [
        'Tray base and tools',
        'Glazes and pigments',
        'Firing for one tray'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Shivangi (Lead Instructor)',
      seats: 16,
      prerequisites: ['None'],
      bring: ['Apron'],
      contact: 'contact@bashoatelier.in'
    },
    'heritage-in-hand': {
      title: 'Heritage in Hand',
      image: '/images/img10.png',
      level: 'Advanced',
      date: 'Mar 28, 2026',
      price: 95,
      description: 'Dive into the intersection of two ancient crafts. In this workshop, participants will explore the techniques used to create embossed ceramic textures and the art of pairing them with custom-fitted wooden elements.',
      learn: [
        'Embossing on ceramics',
        'Wood pairing and fitting',
        'Finishing and sealing'
      ],
      includes: [
        'Ceramic materials',
        'Wood components',
        'Sealers and wax'
      ],
      duration: '1 Day',
      timings: '11:00 AM - 2:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Aarav (Ceramic Artist)',
      seats: 14,
      prerequisites: ['Comfort with basic tools'],
      bring: ['Notebook'],
      contact: 'contact@bashoatelier.in'
    },
    'blue-pottery': {
      title: 'Blue Pottery',
      image: '/images/img4.png',
      level: 'Advanced',
      date: 'Apr 5, 2026',
      price: 90,
      description: 'Step into the world of classic Cobalt Blue Chinoiserie and Indigo pottery. This workshop focuses on the rhythmic art of hand-painting botanical motifs onto a crisp white ceramic base. Inspired by the traditional Jaipur Blue Pottery style, we will cover the brushwork required to create elegant floral vines and bold borders.',
      learn: [
        'Cobalt brushwork patterns',
        'Vine and border construction',
        'Glaze application and firing'
      ],
      includes: [
        'Brush set and pigments',
        'Practice tiles',
        'Firing for one piece'
      ],
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      venue: 'Basho Pottery Studio, New Delhi',
      mode: 'Offline — in-studio session',
      instructor: 'Meera (Glaze Specialist)',
      seats: 12,
      prerequisites: ['Basic painting comfort'],
      bring: ['Apron'],
      contact: 'contact@bashoatelier.in'
    },
  };
  const details = workshopDetails[slugStr] || {
    title: title,
    image: heroSrc,
    level: 'Beginner',
    date: 'TBD',
    price: 65,
    description: "In this session, you'll learn professional glazing techniques and surface decoration on stoneware.",
    learn: ['Glazing basics', 'Surface decoration', 'Firing schedules'],
    includes: ['Materials provided', 'One finished piece', 'Guided session'],
    duration: '1 Day',
    timings: '10:00 AM - 1:00 PM',
    venue: 'Basho Pottery Studio, New Delhi',
    mode: 'Offline — in-studio session',
    instructor: 'Shivangi (Lead Instructor)',
    seats: 20,
    prerequisites: ['No prior experience required'],
    bring: ['Comfortable clothing', 'Water bottle'],
    contact: 'contact@bashoatelier.in'
  };
  const descLines =
    ((details as unknown as { summaryLines?: string[] }).summaryLines &&
      Array.isArray((details as unknown as { summaryLines?: string[] }).summaryLines)
      ? (details as unknown as { summaryLines?: string[] }).summaryLines!.slice(0, 6)
      : (details.description || '')
          .split(/(?<=\.)\s+/)
          .filter((l) => l && l.trim().length > 0)
          .slice(0, 6));
  const investmentAmount = slugStr === 'pastel-parchment' ? 2199 : details.price;

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      {/* Top banner with left/right decorative flowers */}
      <div className="relative text-[#FDFCF0]">
        {/* Maroon bars (top and bottom) */}
        <div className="absolute inset-x-0 top-0 h-3 md:h-5 bg-[#9b5b2a]" />
        <div className="absolute inset-x-0 bottom-0 h-3 md:h-5 bg-[#9b5b2a]" />

        {/* Header banner */}
        <div
          className="relative py-10 md:py-14 overflow-hidden text-[#F9E8E4]"
          style={{
            backgroundImage: 'linear-gradient(180deg, #7E2A2A 0%, #6A2424 100%)',
          }}
        >

          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4">
              <img
                src="/images/headerimage.png"
                alt=""
                className="w-16 md:w-24 h-auto object-contain"
              />
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Pottery Workshop</h1>
            </div>
            <p className="mt-2 text-slate-200 text-sm md:text-base">
              Mastering Traditional Botanists and Pottery
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-6 md:p-12 bg-[#F3EDE5]">
              <Link href="/workshop" className="block text-2xl md:text-3xl font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4">←</Link>
              <img src={details.image} className="w-full h-auto md:h-[380px] object-cover rounded-2xl" alt={details.title} />
            </div>
            <div
              className="p-6 md:p-12 text-[#1F2A1E] flex flex-col items-center justify-center shadow-inner"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, #A9B88E 0%, #90A678 48%, #7E9667 100%)',
              }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase text-center">{details.title}</h1>
              <div className="mt-6 space-y-2 max-w-xl text-center">
                {descLines.map((line, i) => (
                  <p key={i} className="text-sm md:text-base">{line}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 md:px-12 py-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-900">Logistics & Studio Details</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#E9D5FF] flex items-center justify-center">
                    <FaGraduationCap className="text-[#7C3AED]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Level</div>
                </div>
                <div className="text-sm text-slate-700">{details.level}</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">Recommended skill level</div>
              </div>
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                    <FaCalendarAlt className="text-[#2563EB]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Date & Time</div>
                </div>
                <div className="text-sm text-slate-700">{details.date}</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">{details.timings}</div>
              </div>
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                    <FaMapMarkerAlt className="text-[#F43F5E]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Location</div>
                </div>
                <div className="text-sm text-slate-700">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(details.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {details.venue}
                  </a>
                </div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">Exact coordinates shared after registration</div>
              </div>
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                    <FaUsers className="text-[#14B8A6]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Class Size</div>
                </div>
                <div className="text-sm text-slate-700">{details.seats} seats</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">One‑on‑one guidance</div>
              </div>
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                    <FaRupeeSign className="text-[#F59E0B]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Investment</div>
                </div>
                <div className="text-sm text-slate-700">₹{investmentAmount} per person</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">Includes materials & firing</div>
              </div>
            </div>
          </div>

          

          

          <div className="grid md:grid-cols-2 gap-8 pt-8 pb-10 px-6 md:px-12 border-t border-slate-100">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-900">What you will learn</h3>
              <ul className="space-y-2 list-disc pl-5 text-slate-700">
                {details.learn.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-900">Includes</h3>
              <ul className="space-y-2 list-disc pl-5 text-slate-700">
                {details.includes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-10 md:p-12 border-t border-slate-100">
            <h3 className="text-xl font-semibold mb-6 text-slate-900">More Information</h3>
            <div className="grid md:grid-cols-2 gap-6 text-slate-700">
              <div>
                <p className="mb-2"><span className="font-medium">Who is this for:</span> {details.level === 'Beginner' ? 'Beginners and hobbyists looking to explore pottery.' : details.level === 'Intermediate' ? 'Learners with some pottery experience.' : 'Experienced learners looking to refine advanced techniques.'}</p>
                <p className="mb-2"><span className="font-medium">Prerequisites:</span> {details.prerequisites.join(', ')}</p>
                <p className="mb-2"><span className="font-medium">Seats Available:</span> {details.seats}</p>
                <p className="mb-2"><span className="font-medium">Instructor:</span> {details.instructor}</p>
              </div>
              <div>
                <p className="mb-2"><span className="font-medium">What to bring:</span> {details.bring.join(', ')}</p>
                <p className="mb-2"><span className="font-medium">Contact:</span> {details.contact}</p>
                <p className="text-slate-500 text-sm mt-2">Note: Exact studio location is shared after registration.</p>
              </div>
            </div>
          </div>
          <div className="px-10 md:px-12 pb-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-fit px-6 py-3 rounded-full font-bold text-white bg-[#C85428] hover:bg-[#A94721] transition-colors shadow-md"
            >
              REGISTER FOR THIS WORKSHOP
            </button>
          </div>

          

          <div className="p-6 md:p-12 border-t border-slate-100 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Detailed Workshop Overview</h3>
                <p className="text-slate-700 mb-3">This masterclass focuses on the Botanical Garden series, where you will learn to bridge the gap between raw nature and refined functional art.</p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li><span className="font-medium">Organic Silhouettes:</span> Master the pinching and coiling techniques to create intentional, organic shapes that celebrate imperfection.</li>
                  <li><span className="font-medium">Botanical Imprinting:</span> Use real flora to press intricate, whimsical patterns directly into the clay body.</li>
                  <li><span className="font-medium">The Glazing Palette:</span> Apply matte pastel glazes designed to complement the natural tones of the clay.</li>
                  <li><span className="font-medium">Wheel Basics:</span> Introductory guidance on the pottery wheel for small vessels from Shivangi.</li>
                </ul>
              </div>

              <div className="relative bg-[#F7F3E7] rounded-2xl p-6 border border-[#E5D8C8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FDE7D3] flex items-center justify-center">
                      <FaTshirt className="text-[#D97706]" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">Enhanced More Information</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#FFE4E6] flex items-center justify-center">
                    <FaFire className="text-[#EF4444]" />
                  </div>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li><span className="font-medium">Prep Your Hands:</span> Trim fingernails short to avoid unintended marks in soft clay.</li>
                  <li><span className="font-medium">Attire:</span> Wear comfortable, breathable clothes; bringing your own apron is encouraged.</li>
                  <li><span className="font-medium">The Firing Process:</span> Pieces air‑dry for a week, then undergo two separate kiln firings.</li>
                  <li><span className="font-medium">Pick‑up Schedule:</span> Finished, food‑safe pieces are ready for collection 2–3 weeks after the workshop.</li>
                </ul>
                <img src="/images/common3.png" alt="" className="absolute right-4 bottom-4 w-20 opacity-10 pointer-events-none select-none" />
              </div>

              <div className="relative bg-[#F7F3E7] rounded-2xl p-6 border border-[#E5D8C8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                      <FaQuestionCircle className="text-[#2563EB]" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">Frequently Asked Questions (FAQ)</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                    <FaLeaf className="text-[#10B981]" />
                  </div>
                </div>
                <div className="space-y-3 text-slate-700">
                  <div>
                    <p className="font-medium">Is this workshop suitable for absolute beginners?</p>
                    <p>Yes. While we offer intermediate tips, the curriculum ensures anyone can create a finished piece.</p>
                  </div>
                  <div>
                    <p className="font-medium">Are the materials safe for daily use?</p>
                    <p>Yes. We use high‑fire clay and non‑toxic, lead‑free glazes for food and microwave safety.</p>
                  </div>
                  <div>
                    <p className="font-medium">What happens if I cannot attend?</p>
                    <p>We require 48 hours’ notice for cancellations to offer a partial refund or rescheduling.</p>
                  </div>
                  <div>
                    <p className="font-medium">Can I bring my own botanical elements to imprint?</p>
                    <p>Yes. We provide local flora, and you are welcome to bring leaves or flowers from your garden.</p>
                  </div>
                  <div>
                    <p className="font-medium">Is there a contact for specific queries?</p>
                    <p>Reach out to contact@bashoatelier.in for assistance.</p>
                  </div>
                </div>
                <img src="/images/common3.png" alt="" className="absolute right-4 bottom-4 w-20 opacity-10 pointer-events-none select-none" />
              </div>
          </div>

          {isModalOpen && (
            <RegistrationModal
              workshopTitle={details.title}
              workshopDate={details.date}
              workshopPrice={details.price}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
