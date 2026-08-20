import React, { useRef } from 'react';

/**
 * Reusable modal backdrop that prevents accidental modal closure during text selection or dragging.
 */
export default function ModalBackdrop({ children, onClose, className = '', style = {} }) {
  const isDirectBackdropClick = useRef(false);

  return (
    <div
      className={`modal-backdrop ${className}`}
      style={style}
      onMouseDown={(e) => {
        // Only mark true if mousedown started directly on the backdrop itself
        isDirectBackdropClick.current = (e.target === e.currentTarget);
      }}
      onClick={(e) => {
        // Only trigger close if both mousedown and click originated directly on the backdrop
        if (isDirectBackdropClick.current && e.target === e.currentTarget && onClose) {
          onClose();
        }
        isDirectBackdropClick.current = false;
      }}
    >
      {children}
    </div>
  );
}
