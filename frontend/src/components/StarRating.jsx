import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  interactive = false,
  onRatingChange,
  size = 'md',
  showValue = false,
  ratingCount,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const currentVal = interactive ? (hoverRating || rating) : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= currentVal;
          return (
            <button
              type="button"
              key={star}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`p-0.5 transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-125 focus:outline-none'
                  : 'cursor-default'
              }`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  filled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 ml-1">
          <span>{Number(rating).toFixed(1)}</span>
          <span className="text-slate-400 font-normal">/ 5</span>
          {ratingCount !== undefined && (
            <span className="text-xs text-slate-500 font-normal">({ratingCount})</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;
