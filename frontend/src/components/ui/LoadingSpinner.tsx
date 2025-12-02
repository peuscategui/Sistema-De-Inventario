'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-2 ${fullScreen ? 'min-h-screen' : ''}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-green-600`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );

  return spinner;
};

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
}

export const TableSkeletonLoader: React.FC<SkeletonLoaderProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-gray-200 rounded flex-1"
                style={{ animationDelay: `${rowIndex * 50}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

