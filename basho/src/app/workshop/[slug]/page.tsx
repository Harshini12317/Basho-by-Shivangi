"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import RegistrationModal from '@/components/workshop/RegistrationModal'; // Adjust path if needed
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaRupeeSign, FaGraduationCap, FaQuestionCircle, FaLeaf, FaFire, FaTshirt } from 'react-icons/fa';

interface Workshop {
  _id: string;
  title: string;
  slug: string;
  description: string;
  level: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  location: string;
  googleMapLink: string;
  price: number;
  whatYouWillLearn: string;
  includes: string;
  moreInfo: string;
  image: string;
  images: string[];
  seats: number;
}

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slugStr = slug?.toString() || '';

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/workshop/${slugStr}`);
        if (response.ok) {
          const data = await response.json();
          setWorkshop(data);
        } else {
          console.error('Workshop not found');
        }
      } catch (error) {
        console.error('Error fetching workshop:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/admin/static-data');
        if (response.ok) {
          const data = await response.json();
          setFaqs(data.faqs || []);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    if (slugStr) {
      fetchWorkshop();
      fetchFAQs();
    }
  }, [slugStr]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E5022]"></div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Workshop Not Found</h1>
          <Link href="/workshops" className="text-[#8E5022] hover:underline">
            Back to Workshops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      {/* Top banner with left/right decorative flowers */}
      <div className="relative text-[#FDFCF0]">
        {/* Maroon bars (top and bottom) */}
        <div className="absolute inset-x-0 top-0 h-3 md:h-5 bg-[#9b5b2a]" />
        <div className="absolute inset-x-0 bottom-0 h-3 md:h-5 bg-[#9b5b2a]" />

        {/* Header banner */}
        <div
          className="relative py-6 sm:py-10 md:py-14 overflow-hidden text-[#F9E8E4] flex items-center justify-center min-h-[200px]"
          style={{
            backgroundImage: 'linear-gradient(180deg, #7E2A2A 0%, #6A2424 100%)',
          }}
        >

          <div className="max-w-6xl mx-auto text-center px-4">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <img
                src="/images/headerimage.png"
                alt=""
                className="w-12 sm:w-16 md:w-24 h-auto object-contain"
              />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Pottery Workshop</h1>
            </div>
            <p className="mt-1 sm:mt-2 text-slate-200 text-xs sm:text-sm md:text-base">
              Mastering Traditional Botanists and Pottery
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-5xl w-full bg-white rounded-2xl sm:rounded-3xl lg:rounded-3xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-3 sm:p-6 md:p-12 bg-[#F3EDE5]">
              <Link href="/workshop" className="inline-block text-xl sm:text-2xl md:text-3xl font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3 sm:mb-4">←</Link>
              
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-gray-200 h-auto md:h-[380px]">
                  <img 
                    src={workshop.images && workshop.images.length > 0 ? workshop.images[currentImageIndex] : workshop.image} 
                    className="w-full h-full object-cover transition-all duration-300"
                    alt={`${workshop.title} - Image ${currentImageIndex + 1}`} 
                  />
                  
                  {/* Navigation arrows */}
                  {workshop.images && workshop.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + workshop.images.length) % workshop.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % workshop.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Image counter */}
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {workshop.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail carousel */}
                {workshop.images && workshop.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {workshop.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          currentImageIndex === index 
                            ? 'border-[#8E5022] ring-2 ring-[#8E5022]' 
                            : 'border-gray-300 hover:border-[#8E5022]/50'
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div
              className="p-4 sm:p-6 md:p-12 text-[#1F2A1E] flex flex-col items-center justify-center shadow-inner"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, #A9B88E 0%, #90A678 48%, #7E9667 100%)',
              }}
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-center px-2">{workshop.title}</h1>
              <div className="mt-4 sm:mt-6 space-y-2 max-w-xl text-center">
                <p className="text-xs sm:text-sm md:text-base px-2">{workshop.description}</p>
              </div>
            </div>
          </div>

          <div className="px-3 sm:px-6 md:px-12 py-4 sm:py-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-900">Logistics & Studio Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {workshop.level !== 'None' && (
                <div className="bg-[#EEF2F7] rounded-2xl p-3 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#E9D5FF] flex items-center justify-center flex-shrink-0">
                      <FaGraduationCap className="text-[#7C3AED]" />
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">Level</div>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">{workshop.level}</div>
                  <div className="text-xs text-slate-500 border-t mt-1.5 sm:mt-2 pt-1.5 sm:pt-2">Recommended skill level</div>
                </div>
              )}
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                    <FaMapMarkerAlt className="text-[#F43F5E]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Location</div>
                </div>
                <div className="text-sm text-slate-700">
                  <a
                    href={workshop.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {workshop.location}
                  </a>
                </div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">Exact coordinates shared after registration</div>
              </div>
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                    <FaRupeeSign className="text-[#F59E0B]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Investment</div>
                </div>
                <div className="text-sm text-slate-700">₹{workshop.price} per person</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">Includes materials & firing</div>
              </div>
            </div>
          </div>

          

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8 pb-8 sm:pb-10 px-3 sm:px-6 md:px-12 border-t border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-900">What you will learn</h3>
              <p className="text-sm sm:text-base text-slate-700">{workshop.whatYouWillLearn}</p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-900">Includes</h3>
              <p className="text-sm sm:text-base text-slate-700">{workshop.includes}</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-12 border-t border-slate-100">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">More Information</h3>
            <p className="text-sm sm:text-base text-slate-700">{workshop.moreInfo}</p>
          </div>
          <div className="px-4 sm:px-6 md:px-12 pb-4 sm:pb-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-fit px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full font-bold text-white bg-[#C85428] hover:bg-[#A94721] transition-colors shadow-md"
            >
              REGISTER FOR THIS WORKSHOP
            </button>
          </div>

          

          <div className="p-4 sm:p-6 md:p-12 border-t border-slate-100 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-900">Detailed Workshop Overview</h3>
                <p className="text-sm sm:text-base text-slate-700 mb-2 sm:mb-3">This masterclass focuses on the Botanical Garden series, where you will learn to bridge the gap between raw nature and refined functional art.</p>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-700">
                  <li><span className="font-medium">Organic Silhouettes:</span> Master the pinching and coiling techniques to create intentional, organic shapes that celebrate imperfection.</li>
                  <li><span className="font-medium">Botanical Imprinting:</span> Use real flora to press intricate, whimsical patterns directly into the clay body.</li>
                  <li><span className="font-medium">The Glazing Palette:</span> Apply matte pastel glazes designed to complement the natural tones of the clay.</li>
                  <li><span className="font-medium">Wheel Basics:</span> Introductory guidance on the pottery wheel for small vessels from Shivangi.</li>
                </ul>
              </div>

              <div className="relative bg-[#F7F3E7] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#E5D8C8] shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FDE7D3] flex items-center justify-center flex-shrink-0">
                      <FaTshirt className="text-[#D97706] text-sm sm:text-base" />
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-slate-900">Enhanced More Information</h3>
                  </div>
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFE4E6] flex items-center justify-center flex-shrink-0">
                    <FaFire className="text-[#EF4444] text-sm sm:text-base" />
                  </div>
                </div>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-700">
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
                  {faqs && faqs.length > 0 ? (
                    faqs.map((faq, index) => (
                      <div key={index}>
                        <p className="font-medium">{faq.question}</p>
                        <p>{faq.answer}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">
                      <p>No FAQs available at the moment.</p>
                    </div>
                  )}
                </div>
                <img src="/images/common3.png" alt="" className="absolute right-4 bottom-4 w-20 opacity-10 pointer-events-none select-none" />
              </div>
          </div>

          {isModalOpen && (
            <RegistrationModal
              workshopTitle={workshop.title}
              workshopDate={undefined}
              workshopPrice={workshop.price}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
