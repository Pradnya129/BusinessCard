import React from 'react';
import './SkeltonLoader.css';

const SkeletonLoader = ({ height = 200 }) => {
  return (
    <div
      className="skeleton-loader"
      style={{ height: `${height}px` }}
    ></div>
  );
};

export default SkeletonLoader;
