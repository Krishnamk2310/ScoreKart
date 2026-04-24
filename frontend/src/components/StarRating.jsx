import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 18 }) {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;

  return (
    <span
      className={`stars ${readonly ? 'readonly' : ''}`}
      style={{ fontSize: size }}
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= active ? 'star-filled' : 'star-empty'}`}
          onMouseEnter={() => !readonly && setHovered(star)}
          onClick={() => !readonly && onChange?.(star)}
          role={readonly ? undefined : 'button'}
          aria-label={readonly ? undefined : `Rate ${star} stars`}
        >
          ★
        </span>
      ))}
    </span>
  );
}
