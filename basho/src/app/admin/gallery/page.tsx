'use client';

import { useState, useEffect } from 'react';
import { IGallery } from '@/models/Gallery';

interface GalleryFormData {
  title: string;
  description: string;
  image: string;
  category: "pottery" | "workshops" | "studio" | "events" | "other";
  tags: string[];
  isPublished: boolean;
  featured: boolean;
  order: number;
}

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<IGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IGallery | null>(null);
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    image: '',
    category: 'other',
    tags: [],
    isPublished: true,
    featured: false,
    order: 0,
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      const data = await response.json();
      setGallery(data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? '/api/admin/gallery'
        : '/api/admin/gallery';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingItem ? { id: editingItem._id, ...formData } : formData
        ),
      });

      if (response.ok) {
        await fetchGallery();
        setShowForm(false);
        setEditingItem(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save gallery item:', error);
    }
  };

  const handleEdit = (item: IGallery) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image: item.image,
      category: item.category,
      tags: item.tags || [],
      isPublished: item.isPublished,
      featured: item.featured,
      order: item.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;

    try {
      const response = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchGallery();
      }
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      category: 'other',
      tags: [],
      isPublished: true,
      featured: false,
      order: 0,
    });
  };

  const categories = [
    'pottery',
    'workshops',
    'studio',
    'events',
    'other'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Gallery Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value as "pottery" | "workshops" | "studio" | "events" | "other" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pottery">Pottery</option>
                  <option value="workshops">Workshops</option>
                  <option value="studio">Studio</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tags: e.target.value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) })}
                placeholder="ceramics, pottery, workshop"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-700">
                  Published
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                  Featured
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                {item.featured && <span className="text-yellow-500">⭐</span>}
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.category}</p>
              {item.tags && item.tags.length > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-gray-500">Order: {item.order}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id.toString())}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No gallery items found. Add your first gallery item!</p>
        </div>
      )}
    </div>
  );
}