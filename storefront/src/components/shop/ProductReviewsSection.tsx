'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle2, MessageSquarePlus, Filter, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Review, ReviewSummary } from '@/lib/types';
import { api } from '@/lib/api';

interface ProductReviewsSectionProps {
  productSlug: string;
  productTitle: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor - Not recommended',
  2: 'Fair - Could be better',
  3: 'Good - Met expectations',
  4: 'Very Good - Highly satisfied',
  5: 'Excellent - Absolutely love it!'
};

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productSlug,
  productTitle
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter & Sort
  const [selectedStar, setSelectedStar] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');

  // Helpful votes state (track locally voted review IDs)
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await api.getProductReviews(productSlug);
        if (isMounted) {
          setReviews(data.reviews || []);
          setSummary(data.summary || null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Failed to load reviews:', err);
          setError('Unable to load customer reviews at this moment.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [productSlug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || author.trim().length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setFormError('Please write at least a short review comment (minimum 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const newReview = await api.submitProductReview(productSlug, {
        author: author.trim(),
        rating,
        title: title.trim() || 'Genuine and Recommended',
        comment: comment.trim()
      });

      // Optimistically prepend review
      setReviews(prev => [newReview, ...prev]);

      // Update summary
      setSummary(prev => {
        if (!prev) return null;
        const newTotal = prev.totalReviews + 1;
        const newDist = { ...prev.distribution };
        newDist[rating as keyof typeof newDist] = (newDist[rating as keyof typeof newDist] || 0) + 1;
        const currentSum = prev.averageRating * prev.totalReviews;
        const newAvg = Number(((currentSum + rating) / newTotal).toFixed(1));
        return {
          averageRating: newAvg,
          totalReviews: newTotal,
          distribution: newDist
        };
      });

      setSubmitSuccess(true);
      setAuthor('');
      setTitle('');
      setComment('');
      setRating(5);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsFormOpen(false);
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit your review. Please try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteHelpful = async (reviewId: string) => {
    if (votedReviews.has(reviewId)) return;
    try {
      setVotedReviews(prev => new Set([...prev, reviewId]));
      setReviews(prev =>
        prev.map(r => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
      );
      await api.voteReviewHelpful(reviewId);
    } catch (err) {
      console.error('Failed to vote helpful:', err);
    }
  };

  // Filter & sort
  const filteredReviews = reviews.filter(r => {
    if (selectedStar === 'all') return true;
    return Math.round(r.rating) === selectedStar;
  });

  filteredReviews.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    if (sortBy === 'helpful') {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    }
    return 0;
  });

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="space-y-8">
      {/* 1. Header Overview & Distribution */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Average Score */}
          <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Customer Satisfaction
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">
                {summary?.averageRating || '5.0'}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 5.0</span>
            </div>

            {/* Stars visual */}
            <div className="flex items-center gap-1 my-2 text-amber-400">
              {[1, 2, 3, 4, 5].map(star => {
                const avg = summary?.averageRating || 5;
                const filled = star <= Math.round(avg);
                return (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                );
              })}
            </div>

            <p className="text-xs text-slate-500 font-medium mt-1">
              Based on <strong className="text-slate-800">{summary?.totalReviews || reviews.length}</strong> verified ratings
            </p>

            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{isFormOpen ? 'Close Form' : 'Write a Review'}</span>
            </button>
          </div>

          {/* Right Column: Breakdown Progress Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = summary?.distribution[stars as keyof typeof summary.distribution] || 0;
              const total = summary?.totalReviews || 1;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <button
                  key={stars}
                  onClick={() => setSelectedStar(selectedStar === stars ? 'all' : stars)}
                  className={`w-full flex items-center gap-3 p-1.5 rounded-lg transition-colors text-left group cursor-pointer ${
                    selectedStar === stars ? 'bg-blue-50/80 ring-1 ring-blue-300' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-bold text-slate-700">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="w-16 text-right shrink-0 text-[11px] font-semibold text-slate-500 group-hover:text-slate-900">
                    <span>{percent}%</span> <span className="text-slate-400">({count})</span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 2. Interactive Write Review Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 sm:p-8 shadow-md transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Write a Verified Review
              </h3>
              <p className="text-xs text-slate-500">
                Share your authentic feedback for &quot;{productTitle}&quot;
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Buyer
            </span>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(starNum => (
                    <button
                      type="button"
                      key={starNum}
                      onClick={() => setRating(starNum)}
                      onMouseEnter={() => setHoverRating(starNum)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          starNum <= activeRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {RATING_LABELS[activeRating]}
                </span>
              </div>
            </div>

            {/* Author Name & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hossain"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. High efficiency & reliable performance"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Review Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="What did you like or dislike about this product? How is the performance during daily use?"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 transition-colors"
              />
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Thank you! Your verified review has been submitted and published live.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        {/* Star Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedStar('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedStar === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Ratings ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map(s => {
            const cnt = reviews.filter(r => Math.round(r.rating) === s).length;
            return (
              <button
                key={s}
                onClick={() => setSelectedStar(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedStar === s
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s}</span>
                <Star className={`w-3 h-3 ${selectedStar === s ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                <span>({cnt})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* 4. Reviews List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading verified customer feedback...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="font-bold text-slate-700 text-sm mb-1">No reviews found for this filter</p>
          <p>Be the first customer to write a review for this rating level!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(rev => {
            const isVoted = votedReviews.has(rev.id);
            const initial = rev.author.charAt(0).toUpperCase();

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors space-y-3"
              >
                {/* Review Header: User & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Stars for this review */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star
                        key={st}
                        className={`w-3.5 h-3.5 ${
                          st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Title & Comment */}
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    {rev.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                {/* Helpful Button */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                  <span className="text-[11px]">Was this review helpful?</span>
                  <button
                    onClick={() => handleVoteHelpful(rev.id)}
                    disabled={isVoted}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isVoted
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-blue-600 text-blue-600' : ''}`} />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
