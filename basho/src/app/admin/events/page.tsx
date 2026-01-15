'use client';

export default function EventsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <a href="/admin" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Events management is currently under development.</p>
      </div>
    </div>
  );
}
//   description: string;
//   date: string;
//   endDate: string;
//   location: string;
//   images: string[];
//   type: "workshop" | "exhibition" | "fair" | "other";
//   isPublished: boolean;
//   featured: boolean;
//   registrationRequired: boolean;
//   maxAttendees: number;
// }

// export default function EventsManagement() {
//   const [events, setEvents] = useState<IEvent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
//   const [formData, setFormData] = useState<EventFormData>({
//     title: '',
//     description: '',
//     date: '',
//     endDate: '',
//     location: '',
//     images: [],
//     type: 'other',
//     isPublished: true,
//     featured: false,
//     registrationRequired: false,
//     maxAttendees: 0,
//   });

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const response = await fetch('/api/admin/events');
//       const data = await response.json();
//       setEvents(data);
//     } catch (error) {
//       console.error('Failed to fetch events:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const url = editingEvent
//         ? '/api/admin/events'
//         : '/api/admin/events';
//       const method = editingEvent ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(
//           editingEvent ? { id: editingEvent._id, ...formData } : formData
//         ),
//       });

//       if (response.ok) {
//         await fetchEvents();
//         setShowForm(false);
//         setEditingEvent(null);
//         resetForm();
//       }
//     } catch (error) {
//       console.error('Failed to save event:', error);
//     }
//   };

//   const handleEdit = (event: IEvent) => {
//     setEditingEvent(event);
//     setFormData({
//       title: event.title,
//       description: event.description,
//       date: new Date(event.date).toISOString().split('T')[0],
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