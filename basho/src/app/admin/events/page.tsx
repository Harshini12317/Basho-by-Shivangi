'use client';

import { useEffect, useState } from 'react';

interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  locationLink?: string;
  images: string[];
  type: 'workshop' | 'exhibition' | 'fair' | 'other';
  isPublished: boolean;
  featured: boolean;
  registrationRequired: boolean;
  maxAttendees?: number;
  currentAttendees: number;
}

interface EventBooking {
  _id: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  locationLink: string;
  images: string[];
  type: 'workshop' | 'exhibition' | 'fair' | 'other';
  isPublished: boolean;
  featured: boolean;
  registrationRequired: boolean;
  maxAttendees: string;
  uploading: boolean;
  uploadProgress: number;
}

export default function EventsManagement() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventForBookings, setSelectedEventForBookings] = useState<string | null>(null);
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    locationLink: '',
    images: [],
    type: 'other',
    isPublished: true,
    featured: false,
    registrationRequired: false,
    maxAttendees: '',
    uploading: false,
    uploadProgress: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (eventId: string) => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`/api/admin/event-bookings?eventId=${eventId}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      locationLink: '',
      images: [],
      type: 'other',
      isPublished: true,
      featured: false,
      registrationRequired: false,
      maxAttendees: '',
      uploading: false,
      uploadProgress: 0,
    });
  };

  const handleEdit = (event: IEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      locationLink: event.locationLink || '',
      images: event.images,
      type: event.type,
      isPublished: event.isPublished,
      featured: event.featured,
      registrationRequired: event.registrationRequired,
      maxAttendees: event.maxAttendees?.toString() || '',
      uploading: false,
      uploadProgress: 0,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFormData({ ...formData, uploading: true, uploadProgress: 0 });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      try {
        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formDataObj,
        });

        if (response.ok) {
          const result = await response.json();
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.secure_url],
            uploadProgress: Math.round(((i + 1) / files.length) * 100),
          }));
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }

    setFormData((prev) => ({
      ...prev,
      uploading: false,
      uploadProgress: 0,
    }));

    // Reset file input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const eventData = {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        location: formData.location,
        locationLink: formData.locationLink || undefined,
        images: formData.images,
        type: formData.type,
        isPublished: formData.isPublished,
        featured: formData.featured,
        registrationRequired: formData.registrationRequired,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        currentAttendees: editingEvent?.currentAttendees || 0,
      };

      const url = editingEvent ? '/api/admin/events' : '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';
      const body = editingEvent ? { id: editingEvent._id, ...eventData } : eventData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchEvents();
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
      } else {
        setError(result.error || 'Failed to save event');
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      setError(error instanceof Error ? error.message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch('/api/admin/event-bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status }),
      });

      if (response.ok) {
        if (selectedEventForBookings) {
          await fetchBookings(selectedEventForBookings);
        }
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/admin/event-bookings?id=${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (selectedEventForBookings) {
          await fetchBookings(selectedEventForBookings);
        }
      }
    } catch (error) {
      console.error('Failed to delete booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Events Management</h1>
          <p className="mt-2 text-slate-600">Add, edit, and manage events. View customer bookings.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingEvent(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Event
          </button>
          <a href="/admin/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </a>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  setError(null);
                  resetForm();
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="other">Other</option>
                    <option value="workshop">Workshop</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Link</label>
                <input
                  type="url"
                  value={formData.locationLink}
                  onChange={(e) => setFormData({ ...formData, locationLink: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://maps.google.com/... or location website URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Images</label>
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={formData.uploading}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.uploading && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${formData.uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Attendees</label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Published</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.registrationRequired}
                    onChange={(e) => setFormData({ ...formData, registrationRequired: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Registration Required</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                    setError(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-300 text-slate-900 rounded-md hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {events.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {event.images.length > 0 && (
              <img src={event.images[0]} alt={event.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-2">{event.title}</h3>
              <p className="text-sm text-slate-600 mb-2 line-clamp-2">{event.description}</p>
              <p className="text-xs text-slate-500 mb-3">
                📅 {new Date(event.date).toLocaleDateString()}
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    event.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {event.isPublished ? 'Published' : 'Draft'}
                </span>
                {event.featured && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedEventForBookings(event._id);
                    fetchBookings(event._id);
                  }}
                  className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                  Bookings
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Modal */}
      {selectedEventForBookings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-900">
                Event Bookings - {events.find((e) => e._id === selectedEventForBookings)?.title}
              </h2>
              <button
                onClick={() => {
                  setSelectedEventForBookings(null);
                  setBookings([]);
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {loadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No bookings yet for this event.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">Phone</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">Guests</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-2 text-sm">{booking.customerName}</td>
                          <td className="px-4 py-2 text-sm">{booking.customerPhone}</td>
                          <td className="px-4 py-2 text-sm">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm">{booking.numberOfGuests}</td>
                          <td className="px-4 py-2 text-sm">
                            <select
                              value={booking.status}
                              onChange={(e) =>
                                updateBookingStatus(
                                  booking._id,
                                  e.target.value as 'pending' | 'confirmed' | 'cancelled'
                                )
                              }
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <button
                              onClick={() => deleteBooking(booking._id)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No events yet. Create your first event!</p>
        </div>
      )}
    </div>
  );
}
//       endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
//       location: event.location,
//       images: event.images || [],
//       type: event.type,
//       isPublished: event.isPublished,
//       featured: event.featured,
//       registrationRequired: event.registrationRequired,
//       maxAttendees: event.maxAttendees || 0,
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this event?')) return;

//     try {
//       const response = await fetch(`/api/admin/events?id=${id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         await fetchEvents();
//       }
//     } catch (error) {
//       console.error('Failed to delete event:', error);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       description: '',
//       date: '',
//       endDate: '',
//       location: '',
//       images: [],
//       type: 'other',
//       isPublished: true,
//       featured: false,
//       registrationRequired: false,
//       maxAttendees: 0,
//     });
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
//         <button
//           onClick={() => {
//             setShowForm(true);
//             setEditingEvent(null);
//             resetForm();
//           }}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Add Event
//         </button>
//       </div>

//       {showForm && (
//         <div className="bg-white p-6 rounded-lg shadow-md border">
//           <h2 className="text-xl font-semibold mb-4">
//             {editingEvent ? 'Edit Event' : 'Add New Event'}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Title
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Type
//                 </label>
//                 <select
//                   value={formData.type}
//                   onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value as "workshop" | "exhibition" | "fair" | "other" })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="workshop">Workshop</option>
//                   <option value="exhibition">Exhibition</option>
//                   <option value="fair">Fair</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Location
//               </label>
//               <input
//                 type="text"
//                 value={formData.location}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Start Date
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.date}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   End Date (Optional)
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.endDate}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Max Attendees
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.maxAttendees}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 0 })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   min="0"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Current Attendees
//                 </label>
//                 <input
//                   type="number"
//                   value={0}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
//                   disabled
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Images (one per line)
//               </label>
//               <textarea
//                 value={formData.images.join('\n')}
//                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, images: e.target.value.split('\n').filter((url: string) => url.trim()) })}
//                 rows={3}
//                 placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
//                 rows={4}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="isPublished"
//                   checked={formData.isPublished}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isPublished: e.target.checked })}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-700">
//                   Published
//                 </label>
//               </div>
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="featured"
//                   checked={formData.featured}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, featured: e.target.checked })}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
//                   Featured
//                 </label>
//               </div>
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="registrationRequired"
//                   checked={formData.registrationRequired}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, registrationRequired: e.target.checked })}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="registrationRequired" className="ml-2 text-sm font-medium text-gray-700">
//                   Registration Required
//                 </label>
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <button
//                 type="submit"
//                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 {editingEvent ? 'Update' : 'Create'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForm(false);
//                   setEditingEvent(null);
//                   resetForm();
//                 }}
//                 className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="space-y-4">
//         {events.map((event) => (
//           <div key={event._id} className="bg-white rounded-lg shadow-md border p-6">
//             <div className="flex justify-between items-start">
//               <div className="flex-1">
//                 <div className="flex items-center gap-4 mb-2">
//                   <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
//                   <span className={`px-2 py-1 text-xs rounded-full ${
//                     event.isPublished
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {event.isPublished ? 'Published' : 'Draft'}
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
//                   <div>
//                     <strong>Date:</strong> {formatDate(event.date.toISOString().split('T')[0])}
//                     {event.endDate && ` - ${formatDate(event.endDate.toISOString().split('T')[0])}`}
//                   </div>
//                   <div>
//                     <strong>Type:</strong> {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
//                   </div>
//                   <div>
//                     <strong>Location:</strong> {event.location}
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
//                   {event.maxAttendees && event.maxAttendees > 0 && (
//                     <div>
//                       <strong>Capacity:</strong> {event.currentAttendees}/{event.maxAttendees}
//                     </div>
//                   )}
//                   <div>
//                     <strong>Registration:</strong> {event.registrationRequired ? 'Required' : 'Not Required'}
//                   </div>
//                 </div>
//                 {event.featured && (
//                   <div className="text-sm text-blue-600 mb-3">
//                     <strong>⭐ Featured Event</strong>
//                   </div>
//                 )}
//                 {event.images && event.images.length > 0 && (
//                   <div className="text-sm text-gray-600 mb-3">
//                     <strong>Images:</strong> {event.images.length} uploaded
//                   </div>
//                 )}
//                 <p className="text-gray-700">{event.description}</p>
//               </div>
//               <div className="flex gap-2 ml-4">
//                 <button
//                   onClick={() => handleEdit(event)}
//                   className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(event._id.toString())}
//                   className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {events.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-gray-500">No events found. Add your first event!</p>
//         </div>
//       )}
//     </div>
//   );
// }