"use client";
import React, { useMemo, useState } from 'react';

interface ModalProps {
  workshopTitle: string;
  workshopDate?: string; // e.g. "Feb 5, 2026"
  onClose: () => void;
}

export default function RegistrationModal({ workshopTitle, workshopDate, onClose }: ModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Advanced">("Beginner");
  const [submitted, setSubmitted] = useState(false);

  const priceDisplay = "₹65 per person";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const openGoogleCalendar = () => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startLocal = workshopDate ? new Date(workshopDate) : new Date();
    startLocal.setHours(10, 0, 0, 0);
    const endLocal = new Date(startLocal.getTime() + 2 * 60 * 60 * 1000);
    const toCal = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const startUTC = toCal(startLocal);
    const endUTC = toCal(endLocal);

    const text = encodeURIComponent(`${workshopTitle} - Pottery Workshop`);
    const detailLines = [
      `You are registered for ${workshopTitle}.`,
      name ? `Participant: ${name}` : undefined,
      email ? `Email: ${email}` : undefined,
      phone ? `Phone: ${phone}` : undefined,
      requests ? `Special Requests: ${requests}` : undefined,
      `Experience Level: ${level}`,
    ].filter(Boolean).join("\n");
    const details = encodeURIComponent(detailLines);
    const location = encodeURIComponent("Basho Pottery Studio");
    const url = `${base}&text=${text}&dates=${startUTC}/${endUTC}&details=${details}&location=${location}&ctz=${encodeURIComponent(timeZone)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-[24px] overflow-hidden">
        <div className="relative bg-[#F5EBDD] p-8 md:p-12 border border-[#EAD9C6] shadow-sm rounded-[24px]">
          <div className="text-center mb-6">
            <h1 className="text-[30px] md:text-[36px] font-serif font-extrabold text-slate-900 tracking-wide">
              WORKSHOP REGISTRATION
            </h1>
            <p className="mt-3 text-slate-700 italic">
              Session: {workshopDate || "TBD"} (2 hours)
            </p>
          </div>

          {/* form */}
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-slate-800 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full bg-white rounded-lg shadow-sm px-4 py-2 border border-transparent border-b-2 border-b-[#C63D3D] focus:border-b-[#A22C2C] outline-none text-slate-900"
                required
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-800 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full bg-white rounded-lg shadow-sm px-4 py-2 border border-transparent border-b-2 border-b-[#C63D3D] focus:border-b-[#A22C2C] outline-none text-slate-900"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-800 mb-2">Phone Number (optional)</label>
              <input
                type="tel"
                className="w-full bg-white rounded-lg shadow-sm px-4 py-2 border border-transparent border-b-2 border-b-[#C63D3D] focus:border-b-[#A22C2C] outline-none text-slate-900"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-800 mb-2">Special Requests (optional)</label>
              <input
                type="text"
                className="w-full bg-white rounded-lg shadow-sm px-4 py-2 border border-transparent border-b-2 border-b-[#C63D3D] focus:border-b-[#A22C2C] outline-none text-slate-900"
                value={requests}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequests(e.target.value)}
              />
            </div>

            {/* Experience Level */}
            <div className="mt-1">
              <label className="block text-slate-800 mb-2">Experience Level</label>
              <div className="flex items-center gap-6 text-slate-800">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exp"
                    className="accent-[#C63D3D]"
                    checked={level === "Beginner"}
                    onChange={() => setLevel("Beginner")}
                  />
                  <span>Beginner</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exp"
                    className="accent-[#C63D3D]"
                    checked={level === "Advanced"}
                    onChange={() => setLevel("Advanced")}
                  />
                  <span>Advanced</span>
                </label>
              </div>
            </div>

            {/* Price line */}
            <p className="text-center text-slate-700 mt-4">
              Workshop price: ₹65 per person
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 min-w-[190px] px-6 py-3 rounded-full bg-[#C63D3D] text-white font-semibold tracking-wide shadow-md hover:bg-[#B33636] transition"
              >
                CONFIRM BOOKING
              </button>
              <button
                type="button"
                onClick={openGoogleCalendar}
                className="flex items-center justify-center gap-2 min-w-[190px] px-6 py-3 rounded-full bg-[#1F6D45] text-white border border-[#184F3A] shadow-md hover:bg-[#17523a] transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" />
                </svg>
                Add to Google Calendar
              </button>
            </div>

            {submitted && (
              <p className="text-green-700 text-sm md:text-base mt-2 font-medium leading-tight">
                Registration received! You can add the session to your Google Calendar.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
    );
}