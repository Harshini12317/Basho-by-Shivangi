"use client";
import React, { useMemo, useState, useEffect } from 'react';

interface ModalProps {
  workshopTitle: string;
  workshopDate?: string; // e.g. "Feb 5, 2026"
  workshopPrice?: number;
  onClose: () => void;
}

export default function RegistrationModal({ workshopTitle, workshopDate, workshopPrice, onClose }: ModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [members, setMembers] = useState(1);
  const [requests, setRequests] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Advanced">("Beginner");
  const [timeSlot, setTimeSlot] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const timeSlots = [
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM",
  ];
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRazorpayLoaded(true);
    }
  }, []);

  const pricePerPerson = workshopPrice || 65; // Use passed price or default
  const totalPrice = pricePerPerson * members;
  const priceDisplay = `₹${pricePerPerson} per person (Total: ₹${totalPrice})`;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    
    try {
      // Create Razorpay order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'INR',
          receipt: `workshop_${workshopTitle}_${Date.now()}`,
        }),
      });

      const orderData = await response.json();

      if (orderData.id) {
        // Initialize Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Basho Pottery Studio',
          description: `${workshopTitle} Workshop Registration`,
          order_id: orderData.id,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  customer: { name, email, phone },
                  workshop: workshopTitle,
                  date: workshopDate,
                  timeSlot,
                  members,
                  requests,
                  level,
                  totalAmount: totalPrice,
                },
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              setPaymentSuccess(true);
              setPaymentInitiated(false);
              setShowSuccessPopup(true);
            }
          },
          prefill: {
            name,
            email,
            contact: phone,
          },
          theme: {
            color: '#C63D3D',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setPaymentInitiated(true);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setSubmitted(false);
    }
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
      `Number of Members: ${members}`,
      requests ? `Special Requests: ${requests}` : undefined,
      `Experience Level: ${level}`,
      `Total Paid: ₹${totalPrice}`,
    ].filter(Boolean).join("\n");
    const details = encodeURIComponent(detailLines);
    const location = encodeURIComponent("Basho Pottery Studio, New Delhi");
    const url = `${base}&text=${text}&dates=${startUTC}/${endUTC}&details=${details}&location=${location}&ctz=${encodeURIComponent(timeZone)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-[24px] overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative bg-gradient-to-br from-[#F8F7F2] via-[#F5EBDD] to-[#F0E6D2] p-8 md:p-12 border-2 border-[#EAD9C6] shadow-2xl rounded-[32px] backdrop-blur-sm">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white shadow-md hover:bg-slate-50 flex items-center justify-center transition-all duration-200 group border border-slate-100"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-[#C63D3D] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C63D3D]/10 rounded-full mb-4">
              <svg className="w-8 h-8 text-[#C63D3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-serif font-bold text-slate-900 tracking-wide mb-2">
              WORKSHOP REGISTRATION
            </h1>
            <p className="text-slate-600 text-sm md:text-base italic">
              Session: {workshopDate || "TBD"} (2 hours)
            </p>
          </div>

          {/* form */}
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-1">
              <label className="block text-slate-800 font-medium text-sm uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-sm px-4 py-3 border-2 border-transparent border-b-4 border-b-[#C63D3D] focus:border-[#C63D3D] focus:ring-4 focus:ring-[#C63D3D]/10 outline-none text-slate-900 placeholder-slate-400 transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-800 font-medium text-sm uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-sm px-4 py-3 border-2 border-transparent border-b-4 border-b-[#C63D3D] focus:border-[#C63D3D] focus:ring-4 focus:ring-[#C63D3D]/10 outline-none text-slate-900 placeholder-slate-400 transition-all duration-200"
                  placeholder="your.email@example.com"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-800 font-medium text-sm uppercase tracking-wide">Phone Number <span className="text-slate-500 font-normal">(optional)</span></label>
              <div className="relative">
                <input
                  type="tel"
                  className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-sm px-4 py-3 border-2 border-transparent border-b-4 border-b-[#C63D3D] focus:border-[#C63D3D] focus:ring-4 focus:ring-[#C63D3D]/10 outline-none text-slate-900 placeholder-slate-400 transition-all duration-200"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-800 font-medium text-sm uppercase tracking-wide">Number of Members</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-sm px-4 py-3 border-2 border-transparent border-b-4 border-b-[#C63D3D] focus:border-[#C63D3D] focus:ring-4 focus:ring-[#C63D3D]/10 outline-none text-slate-900 placeholder-slate-400 transition-all duration-200"
                  placeholder="1"
                  value={members}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMembers(parseInt(e.target.value) || 1)}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-1">
              <label className="block text-slate-800 font-medium text-sm uppercase tracking-wide">Select Time Slot</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                      timeSlot === slot
                        ? "bg-[#C63D3D] text-white border-[#C63D3D]"
                        : "bg-white/60 text-slate-700 border-transparent hover:border-[#C63D3D]/30"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {timeSlot === "" && <p className="text-xs text-[#C63D3D] mt-1">* Please select a time slot</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-slate-800 font-medium text-sm uppercase tracking-wide">Special Requests <span className="text-slate-500 font-normal">(optional)</span></label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-sm px-4 py-3 border-2 border-transparent border-b-4 border-b-[#C63D3D] focus:border-[#C63D3D] focus:ring-4 focus:ring-[#C63D3D]/10 outline-none text-slate-900 placeholder-slate-400 transition-all duration-200"
                  placeholder="Any special requirements or notes"
                  value={requests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequests(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <label className="block text-slate-800 font-medium text-sm uppercase tracking-wide">Experience Level</label>
              <div className="flex items-center gap-8">
                <label className="group relative flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-[#C63D3D]/30 transition-all duration-200">
                  <input
                    type="radio"
                    name="exp"
                    className="w-4 h-4 text-[#C63D3D] border-2 border-slate-300 focus:ring-[#C63D3D] focus:ring-offset-0"
                    checked={level === "Beginner"}
                    onChange={() => setLevel("Beginner")}
                  />
                  <span className="text-slate-800 font-medium">Beginner</span>
                  <div className="absolute inset-0 rounded-xl bg-[#C63D3D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </label>
                <label className="group relative flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-[#C63D3D]/30 transition-all duration-200">
                  <input
                    type="radio"
                    name="exp"
                    className="w-4 h-4 text-[#C63D3D] border-2 border-slate-300 focus:ring-[#C63D3D] focus:ring-offset-0"
                    checked={level === "Advanced"}
                    onChange={() => setLevel("Advanced")}
                  />
                  <span className="text-slate-800 font-medium">Advanced</span>
                  <div className="absolute inset-0 rounded-xl bg-[#C63D3D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </label>
              </div>
            </div>

            {/* Price Display */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#C63D3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-slate-800 font-semibold text-lg">Workshop Price</span>
                </div>
                <p className="text-slate-700 text-base mb-1">{priceDisplay}</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#C63D3D] to-[#A22C2C] h-2 rounded-full transition-all duration-300" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={!razorpayLoaded || paymentInitiated || !timeSlot}
                className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C63D3D] to-[#A22C2C] text-white font-bold text-lg tracking-wide shadow-lg hover:shadow-xl hover:from-[#B33636] hover:to-[#8B2A2A] transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {paymentInitiated ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    PROCEED TO PAYMENT
                  </>
                )}
              </button>
            </div>

            {submitted && !paymentInitiated && !paymentSuccess && (
              <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-blue-800 font-medium">Initiating secure payment...</p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 rounded-3xl border-4 border-green-200 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  onClose();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-200"
                aria-label="Close success popup"
              >
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Success Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
                  Payment Confirmed!
                </h2>
                <p className="text-green-700 text-lg font-medium">
                  Workshop Registration Successful
                </p>
              </div>

              {/* Details */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-green-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Workshop:</span>
                    <span className="font-medium text-slate-800">{workshopTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date:</span>
                    <span className="font-medium text-slate-800">{workshopDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Members:</span>
                    <span className="font-medium text-slate-800">{members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Paid:</span>
                    <span className="font-bold text-green-700">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Google Calendar Button */}
              <button
                onClick={openGoogleCalendar}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                </svg>
                Add to Google Calendar
              </button>

              {/* Additional Info */}
              <p className="text-center text-green-600 text-sm mt-4">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}