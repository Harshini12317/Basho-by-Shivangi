'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  _id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  image?: string;
  videoUrl?: string;
  testimonialType: 'text' | 'video';
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
}

interface UserReview {
  _id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  image?: string;
  videoUrl?: string;
  testimonialType: 'text' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'text-only' | 'photo' | 'video'>('all');
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'text-only' | 'photo' | 'video'>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5,
    image: '',
    videoUrl: '',
    testimonialType: 'text' as 'text' | 'video',
    isPublished: false,
    featured: false,
  });

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/admin/testimonials');
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await fetch('/api/admin/user-reviews');
      const data = await response.json();
      setUserReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTestimonials();
    fetchUserReviews();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      message: '',
      rating: 5,
      image: '',
      videoUrl: '',
      testimonialType: 'text' as 'text' | 'video',
      isPublished: false,
      featured: false,
    });
  };

  const getFilteredReviews = () => {
    return userReviews.filter(review => {
      if (reviewFilter === 'all') return true;
      if (reviewFilter === 'text-only') return !review.image && !review.videoUrl;
      if (reviewFilter === 'photo') return review.image && !review.videoUrl;
      if (reviewFilter === 'video') return review.videoUrl;
      
      return true;
    });
  };

  const getFilteredTestimonials = () => {
    return testimonials.filter(testimonial => {
      if (testimonialFilter === 'all') return true;
      if (testimonialFilter === 'text-only') return !testimonial.image && !testimonial.videoUrl;
      if (testimonialFilter === 'photo') return testimonial.image && !testimonial.videoUrl;
      if (testimonialFilter === 'video') return testimonial.videoUrl;
      
      return true;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTestimonial ? '/api/admin/testimonials' : '/api/admin/testimonials';
      const method = editingTestimonial ? 'PUT' : 'POST';
      const body = editingTestimonial
        ? { id: editingTestimonial._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchTestimonials();
        setShowForm(false);
        setEditingTestimonial(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save testimonial:', error);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      email: testimonial.email,
      message: testimonial.message,
      rating: testimonial.rating,
      image: testimonial.image || '',
      videoUrl: testimonial.videoUrl || '',
      testimonialType: testimonial.testimonialType || 'text',
      isPublished: testimonial.isPublished,
      featured: testimonial.featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTestimonials(testimonials.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
    }
  };

  const handleAddToWebsite = async (userReview: UserReview) => {
    try {
      // Update user review status to approved - this will create the testimonial on the backend
      const response = await fetch('/api/admin/user-reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userReview._id,
          action: 'approve',
          testimonialType: userReview.testimonialType,
          videoUrl: userReview.videoUrl,
          image: userReview.image,
          reviewedBy: 'Admin',
        }),
      });

      if (response.ok) {
        fetchTestimonials();
        fetchUserReviews();
      }
    } catch (error) {
      console.error('Failed to add testimonial:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'button'}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={`text-lg ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
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
      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex gap-4">
          <a
            href="/admin/dashboard"
            className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </a>
          <a
            href="/admin/testimonials"
            className="bg-slate-900 text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Testimonials
          </a>
        </nav>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Testimonials & Reviews</h1>
          <p className="mt-2 text-slate-600">Review and manage customer testimonials. Approve pending reviews to publish them on the website.</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
              {renderStars(formData.rating, true, (rating) => setFormData(prev => ({ ...prev, rating })))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Testimonial Type *</label>
              <select
                value={formData.testimonialType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, testimonialType: e.target.value as 'text' | 'video' }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="text">Text Testimonial</option>
                <option value="video">Video Testimonial</option>
              </select>
            </div>

            {formData.testimonialType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Video URL *</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  required={formData.testimonialType === 'video'}
                />
              </div>
            )}

            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-700">Published</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-700">Featured</span>
              </label>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTestimonial(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                {editingTestimonial ? 'Update' : 'Create'} Testimonial
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Reviews Section */}
      {userReviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">All Reviews</h2>
          <p className="text-slate-600 mb-4">Manage all customer reviews. Filter by type below. Pending reviews await approval, approved reviews are published, and rejected reviews are hidden.</p>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Reviews ({userReviews.length})
            </button>
            <button
              onClick={() => setReviewFilter('text-only')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'text-only'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Text Only ({userReviews.filter(r => !r.image && !r.videoUrl).length})
            </button>
            <button
              onClick={() => setReviewFilter('photo')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'photo'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              With Photo ({userReviews.filter(r => r.image && !r.videoUrl).length})
            </button>
            <button
              onClick={() => setReviewFilter('video')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'video'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              With Video ({userReviews.filter(r => r.videoUrl).length})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredReviews().length > 0 ? (
              getFilteredReviews().map((review) => (
            <div key={review._id} className={`rounded-lg shadow-sm border p-6 ${
              review.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
              review.status === 'approved' ? 'bg-green-50 border-green-200' :
              'bg-red-50 border-red-200'
            }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.image ? (
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-600 font-medium">
                          {review.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-slate-900">{review.name}</h3>
                      <p className="text-sm text-slate-500">{review.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    review.testimonialType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {review.testimonialType === 'video' ? 'Video' : 'Text'}
                  </span>
                </div>

                <div className="mb-4">
                  {renderStars(review.rating)}
                </div>

                <p className="text-slate-700 mb-4">&quot;{review.message}&quot;</p>

                {review.image && review.testimonialType === 'text' && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-2">Photo Submitted:</p>
                    <img
                      src={review.image}
                      alt="User uploaded"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {review.videoUrl && review.testimonialType === 'video' && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-2">Video Submitted:</p>
                    <video
                      src={review.videoUrl}
                      controls
                      className="w-full h-48 object-cover rounded-lg bg-gray-900"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                  <span>Submitted: {new Date(review.submittedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  {review.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAddToWebsite(review)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Approve & Add
                      </button>
                      <button
                        onClick={async () => {
                          await fetch('/api/admin/user-reviews', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: review._id, action: 'reject', reviewedBy: 'Admin' }),
                          });
                          fetchUserReviews();
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="w-full px-4 py-2 rounded-lg text-sm font-medium text-center" style={{
                      backgroundColor: review.status === 'approved' ? '#d1fae5' : '#fee2e2',
                      color: review.status === 'approved' ? '#065f46' : '#991b1b'
                    }}>
                      {review.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </div>
                  )}
                </div>
              </div>
              ))
            ) : (
              <div className="col-span-1 lg:col-span-2 bg-slate-50 rounded-lg p-8 text-center">
                <p className="text-slate-600 font-medium">No reviews found with selected filter</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Approved Testimonials</h2>
        <p className="mt-2 text-slate-600">These testimonials are currently displayed on the website. Click Edit to modify or Delete to remove.</p>
        
        {/* Testimonials Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setTestimonialFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              testimonialFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({testimonials.length})
          </button>
          <button
            onClick={() => setTestimonialFilter('text-only')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              testimonialFilter === 'text-only'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Text Only ({testimonials.filter(t => !t.image && !t.videoUrl).length})
          </button>
          <button
            onClick={() => setTestimonialFilter('photo')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              testimonialFilter === 'photo'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            With Photo ({testimonials.filter(t => t.image && !t.videoUrl).length})
          </button>
          <button
            onClick={() => setTestimonialFilter('video')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              testimonialFilter === 'video'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            With Video ({testimonials.filter(t => t.videoUrl).length})
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredTestimonials().length > 0 ? (
          getFilteredTestimonials().map((testimonial) => (
            <div key={testimonial._id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-600 font-medium">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-slate-900">{testimonial.name}</h3>
                    <p className="text-sm text-slate-500">{testimonial.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {testimonial.featured && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    testimonial.testimonialType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {testimonial.testimonialType === 'video' ? 'Video' : 'Text'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    testimonial.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testimonial.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                {renderStars(testimonial.rating)}
              </div>

              <p className="text-slate-700 mb-4 line-clamp-3">&quot;{testimonial.message}&quot;</p>

              {testimonial.image && testimonial.testimonialType === 'text' && (
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">Photo:</p>
                  <img
                    src={testimonial.image}
                    alt="Testimonial"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}

              {testimonial.videoUrl && testimonial.testimonialType === 'video' && (
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">Video:</p>
                  <video
                    src={testimonial.videoUrl}
                    controls
                    className="w-full h-40 object-cover rounded-lg bg-gray-900"
                  />
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>{new Date(testimonial.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-50 rounded-lg p-8 text-center">
            <p className="text-slate-600 font-medium">No testimonials found with selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
}