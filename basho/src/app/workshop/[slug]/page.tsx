"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import RegistrationModal from '@/components/workshop/RegistrationModal'; // Adjust path if needed

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

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      {/* Top banner with left/right decorative flowers */}
      <div className="relative text-[#FDFCF0]">
        {/* Maroon bars (top and bottom) */}
        <div className="absolute inset-x-0 top-0 h-3 md:h-5 bg-[#9b5b2a]" />
        <div className="absolute inset-x-0 bottom-0 h-3 md:h-5 bg-[#9b5b2a]" />

        {/* Navy banner body, matching the flower background */}
        <div className="relative bg-[#1F3B5B] py-10 md:py-14 overflow-hidden">
          {/* Decorative flowers using common3.png */}
          <img
            src="/images/common3.png"
            alt="Decorative flower left"
            className="absolute left-[-14px] bottom-[-8px] w-36 md:w-52 pointer-events-none select-none transform scale-x-[-1]"
          />
          <img
            src="/images/common3.png"
            alt="Decorative flower right"
            className="absolute right-[-14px] bottom-[-8px] w-36 md:w-52 pointer-events-none select-none"
          />

          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Pottery Workshop</h1>
            <p className="mt-2 text-slate-200 text-sm md:text-base">
              Mastering Traditional Botanists and Pottery
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row items-start">
            {/* Left: Image */}
            <div className="md:w-1/2 p-10 md:p-12">
              <img src={details.image} className="w-full h-auto md:h-[380px] object-cover rounded-2xl" alt={details.title} />
            </div>

            {/* Right: Info */}
            <div className="md:w-1/2 p-10 md:p-12">
              <Link href="/workshop" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">← BACK</Link>
              <div className="mt-3 mb-2">
                <span className="inline-block text-[11px] px-2 py-1 rounded bg-slate-900/90 text-white">{details.level}</span>
              </div>

              {/* Reference-style heading */}
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Experience the Art of Clay Shaping</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">{details.description}</p>

              {/* Workshop Details list (like reference image) */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Workshop Details</h3>
                <ul className="space-y-3 text-slate-700">
                  <li>• <span className="font-medium">Duration:</span> {details.duration}</li>
                  <li>⏱ <span className="font-medium">Timings:</span> {details.timings}</li>
                  <li>📍 <span className="font-medium">Venue:</span> <a href="https://maps.google.com/?q=Basho+Pottery+Studio,+New+Delhi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{details.venue}</a> <span className="text-slate-400 text-xs">(Exact location shared post‑registration)</span></li>
                  <li>📝 <span className="font-medium">Mode of Conduct:</span> {details.mode}</li>
                </ul>
              </div>

              {/* Meta chips (date & price) */}
              <div className="flex flex-wrap gap-3 text-sm text-slate-600 mt-6 mb-4">
                <span className="inline-flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full">🗓 {details.date}</span>
                <span className="inline-flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full">💰 ₹{details.price} per person</span>
              </div>

              {/* Register button */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-slate-900 text-white py-5 rounded-full font-bold hover:bg-slate-700 transition-all shadow-md"
              >
                REGISTER FOR THIS WORKSHOP
              </button>
            </div>
          </div>
    
          {/* Optional: keep the learn/includes sections below */}
          <div className="grid md:grid-cols-2 gap-8 pt-8 pb-10 px-10 md:px-12 border-t border-slate-100">
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

          {/* More Information */}
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
    
          {/* The Modal Component */}
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