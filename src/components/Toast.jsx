import React, { useEffect } from 'react';

const Toast = ({ message, id, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="toast-notification">
      <span>{message}</span>
    </div>
  );
};

export default Toast;
