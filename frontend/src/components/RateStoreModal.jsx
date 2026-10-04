import React, { useState } from 'react';
import StarRating from './StarRating';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import api from '../api/axiosClient';

const RateStoreModal = ({ store, existingRating, onClose, onSuccess }) => {
  const [rating, setRating] = useState(existingRating ? existingRating.rating : 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingRating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/ratings', {
        storeId: store._id,
        rating,
      });

      if (res.data.success) {
        onSuccess(res.data.message);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to submit rating.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {isEditing ? 'Modify Your Rating' : 'Rate This Store'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-center">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <h4 className="text-base font-bold text-slate-800">{store.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{store.address}</p>
          </div>

          <div className="py-3 px-4 bg-amber-50/50 rounded-2xl border border-amber-100/80 flex flex-col items-center justify-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Select Your Rating (1 - 5)
            </p>
            <StarRating
              rating={rating}
              interactive={true}
              onRatingChange={(val) => setRating(val)}
              size="xl"
            />
            <span className="text-xl font-extrabold text-amber-600 mt-1">
              {rating} Star{rating > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl shadow-md shadow-amber-500/20 transition-all"
            >
              {loading
                ? 'Saving...'
                : isEditing
                ? 'Update Rating'
                : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateStoreModal;
