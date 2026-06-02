import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-row">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="skeleton-card"></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
