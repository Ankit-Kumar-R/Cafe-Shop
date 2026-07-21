import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export function AddFeedback({ onFeedbackSubmitted }: { onFeedbackSubmitted?: () => void }) {
  const { user, getToken } = useAuth();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="bento-card p-6 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-cream-50 mb-2">Share Your Experience</h3>
        <p className="text-slate-400 mb-4">Please log in to leave feedback.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      });
      
      if (res.ok) {
        setSuccess(true);
        setReview('');
        setRating(5);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bento-card p-6 rounded-3xl text-center bg-green-900/20 border border-green-500/20">
        <h3 className="text-xl font-bold text-green-500 mb-2">Thank You!</h3>
        <p className="text-slate-300">Your feedback has been submitted successfully.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-amber-500 hover:text-amber-400 underline"
        >
          Submit another review
        </button>
      </div>
    );
  }

  return (
    <div className="bento-card p-6 md:p-8 rounded-3xl">
      <h3 className="text-2xl font-display font-bold text-cream-50 mb-6">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-700'}`} />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-slate-400 mb-2">Your Review</label>
          <textarea
            id="review"
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !review.trim()}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-cream-50 font-bold py-3 px-4 rounded-xl transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
