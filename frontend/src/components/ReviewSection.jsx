import React, { useState, useEffect, useCallback } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiStar,
  FiMessageSquare,
  FiTrash2,
  FiCheckCircle,
  FiEdit3,
} from 'react-icons/fi';

const ReviewSection = ({ productId }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const data = await reviewAPI.getProductReviews(productId);
      setReviewsData(data || { averageRating: 0, totalReviews: 0, reviews: [] });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please share your thoughts in the review comment');
      return;
    }

    try {
      setSubmitting(true);
      await reviewAPI.addReview(productId, {
        rating,
        comment: comment.trim(),
      });
      toast.success('Thank you! Your review was submitted successfully.');
      setComment('');
      setFormOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewAPI.deleteReview(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const reviews = reviewsData.reviews || [];
  const average = reviewsData.averageRating ? Number(reviewsData.averageRating).toFixed(1) : '5.0';
  const total = reviewsData.totalReviews || reviews.length || 0;

  // Compute breakdown percentages
  const getRatingCount = (star) => reviews.filter((r) => r.rating === star).length;

  return (
    <section className="bg-[#111322] border border-[#1f233d] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1f233d]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#e94560]/10 border border-[#e94560]/30 rounded-2xl text-[#e94560]">
            <FiMessageSquare className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Customer Reviews & Ratings
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Verified feedback from wearers of Lankan Vibe pieces
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-[#e94560]/15"
          >
            <FiEdit3 />
            <span>{formOpen ? 'Cancel' : 'Write a Review'}</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#191d33] border border-[#2b3052] text-xs sm:text-sm font-semibold text-gray-300 hover:text-white hover:border-[#e94560] transition"
          >
            <span>Sign In to Review</span>
          </Link>
        )}
      </div>

      {/* Rating Breakdown & Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#0c0e1a] border border-[#1c2038]">
        {/* Left: Big Score */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#1c2038]">
          <span className="text-5xl font-black text-white">{total > 0 ? average : '5.0'}</span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`text-lg ${
                  star <= Math.round(Number(average))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Based on {total} customer {total === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Middle & Right: Star Bars Breakdown */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = getRatingCount(stars);
            const percentage = total > 0 ? (count / total) * 100 : stars === 5 ? 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-gray-400 font-semibold flex items-center gap-1">
                  {stars} <FiStar className="text-amber-400 text-[10px] fill-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#1b1f33] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e94560] to-[#c9a84c] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form Drawer / Accordion */}
      {formOpen && isAuthenticated && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 rounded-2xl bg-[#14172a] border border-[#e94560]/40 space-y-4 animate-fade-in shadow-xl"
        >
          <h3 className="text-base font-bold text-white">Share Your Experience</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Your Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                >
                  <FiStar
                    className={`text-2xl ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-[#c9a84c]">
                {rating === 5 && 'Outstanding ⭐⭐⭐⭐⭐'}
                {rating === 4 && 'Very Good ⭐⭐⭐⭐'}
                {rating === 3 && 'Average ⭐⭐⭐'}
                {rating === 2 && 'Fair ⭐⭐'}
                {rating === 1 && 'Poor ⭐'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Review Comments
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the fabric feel, fit, island vibes, or artisan quality..."
              required
              className="w-full bg-[#0c0e1a] text-sm text-gray-200 placeholder-gray-500 rounded-xl p-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1b1f33] text-xs font-semibold text-gray-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Loading reviews for this product...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-[#0c0e1a] border border-[#1b1f33] space-y-2">
            <FiMessageSquare className="mx-auto text-3xl text-gray-600" />
            <p className="text-sm font-semibold text-gray-300">No reviews yet</p>
            <p className="text-xs text-gray-500">
              Be the first to review this authentic Sri Lankan apparel piece!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isOwner = user && (user.id === rev.userId || user.email === rev.userEmail);
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-[#0d0f1c] border border-[#1d2138] space-y-3 hover:border-[#2d3356] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e94560]/30 to-[#c9a84c]/30 border border-[#c9a84c]/30 flex items-center justify-center text-xs font-bold text-white">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{rev.userName || 'Verified Customer'}</span>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          <FiCheckCircle className="text-[10px]" />
                          Verified
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-LK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Star Score */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`text-xs ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Delete Action if owner or admin */}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete Review"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
                  {rev.comment}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
