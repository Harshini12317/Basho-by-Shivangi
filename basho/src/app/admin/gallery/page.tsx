'use client';

import { useState, useEffect } from 'react';
import { IGallery } from '@/models/Gallery';

interface GalleryFormData {
  title: string;
  image: string;
  category: "product" | "workshop" | "studio" | "others";
  publicId?: string;
}

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<IGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IGallery | null>(null);
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    image: '',
    category: 'others',
    publicId: '',
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<{url: string, publicId: string}> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return { url: data.url, publicId: data.publicId };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;
      let publicId = formData.publicId;

      // If editing and no new file selected, keep existing image and publicId
      if (editingItem && !selectedFile) {
        imageUrl = editingItem.image;
        publicId = editingItem.publicId || '';
      }
      // If new file selected, upload it
      else if (selectedFile) {
        setUploading(true);
        const uploadResult = await uploadToCloudinary(selectedFile);
        imageUrl = uploadResult.url;
        publicId = uploadResult.publicId;
        setUploading(false);
      }

      const submitData = {
        title: formData.title,
        image: imageUrl,
        category: formData.category,
        publicId: publicId,
      };

      const url = editingItem
        ? '/api/admin/gallery'
        : '/api/admin/gallery';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingItem ? { id: editingItem._id, ...submitData } : submitData
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
      setUploading(false);
    }
  };

  const handleEdit = (item: IGallery) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      image: item.image,
      category: item.category,
      publicId: item.publicId || '',
    });
    setSelectedFile(null);
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
      image: '',
      category: 'others',
      publicId: '',
    });
    setSelectedFile(null);
  };

  const categories = [
    'product',
    'workshop',
    'studio',
    'others'
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
        <div className="flex gap-2">
          <a href="/admin/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </a>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
              resetForm();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Gallery Photo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo Title
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value as "product" | "workshop" | "studio" | "others" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="product">Product</option>
                  <option value="workshop">Workshop</option>
                  <option value="studio">Studio</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingItem}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
              {editingItem && !selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Current image will be kept if no new file is selected
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : (editingItem ? 'Update' : 'Create')}
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
          <div key={item._id.toString()} className="bg-white rounded-lg shadow-md border overflow-hidden">
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
              </div>
              <p className="text-sm text-gray-600 mb-2 capitalize">{item.category}</p>
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
          <p className="text-gray-500">No gallery photos found. Add your first gallery photo!</p>
        </div>
      )}
    </div>
  );
}