'use client';
import { useState, useEffect } from 'react';

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
  createdAt: string;
  updatedAt: string;
}

export default function WorkshopManagement() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'None' as 'None' | 'Beginner' | 'Intermediate' | 'Advanced',
    location: '',
    googleMapLink: '',
    price: 0,
    whatYouWillLearn: '',
    includes: '',
    moreInfo: '',
    images: [] as File[],
    imageUrls: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('/api/admin/workshops');
      const data = await response.json();
      setWorkshops(data);
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
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

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() ||
        !formData.googleMapLink.trim() || !formData.whatYouWillLearn.trim() ||
        !formData.includes.trim() || !formData.moreInfo.trim() || formData.images.length === 0) {
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

      const payload = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        location: formData.location,
        googleMapLink: formData.googleMapLink,
        price: formData.price,
        whatYouWillLearn: formData.whatYouWillLearn,
        includes: formData.includes,
        moreInfo: formData.moreInfo,
        images: imageDataUrls,
      };

      const response = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          level: 'None',
          location: '',
          googleMapLink: '',
          price: 0,
          whatYouWillLearn: '',
          includes: '',
          moreInfo: '',
          images: [],
          imageUrls: []
        });
        setShowAddForm(false);
        fetchWorkshops();
      } else {
        alert('Failed to add workshop');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading workshop');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setFormData({
      title: workshop.title,
      description: workshop.description,
      level: workshop.level,
      location: workshop.location,
      googleMapLink: workshop.googleMapLink,
      price: workshop.price,
      whatYouWillLearn: workshop.whatYouWillLearn,
      includes: workshop.includes,
      moreInfo: workshop.moreInfo,
      images: [],
      imageUrls: workshop.images,
    });
    setSelectedWorkshop(workshop);
    setShowAddForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshop) return;

    setUploading(true);
    try {
      let imageDataUrls: string[] = [];
      if (formData.images.length > 0) {
        // Convert new images to base64
        const imagePromises = formData.images.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        imageDataUrls = await Promise.all(imagePromises);
      }

      const payload = {
        id: selectedWorkshop._id,
        title: formData.title,
        description: formData.description,
        level: formData.level,
        location: formData.location,
        googleMapLink: formData.googleMapLink,
        price: formData.price,
        whatYouWillLearn: formData.whatYouWillLearn,
        includes: formData.includes,
        moreInfo: formData.moreInfo,
        ...(imageDataUrls.length > 0 && { images: imageDataUrls }),
      };

      const response = await fetch('/api/admin/workshops', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          level: 'None',
          location: '',
          googleMapLink: '',
          price: 0,
          whatYouWillLearn: '',
          includes: '',
          moreInfo: '',
          images: [],
          imageUrls: []
        });
        setShowAddForm(false);
        setSelectedWorkshop(null);
        fetchWorkshops();
      } else {
        alert('Failed to update workshop');
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert('Error updating workshop');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const response = await fetch(`/api/admin/workshops?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWorkshops();
      } else {
        alert('Failed to delete workshop');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting workshop');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E5022]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workshop Management</h1>
          <div className="flex gap-2">
            <a
              href="/admin/dashboard"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </a>
            <button
              onClick={() => {
                setSelectedWorkshop(null);
                setFormData({
                  title: '',
                  description: '',
                  level: 'None',
                  location: '',
                  googleMapLink: '',
                  price: 0,
                  whatYouWillLearn: '',
                  includes: '',
                  moreInfo: '',
                  images: [],
                  imageUrls: []
                });
                setShowAddForm(true);
              }}
              className="bg-[#8E5022] text-white px-4 py-2 rounded-lg hover:bg-[#7a4520] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Workshop
            </button>
          </div>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {workshops.length > 0 ? (
            workshops.map((workshop) => (
              <div key={workshop._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={workshop.images?.[0] || workshop.image || '/images/img12.png'}
                    alt={workshop.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-[#8E5022] text-white px-2 py-1 rounded text-sm">
                    {workshop.level}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{workshop.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#8E5022] font-bold">₹{workshop.price}</span>
                    <span className="text-gray-500 text-sm">{workshop.seats} seats</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(workshop)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(workshop._id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops yet</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first workshop. Click the &quot;Add Workshop&quot; button above to begin.</p>
                <button
                  onClick={() => {
                    setSelectedWorkshop(null);
                    setFormData({
                      title: '',
                      description: '',
                      level: 'None',
                      location: '',
                      googleMapLink: '',
                      price: 0,
                      whatYouWillLearn: '',
                      includes: '',
                      moreInfo: '',
                      images: [],
                      imageUrls: []
                    });
                    setShowAddForm(true);
                  }}
                  className="bg-[#8E5022] text-white px-6 py-3 rounded-lg hover:bg-[#7a4520] transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Workshop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
                </h2>

                <form onSubmit={selectedWorkshop ? handleUpdate : handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as "None" | "Beginner" | "Intermediate" | "Advanced" }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      >
                        <option value="None">None</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Map Link</label>
                    <input
                      type="url"
                      value={formData.googleMapLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, googleMapLink: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What You Will Learn</label>
                    <textarea
                      value={formData.whatYouWillLearn}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatYouWillLearn: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Includes</label>
                    <textarea
                      value={formData.includes}
                      onChange={(e) => setFormData(prev => ({ ...prev, includes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">More Info</label>
                    <textarea
                      value={formData.moreInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, moreInfo: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Images (Upload multiple images)</label>
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">
                        {formData.imageUrls.length > 0 
                          ? `${formData.imageUrls.length} image(s) selected` 
                          : 'No images selected. Upload at least one image.'}
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E5022]"
                      required={!selectedWorkshop && formData.imageUrls.length === 0}
                    />
                    {formData.imageUrls.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Image Previews:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {formData.imageUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={url} 
                                alt={`Preview ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="hidden group-hover:block bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                              <span className="absolute top-1 right-1 bg-gray-900 text-white px-2 py-1 rounded text-xs">
                                {index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-[#8E5022] text-white px-4 py-2 rounded-lg hover:bg-[#7a4520] transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Saving...' : (selectedWorkshop ? 'Update Workshop' : 'Add Workshop')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedWorkshop(null);
                      }}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}