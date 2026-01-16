'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  images: string[];
  type: string;
}

interface BookingFormData {
  name: string;
  phone: string;
  bookingDate: string;
  numberOfGuests: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    bookingDate: '',
    numberOfGuests: 1,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowBookingForm(true);
    setBookingSuccess(false);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent || !formData.name || !formData.phone || !formData.bookingDate) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/event-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          customerName: formData.name,
          customerPhone: formData.phone,
          bookingDate: new Date(formData.bookingDate),
          numberOfGuests: formData.numberOfGuests,
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
        setFormData({
          name: '',
          phone: '',
          bookingDate: '',
          numberOfGuests: 1,
        });
        setTimeout(() => {
          setShowBookingForm(false);
          setSelectedEvent(null);
          setBookingSuccess(false);
        }, 2000);
      } else {
        alert('Failed to book event. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit booking:', error);
      alert('Failed to book event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E5022]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-12 px-4 sm:px-8" style={{backgroundImage: 'url(/images/i2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3d2b1f] mb-4">Events & Experiences</h1>
          <p className="text-lg text-slate-600">Discover and book our upcoming events, workshops, and special experiences.</p>
          <Link href="/" className="text-[#8E5022] hover:text-[#652810] font-semibold mt-4 inline-block">← Back to Home</Link>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-600 text-lg">No events available at the moment.</p>
            <Link href="/" className="text-[#8E5022] hover:text-[#652810] font-semibold mt-4 inline-block">Explore Workshops</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow ring-1 ring-[#E2C48D]">
                {event.images.length > 0 && (
                  <img src={event.images[0]} alt={event.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl text-[#3d2b1f] flex-1">{event.title}</h3>
                    <span className="text-xs bg-[#EDD8B4] text-[#6A2424] px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      {event.type}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-slate-700">
                      <strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-700">
                      <strong>📍 Location:</strong> {event.location}
                    </p>
                  </div>

                  <button
                    onClick={() => handleBookEvent(event)}
                    className="w-full bg-[#E76F51] text-white px-4 py-3 rounded-full font-semibold hover:bg-[#D35400] transition-colors shadow-md"
                  >
                    Book Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {bookingSuccess ? (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Booking Confirmed!</h3>
                <p className="text-slate-600">Thank you for booking "{selectedEvent.title}". We'll contact you shortly to confirm your reservation.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                  <h2 className="text-xl font-semibold text-slate-900">Book Event</h2>
                  <button
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedEvent(null);
                      setFormData({ name: '', phone: '', bookingDate: '', numberOfGuests: 1 });
                    }}
                    className="text-slate-600 hover:text-slate-900 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Event: <strong>{selectedEvent.title}</strong></p>
                    <p className="text-xs text-slate-600">📅 {new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.bookingDate}
                      onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingForm(false);
                        setSelectedEvent(null);
                        setFormData({ name: '', phone: '', bookingDate: '', numberOfGuests: 1 });
                      }}
                      className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-[#E76F51] text-white rounded-lg hover:bg-[#D35400] disabled:opacity-50 transition-colors font-semibold"
                    >
                      {submitting ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
