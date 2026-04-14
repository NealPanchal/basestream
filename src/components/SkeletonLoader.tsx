'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'hero' | 'text' | 'row';
  count?: number;
}

const SkeletonLoader = ({ type = 'card', count = 1 }: SkeletonLoaderProps) => {
  const renderCard = () => (
    <div className="animate-pulse">
      <div className="bg-base-gray rounded-lg aspect-[2/3] mb-2"></div>
      <div className="h-4 bg-base-gray rounded mb-2"></div>
      <div className="h-3 bg-base-gray rounded w-3/4"></div>
    </div>
  );

  const renderHero = () => (
    <div className="animate-pulse">
      <div className="h-96 bg-base-gray rounded-lg mb-8"></div>
      <div className="h-8 bg-base-gray rounded mb-4 w-3/4"></div>
      <div className="h-4 bg-base-gray rounded mb-2"></div>
      <div className="h-4 bg-base-gray rounded mb-2 w-5/6"></div>
      <div className="h-4 bg-base-gray rounded w-4/6"></div>
    </div>
  );

  const renderText = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-base-gray rounded mb-2"></div>
      <div className="h-4 bg-base-gray rounded mb-2 w-5/6"></div>
      <div className="h-4 bg-base-gray rounded w-4/6"></div>
    </div>
  );

  const renderRow = () => (
    <div className="animate-pulse">
      <div className="h-6 bg-base-gray rounded mb-4 w-48"></div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex-shrink-0">
            <div className="bg-base-gray rounded-lg w-48 aspect-[2/3]"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'hero':
        return renderHero();
      case 'text':
        return renderText();
      case 'row':
        return renderRow();
      case 'card':
      default:
        return renderCard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={type === 'row' ? 'mb-8' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </motion.div>
  );
};

export default SkeletonLoader;
