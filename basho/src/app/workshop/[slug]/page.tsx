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
  const [loading, setLoading] = useState(true);
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

    if (slugStr) {
      fetchWorkshop();
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
              <img src={workshop.image} className="w-full h-auto md:h-[380px] object-cover rounded-2xl" alt={workshop.title} />
            </div>
            <div
              className="p-6 md:p-12 text-[#1F2A1E] flex flex-col items-center justify-center shadow-inner"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, #A9B88E 0%, #90A678 48%, #7E9667 100%)',
              }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase text-center">{workshop.title}</h1>
              <div className="mt-6 space-y-2 max-w-xl text-center">
                <p className="text-sm md:text-base">{workshop.description}</p>
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
                <div className="text-sm text-slate-700">{workshop.level}</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">Recommended skill level</div>
              </div>
              <div className="bg-[#EEF2F7] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                    <FaCalendarAlt className="text-[#2563EB]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Date & Time</div>
                </div>
                <div className="text-sm text-slate-700">By Appointment</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">Schedule during registration</div>
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
                  <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                    <FaUsers className="text-[#14B8A6]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Class Size</div>
                </div>
                <div className="text-sm text-slate-700">{workshop.seats} seats</div>
                <div className="text-xs text-slate-500 border-t mt-2 pt-2">One‑on‑one guidance</div>
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

          

          

          <div className="grid md:grid-cols-2 gap-8 pt-8 pb-10 px-6 md:px-12 border-t border-slate-100">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-900">What you will learn</h3>
              <p className="text-slate-700">{workshop.whatYouWillLearn}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-900">Includes</h3>
              <p className="text-slate-700">{workshop.includes}</p>
            </div>
          </div>

          <div className="p-10 md:p-12 border-t border-slate-100">
            <h3 className="text-xl font-semibold mb-6 text-slate-900">More Information</h3>
            <p className="text-slate-700">{workshop.moreInfo}</p>
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
