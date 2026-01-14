'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CustomOrderPhoto {
  _id: string;
  title: string;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CustomOrderPhotosAdmin() {
  const [photos, setPhotos] = useState<CustomOrderPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<CustomOrderPhoto | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [] as File[],
    imageUrls: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/admin/custom-order-photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        images: fileArray,
        imageUrls: fileArray.map(file => URL.createObjectURL(file))
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || formData.images.length === 0) {
      alert('Please fill all fields and upload at least one image');
      return;
    }

    setUploading(true);
    try {
      // Convert images to base64 for upload
      const imagePromises = formData.images.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const imageDataUrls = await Promise.all(imagePromises);

      const response = await fetch('/api/admin/custom-order-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          images: imageDataUrls,
        }),
      });

      if (response.ok) {
        setFormData({ title: '', description: '', images: [], imageUrls: [] });
        setShowAddForm(false);
        fetchPhotos();
      } else {
        alert('Failed to add custom order photos');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom order?')) return;

    try {
      const response = await fetch(`/api/admin/custom-order-photos?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPhotos();
      } else {
        alert('Failed to delete custom order');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting custom order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/dashboard"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Custom Order Photo Management</h1>
            <p className="mt-2 text-slate-600">Manage photos and descriptions for completed custom orders</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add New Order'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Add New Custom Order Photos</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Order Name</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="e.g., Wedding Vase, Coffee Mug Set"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none h-24 resize-none"
                placeholder="Brief description of the custom order..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Photos (Multiple allowed)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                required
              />
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {formData.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Add Custom Order'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500">No custom order photos added yet</p>
          </div>
        ) : (
          photos.map((photo) => (
            <div
              key={photo._id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                {photo.images.slice(0, 2).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${photo.title} - ${index + 1}`}
                    className="w-full h-24 object-cover rounded border cursor-pointer"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setSelectedImageIndex(index);
                    }}
                  />
                ))}
                {photo.images.length > 2 && (
                  <div className="relative">
                    <img
                      src={photo.images[2]}
                      alt={`${photo.title} - 3`}
                      className="w-full h-24 object-cover rounded border cursor-pointer"
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setSelectedImageIndex(2);
                      }}
                    />
                    {photo.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                        <span className="text-white font-medium">+{photo.images.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 mb-2">{photo.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{photo.description}</p>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  {new Date(photo.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(photo._id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
            <div className="relative">
              <img
                src={selectedPhoto.images[selectedImageIndex]}
                alt={selectedPhoto.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />

              {/* Navigation arrows */}
              {selectedPhoto.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : selectedPhoto.images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev < selectedPhoto.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedPhoto.title}</h3>
              <p className="text-slate-600 mb-4">{selectedPhoto.description}</p>

              {/* Image indicators */}
              {selectedPhoto.images.length > 1 && (
                <div className="flex justify-center space-x-2">
                  {selectedPhoto.images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === selectedImageIndex ? 'bg-slate-900' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}