'use client';

import { useState, useEffect } from 'react';

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
  reviewedAt?: string;
  reviewedBy?: string;
}

export default function AdminUserReviews() {
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      const response = await fetch('/api/admin/user-reviews');
      const data = await response.json();
      setUserReviews(data);
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'reject', testimonialType?: 'text' | 'video', videoUrl?: string) => {
    try {
      const response = await fetch('/api/admin/user-reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action,
          testimonialType,
          videoUrl,
          reviewedBy: 'Admin', // In a real app, you'd get this from auth
        }),
      });

      if (response.ok) {
        fetchUserReviews();
      }
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/admin/user-reviews?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUserReviews(userReviews.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const filteredReviews = userReviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

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
            href="/admin/user-reviews"
            className="bg-slate-900 text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            User Reviews
          </a>
          <a
            href="/admin/testimonials"
            className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Testimonials
          </a>
        </nav>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Review Submissions</h1>
          <p className="mt-2 text-slate-600">Review and approve user-submitted testimonials</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        {[
          { key: 'pending', label: 'Pending', count: userReviews.filter(r => r.status === 'pending').length },
          { key: 'approved', label: 'Approved', count: userReviews.filter(r => r.status === 'approved').length },
          { key: 'rejected', label: 'Rejected', count: userReviews.filter(r => r.status === 'rejected').length },
          { key: 'all', label: 'All', count: userReviews.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'pending' | 'approved' | 'rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === key
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
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
              <div className="flex gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                  review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  review.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                  review.testimonialType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {review.testimonialType === 'video' ? 'Video' : 'Text'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              {renderStars(review.rating)}
            </div>

            <p className="text-slate-700 mb-4">&quot;{review.message}&quot;</p>

            {review.videoUrl && (
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Video URL:</p>
                <a
                  href={review.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {review.videoUrl}
                </a>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
              <span>Submitted: {new Date(review.submittedAt).toLocaleDateString()}</span>
              {review.reviewedAt && (
                <span>Reviewed: {new Date(review.reviewedAt).toLocaleDateString()}</span>
              )}
            </div>

            {review.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const testimonialType = confirm('Is this a video testimonial?') ? 'video' : 'text';
                    let videoUrl = '';
                    if (testimonialType === 'video') {
                      videoUrl = prompt('Enter video URL (YouTube, Vimeo, etc.):') || '';
                    }
                    handleReviewAction(review._id, 'approve', testimonialType, videoUrl);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReviewAction(review._id, 'reject')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Reject
                </button>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleDelete(review._id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500">No {filter === 'all' ? '' : filter} reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}