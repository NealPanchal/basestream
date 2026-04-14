'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';
import { ContentRowProps } from '@/types';

const ContentRow = ({
  title,
  items,
  loading = false,
  type = 'all',
}: ContentRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHoveringRow, setIsHoveringRow] = useState(false);

  const checkScrollState = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollState, { passive: true });
    checkScrollState();
    return () => el.removeEventListener('scroll', checkScrollState);
  }, [checkScrollState, items]);

  const scroll = (dir: 'left' | 'right') => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="mb-10">
        <SkeletonLoader type="row" count={1} />
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <motion.section
      className="mb-10"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      onMouseEnter={() => setIsHoveringRow(true)}
      onMouseLeave={() => setIsHoveringRow(false)}
    >
      {/* Row header */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: isHoveringRow ? 1 : 0, x: isHoveringRow ? 0 : -8 }}
          className="text-xs text-base-blue font-semibold cursor-pointer hover:underline select-none"
        >
          See all
        </motion.span>
      </div>

      <div className="relative group/row">
        {/* Left arrow */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              key="left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-0 bottom-0 z-20 w-12 hidden md:flex items-center justify-center bg-gradient-to-r from-black/80 to-transparent hover:from-black transition-all duration-200 rounded-l-md"
              aria-label="Scroll left"
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 transition-colors"
              >
                <ChevronLeft size={18} className="text-white" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right arrow */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              key="right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-0 bottom-0 z-20 w-12 hidden md:flex items-center justify-center bg-gradient-to-l from-black/80 to-transparent hover:from-black transition-all duration-200 rounded-r-md"
              aria-label="Scroll right"
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 transition-colors"
              >
                <ChevronRight size={18} className="text-white" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable strip — overflow-visible on y so cards can expand upward */}
        <div
          ref={rowRef}
          className="flex gap-2.5 overflow-x-auto overflow-y-visible scrollbar-hide px-1 pb-16 pt-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((item, index) => {
            const mediaItem = item as any;
            let mediaType: 'movie' | 'tv';
            let cardTitle: string;
            let releaseDate: string | undefined;
            let firstAirDate: string | undefined;

            if ('media_type' in mediaItem) {
              mediaType =
                mediaItem.media_type === 'person' ? 'movie' : mediaItem.media_type;
              cardTitle = mediaItem.title || mediaItem.name || '';
              releaseDate = mediaItem.release_date;
              firstAirDate = mediaItem.first_air_date;
            } else if ('title' in mediaItem) {
              mediaType = 'movie';
              cardTitle = mediaItem.title;
              releaseDate = mediaItem.release_date;
            } else {
              mediaType = 'tv';
              cardTitle = mediaItem.name;
              firstAirDate = mediaItem.first_air_date;
            }

            return (
              <div
                key={`${item.id}-${index}`}
                style={{ scrollSnapAlign: 'start' }}
              >
                <MovieCard
                  id={item.id}
                  title={cardTitle}
                  poster_path={item.poster_path}
                  backdrop_path={item.backdrop_path}
                  vote_average={item.vote_average}
                  release_date={releaseDate}
                  first_air_date={firstAirDate}
                  media_type={mediaType}
                  season={mediaItem.season}
                  episode={mediaItem.episode}
                  progress={mediaItem.progress}
                />
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default ContentRow;
