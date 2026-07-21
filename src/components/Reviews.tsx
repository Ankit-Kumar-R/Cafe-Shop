import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { dbFirestore } from '../lib/firebase.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Star } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

export function Reviews({ menuItemId }: { menuItemId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { user, dbUser } = useAuth();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [menuItemId]);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(dbFirestore, 'reviews'),
        where('menuItemId', '==', menuItemId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Please sign in to leave a review.', 'error');
      return;
    }
    if (!comment.trim()) {
      addToast('Please enter a comment.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(dbFirestore, 'reviews'), {
        menuItemId,
        userId: user.uid,
        userName: dbUser?.name || user.displayName || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      addToast('Review submitted successfully!', 'success');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      console.error(err);
      addToast('Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-display font-bold text-cream-50 mb-6">Customer Reviews</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h4 className="text-lg font-medium text-cream-50 mb-4">Leave a Review</h4>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`transition-colors ${rating >= star ? 'text-amber-500' : 'text-slate-600'}`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this item..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-cream-50 mb-4 focus:outline-none focus:border-amber-500 transition-colors resize-none h-24"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="mb-10 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
          <p className="text-slate-400">Please sign in to leave a review.</p>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-24 bg-slate-800/50 rounded-2xl w-full"></div>
          <div className="h-24 bg-slate-800/50 rounded-2xl w-full"></div>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No reviews yet. Be the first to review this item!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-cream-50">{review.userName}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-700'}`} />
                  ))}
                </div>
              </div>
              <p className="text-slate-300 text-sm mt-2">{review.comment}</p>
              {review.createdAt && (
                <p className="text-slate-500 text-xs mt-4">
                  {new Date(review.createdAt.toDate ? review.createdAt.toDate() : review.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
