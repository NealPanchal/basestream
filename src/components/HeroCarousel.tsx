'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Movie } from '@/types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

interface HeroCarouselProps {
  items: Movie[];
  onPlay?: (movie: Movie) => void;
}

const HeroCarousel = ({ items, onPlay }: HeroCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isTrailerReady, setIsTrailerReady] = useState(false);
  const router = useRouter();
  const autoSlideTimer = useRef<NodeJS.Timeout | null>(null);

  const activeItem = items[activeIndex];

  const resetTimer = useCallback(() => {
    if (autoSlideTimer.current) {
      clearInterval(autoSlideTimer.current);
    }
    autoSlideTimer.current = setInterval(() => {
      handleNext();
    }, 5000);
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleDotClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    };
  }, [resetTimer]);

  // Fetch trailer for the active slide
  useEffect(() => {
    setTrailerKey(null);
    setIsTrailerReady(false);

    // Delay trailer fetch to prioritize initial visual load
    const timer = setTimeout(() => {
      fetchTrailer();
    }, 2000);

    async function fetchTrailer() {
      if (!activeItem?.id || !TMDB_API_KEY) return;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${activeItem.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await res.json();
        const trailer = data.results?.find(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        if (trailer) setTrailerKey(trailer.key);
      } catch (err) {
        console.error('Hero carousel trailer fetch error', err);
      }
    }
    fetchTrailer();
    return () => clearTimeout(timer);
  }, [activeItem?.id]);

  const variants = {
    enter: (direction: number) => ({
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      opacity: 0,
    }),
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.8 },
          }}
          className="absolute inset-0"
        >
          {/* Background: Video or Image */}
          <div className="absolute inset-0">
            {trailerKey ? (
              <div className="relative w-full h-full pointer-events-none scale-110 origin-center">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&enablejsapi=1`}
                  className={`w-full h-full transition-opacity duration-1000 ${isTrailerReady ? 'opacity-100' : 'opacity-0'}`}
                  allow="autoplay; encrypted-media"
                  style={{ border: 'none' }}
                  onLoad={() => setIsTrailerReady(true)}
                />
                {/* Fallback image while trailer loads or if it fails to appear quickly */}
                {!isTrailerReady && (
                  <Image
                    src={`https://image.tmdb.org/t/p/original${activeItem.backdrop_path}`}
                    alt={activeItem.title}
                    fill
                    priority={activeIndex === 0}
                    className="object-cover"
                  />
                )}
              </div>
            ) : (
              <Image
                src={`https://image.tmdb.org/t/p/original${activeItem.backdrop_path}`}
                alt={activeItem.title}
                fill
                priority={activeIndex === 0}
                className="object-cover"
              />
            )}
            
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-base-black via-base-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-base-black/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-6 md:px-12 flex flex-col justify-center pb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black mb-4 drop-shadow-2xl">
                {activeItem.title}
              </h1>

              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 text-base md:text-lg font-semibold overflow-x-auto scrollbar-hide">
                <span className="text-green-500 whitespace-nowrap">Trending Today</span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  {activeItem.vote_average?.toFixed(1)}
                </span>
                {activeItem.release_date && (
                  <span className="text-gray-300">
                    {new Date(activeItem.release_date).getFullYear()}
                  </span>
                )}
                <span className="px-2 py-0.5 border border-gray-500 rounded text-[10px] md:text-xs uppercase whitespace-nowrap flex-shrink-0">4K Ultra HD</span>
              </div>

              <p className="text-base md:text-xl text-gray-200 mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-md">
                {activeItem.overview}
              </p>

              <div className="flex flex-wrap gap-3 md:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPlay?.(activeItem)}
                  className="px-6 md:px-10 py-3 md:py-4 bg-base-blue text-white rounded-lg transition-all font-bold text-base md:text-xl flex items-center gap-2 md:gap-3 shadow-xl hover:bg-base-blue-hover"
                >
                  <Play size={20} className="md:w-6 md:h-6" fill="white" />
                  Play
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/movie/${activeItem.id}`)}
                  className="px-6 md:px-10 py-3 md:py-4 bg-gray-500/30 text-white rounded-lg transition-all font-bold text-base md:text-xl flex items-center gap-2 md:gap-3 backdrop-blur-md border border-white/10 hover:bg-gray-500/50"
                >
                  <Info size={20} className="md:w-6 md:h-6" />
                  More Info
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Controls: Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronLeft size={40} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronRight size={40} />
      </button>

      {/* Manual Controls: Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex ? 'bg-base-blue w-8' : 'bg-gray-700 scale-75 hover:scale-100'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
