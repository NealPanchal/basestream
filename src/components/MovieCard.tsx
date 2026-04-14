'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Plus, ThumbsUp, Info, Check } from 'lucide-react';
import { MovieCardProps } from '@/types';
import { isFavorite, toggleFavorite, getWatchProgress } from '@/utils/storage';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const MovieCard = ({
  id,
  title,
  poster_path,
  backdrop_path,
  vote_average,
  release_date,
  first_air_date,
  media_type,
  season,
  episode,
  progress: initialProgress,
  className = '',
}: MovieCardProps) => {
  const { address } = useAccount();
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inFavorites, setInFavorites] = useState(false);

  useEffect(() => {
    setInFavorites(isFavorite(id, media_type, address));
  }, [id, media_type, address]);

  const savedProgress = getWatchProgress(id, media_type, season, episode, address);

  const progress = initialProgress || savedProgress?.percentage || 0;
  const progressPercentage = Math.min(progress, 99);

  const imageUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : '/placeholder-movie.jpg';

  const backdropUrl = backdrop_path
    ? `https://image.tmdb.org/t/p/w780${backdrop_path}`
    : null;

  const year = release_date
    ? new Date(release_date).getFullYear()
    : first_air_date
    ? new Date(first_air_date).getFullYear()
    : null;

  const playerUrl =
    media_type === 'movie'
      ? `https://www.vidking.net/embed/movie/${id}?autoPlay=true&color=0052FF`
      : `/tv/${id}${season && episode ? `?season=${season}&episode=${episode}` : ''}`;

  const detailHref = media_type === 'movie' ? `/movie/${id}` : `/tv/${id}`;

  // Fetch trailer key lazily (only on hover)
  const fetchTrailer = useCallback(async () => {
    if (trailerKey !== null || !TMDB_API_KEY) return;
    try {
      const endpoint =
        media_type === 'movie'
          ? `https://api.themoviedb.org/3/movie/${id}/videos`
          : `https://api.themoviedb.org/3/tv/${id}/videos`;
      const res = await fetch(
        `${endpoint}?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const data = await res.json();
      const trailer = data.results?.find(
        (v: any) =>
          v.site === 'YouTube' &&
          (v.type === 'Trailer' || v.type === 'Teaser')
      );
      setTrailerKey(trailer?.key ?? '');
    } catch {
      setTrailerKey('');
    }
  }, [id, media_type, trailerKey]);

  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      setIsHovered(true);
      fetchTrailer();
    }, 300);
  }, [fetchTrailer]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
    setTrailerLoaded(false);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(detailHref);
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(detailHref);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = { id, title, poster_path, backdrop_path, vote_average, release_date, first_air_date, media_type };
    toggleFavorite(item, address);
    setInFavorites(!inFavorites);
  };

  return (
    <div
      ref={cardRef}
      className={`relative flex-shrink-0 group/card ${className}`}
      onMouseEnter={() => {
        // Only enable hover if it's not a touch device
        if (window.matchMedia('(pointer: fine)').matches) {
          handleMouseEnter();
        }
      }}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        // If it's a touch device, go straight to details
        if (!window.matchMedia('(pointer: fine)').matches) {
          router.push(detailHref);
        }
      }}
      style={{ zIndex: isHovered ? 50 : 'auto' }}
    >
      {/* Base card (always visible, maintains layout space) */}
      <div className="w-[160px] md:w-[185px] aspect-[2/3] rounded-base overflow-hidden bg-base-gray cursor-pointer">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-base-gray animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="185px"
          onLoad={() => setImageLoaded(true)}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmX/9k="
        />
        {/* Progress bar */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
            <div
              className="h-full bg-base-blue"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Expanded hover card — floats above layout */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2 w-[300px] md:w-[340px] rounded-base-lg overflow-hidden bg-base-gray-light shadow-2xl cursor-pointer"
            style={{
              zIndex: 100,
              boxShadow: '0 16px 60px rgba(0, 82, 255, 0.25)',
            }}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: -10 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => router.push(detailHref)}
          >
            {/* Backdrop / Video Preview (16:9) */}
            <div className="relative w-full aspect-video bg-black overflow-hidden">
              {/* Backdrop fallback */}
              {backdropUrl && (
                <img
                  src={backdropUrl}
                  alt={title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    trailerLoaded ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              )}

              {/* YouTube trailer preview — loads lazily on hover */}
              {trailerKey && (
                <iframe
                  key={trailerKey}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                    trailerLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                  allow="autoplay; encrypted-media"
                  onLoad={() => setTrailerLoaded(true)}
                  title={`${title} preview`}
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

              {/* Rating badge */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-0.5 flex items-center gap-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-white text-xs font-semibold">
                  {vote_average?.toFixed(1)}
                </span>
              </div>

              {/* HD badge */}
              <div className="absolute top-2 right-2 border border-gray-400 text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                HD
              </div>
            </div>

            {/* Card body */}
            <div className="p-3">
              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                {/* Play */}
                <motion.button
                  onClick={handlePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
                  aria-label="Play"
                >
                  <Play size={16} fill="black" color="black" />
                </motion.button>

                {/* Add to list */}
                <motion.button
                  onClick={handleToggleFavorite}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors text-white flex-shrink-0 ${
                    inFavorites ? 'border-base-blue bg-base-blue/20' : 'border-gray-500 hover:border-base-blue'
                  }`}
                  aria-label={inFavorites ? "Remove from list" : "Add to list"}
                >
                  {inFavorites ? <Check size={16} /> : <Plus size={16} />}
                </motion.button>

                {/* Like */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors text-white flex-shrink-0"
                  aria-label="Like"
                >
                  <ThumbsUp size={14} />
                </motion.button>

                {/* Info — pushes to right */}
                <motion.button
                  onClick={handleInfo}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors text-white ml-auto flex-shrink-0"
                  aria-label="More info"
                >
                  <Info size={14} />
                </motion.button>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-sm mb-1.5 line-clamp-1">
                {title}
              </h3>

              {/* Metadata row */}
              <div className="flex items-center gap-2 flex-wrap">
                {year && (
                  <span className="text-gray-400 text-xs">{year}</span>
                )}
                {media_type === 'tv' && season && episode && (
                  <span className="text-gray-400 text-xs">
                    S{String(season).padStart(2, '0')} E{String(episode).padStart(2, '0')}
                  </span>
                )}
                <span className="text-xs border border-gray-500 text-gray-400 px-1 rounded capitalize">
                  {media_type}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieCard;
