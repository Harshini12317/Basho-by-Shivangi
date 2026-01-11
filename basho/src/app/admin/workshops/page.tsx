'use client';

import { useState, useEffect } from 'react';

interface Workshop {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'None';
  locationName: string;
  locationLink: string;
  price: number;
  learn: string[];
  includes: string[];
  prerequisites: string;
  instructor: string;
  bring: string[];
  image: string;
  duration: string;
  timings: string;
  mode: string;
  seats: number;
}

export default function WorkshopManagement() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<Partial<Workshop>>({
    title: '',
    description: '',
    level: 'Beginner',
    locationName: '',
    locationLink: '',
    price: 0,
    learn: [''],
    includes: [''],
    prerequisites: '',
    instructor: '',
    bring: [''],
    image: '',
    duration: '1 Day',
    timings: '10:00 AM - 1:00 PM',
    mode: 'Offline — in-studio session',
    seats: 20,
  });

  // Load workshops from localStorage or use dummy data
  useEffect(() => {
    const savedWorkshops = localStorage.getItem('admin-workshops');
    if (savedWorkshops) {
      setWorkshops(JSON.parse(savedWorkshops));
    } else {
      // Dummy data
      const dummyWorkshops: Workshop[] = [
        {
          id: '1',
          slug: 'cobalt-botanical',
          title: 'Cobalt Botanical',
          description: 'Master the art of traditional blue and white pottery with brushwork and layering.',
          level: 'Advanced',
          locationName: 'Basho Pottery Studio, New Delhi',
          locationLink: 'https://maps.google.com/?q=Basho+Pottery+Studio+New+Delhi',
          price: 95,
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
          prerequisites: 'Basic pottery knowledge recommended',
          instructor: 'Shivangi (Lead Instructor)',
          bring: ['Comfortable clothing', 'Water bottle'],
          image: '/images/img4.png',
          duration: '1 Day',
          timings: '10:00 AM - 1:00 PM',
          mode: 'Offline — in-studio session',
          seats: 20,
        },
        {
          id: '2',
          slug: 'rose-garden',
          title: 'Crimson Flora',
          description: 'Decorate fine ceramic mugs with delicate floral motifs and soft gradients.',
          level: 'Advanced',
          locationName: 'Basho Pottery Studio, New Delhi',
          locationLink: 'https://maps.google.com/?q=Basho+Pottery+Studio+New+Delhi',
          price: 65,
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
          prerequisites: 'Basic pottery knowledge recommended',
          instructor: 'Shivangi (Lead Instructor)',
          bring: ['Comfortable clothing', 'Water bottle'],
          image: '/images/img13.png',
          duration: '1 Day',
          timings: '10:00 AM - 1:00 PM',
          mode: 'Offline — in-studio session',
          seats: 20,
        },
      ];
      setWorkshops(dummyWorkshops);
      localStorage.setItem('admin-workshops', JSON.stringify(dummyWorkshops));
    }
  }, []);

  // Save workshops to localStorage whenever they change
  useEffect(() => {
    if (workshops.length > 0) {
      localStorage.setItem('admin-workshops', JSON.stringify(workshops));
    }
  }, [workshops]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingWorkshop) {
      // Update existing workshop
      setWorkshops(prev => prev.map(w =>
        w.id === editingWorkshop.id
          ? { ...formData, id: w.id, slug: generateSlug(formData.title || '') } as Workshop
          : w
      ));
    } else {
      // Add new workshop
      const newWorkshop: Workshop = {
        ...formData,
        id: Date.now().toString(), // eslint-disable-line react-hooks/purity
        slug: generateSlug(formData.title || ''),
      } as Workshop;
      setWorkshops(prev => [...prev, newWorkshop]);
    }

    setIsModalOpen(false);
    setEditingWorkshop(null);
    resetForm();
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'Beginner',
      locationName: '',
      locationLink: '',
      price: 0,
      learn: [''],
      includes: [''],
      prerequisites: '',
      instructor: '',
      bring: [''],
      image: '',
      duration: '1 Day',
      timings: '10:00 AM - 1:00 PM',
      mode: 'Offline — in-studio session',
      seats: 20,
    });
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData(workshop);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workshop?')) {
      setWorkshops(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleAdd = () => {
    setEditingWorkshop(null);
    resetForm();
    setIsModalOpen(true);
  };

  const updateArrayField = (field: 'learn' | 'includes' | 'bring', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => i === index ? value : item) || []
    }));
  };

  const addArrayItem = (field: 'learn' | 'includes' | 'bring') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field: 'learn' | 'includes' | 'bring', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workshop Management</h1>
          <p className="mt-2 text-slate-600">Add, edit, and delete workshops</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Workshop
        </button>
      </div>

      {/* Workshops Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Workshops ({workshops.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Seats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {workshops.map((workshop) => (
                <tr key={workshop.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{workshop.title}</div>
                    <div className="text-sm text-slate-500">{workshop.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      workshop.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      workshop.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      workshop.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workshop.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ₹{workshop.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {workshop.seats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(workshop)}
                      className="text-cyan-600 hover:text-cyan-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(workshop.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingWorkshop ? 'Edit Workshop' : 'Add Workshop'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
                  <select
                    value={formData.level || 'Beginner'}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="None">None</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location Name</label>
                  <input
                    type="text"
                    required
                    value={formData.locationName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location Link</label>
                  <input
                    type="url"
                    required
                    value={formData.locationLink || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationLink: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price per Person (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Seats</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.seats || 20}
                    onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 20 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Instructor</label>
                  <input
                    type="text"
                    required
                    value={formData.instructor || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prerequisites</label>
                <input
                  type="text"
                  value={formData.prerequisites || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* What you will learn */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What you will learn</label>
                {(formData.learn || []).map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayField('learn', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter learning objective"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('learn', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('learn')}
                  className="px-4 py-2 text-cyan-600 hover:text-cyan-800 border border-cyan-600 rounded-md hover:bg-cyan-50"
                >
                  Add Learning Objective
                </button>
              </div>

              {/* Includes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Includes</label>
                {(formData.includes || []).map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayField('includes', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="What is included"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('includes', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('includes')}
                  className="px-4 py-2 text-cyan-600 hover:text-cyan-800 border border-cyan-600 rounded-md hover:bg-cyan-50"
                >
                  Add Include Item
                </button>
              </div>

              {/* What to bring */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What to bring</label>
                {(formData.bring || []).map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayField('bring', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="What participants should bring"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('bring', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('bring')}
                  className="px-4 py-2 text-cyan-600 hover:text-cyan-800 border border-cyan-600 rounded-md hover:bg-cyan-50"
                >
                  Add Item to Bring
                </button>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                >
                  {editingWorkshop ? 'Update Workshop' : 'Add Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}