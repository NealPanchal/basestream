'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, ThumbsUp, Share2, ArrowLeft, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useMovieDetails } from '@/lib/tmdb';
import ContentRow from '@/components/ContentRow';
import SkeletonLoader from '@/components/SkeletonLoader';
import { addToWatchHistory } from '@/utils/storage';

export default function MovieDetailPage() {
  const { address: walletAddress } = useAccount();
  const params = useParams();
  const movieId = params.id as string;
  const { data: movie, isLoading, error } = useMovieDetails(movieId);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      addToWatchHistory({
        id: movie.id,
        title: movie.title,
        media_type: 'movie',
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
      }, walletAddress);
    }
  }, [movie, walletAddress]);

  const handlePlay = () => {
    setPlayerLoading(true);
    setShowPlayer(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-black">
        <div className="relative h-[70vh] mb-8">
          <SkeletonLoader type="hero" count={1} />
        </div>
        <div className="container mx-auto px-4">
          <SkeletonLoader type="row" count={2} />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-base-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-6">The movie you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-base-blue text-white rounded-lg hover:bg-base-blue-hover transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-movie.jpg';

  const embedUrl = `https://www.vidking.net/embed/movie/${movie.id}?autoPlay=true&color=0052FF`;

  return (
    <div className="min-h-screen bg-base-black font-base">
      {/* Fullscreen Player Overlay */}
      <AnimatePresence>
        {showPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            {/* Close bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={() => setShowPlayer(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">{movie.title}</span>
              </button>
              <span className="text-gray-500 text-sm">Powered by VidKing</span>
            </div>

            {/* Player iframe */}
            <div className="flex-1 relative">
              {playerLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 border-4 border-base-blue border-t-transparent rounded-full"
                  />
                </div>
              )}
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                onLoad={() => setPlayerLoading(false)}
                title={movie.title}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <section className="relative min-h-[75vh] flex items-end pb-12">
        {/* Backdrop */}
        {backdropUrl && (
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          </div>
        )}

        <div className="relative container mx-auto px-6">
          <motion.div
            className="flex flex-col md:flex-row gap-8 items-end md:items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Poster */}
            <motion.div
              className="flex-shrink-0 hidden md:block"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-48 lg:w-56 rounded-xl shadow-2xl border border-white/10"
              />
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              {/* Genres */}
              <motion.div
                className="flex flex-wrap gap-2 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {movie.genres?.slice(0, 3).map((genre: any) => (
                  <span
                    key={genre.id}
                    className="text-xs bg-white/10 border border-white/20 text-gray-300 rounded-full px-3 py-1"
                  >
                    {genre.name}
                  </span>
                ))}
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {movie.title}
              </motion.h1>

              {/* Meta */}
              <motion.div
                className="flex flex-wrap items-center gap-4 mb-5 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                  <Star size={14} fill="currentColor" />
                  {movie.vote_average?.toFixed(1)}
                </span>
                {movie.release_date && (
                  <span className="text-gray-400">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={13} />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
                <span className="border border-gray-600 text-gray-400 px-1.5 py-0.5 rounded text-xs">
                  {movie.original_language?.toUpperCase()}
                </span>
              </motion.div>

              {/* Tagline */}
              {movie.tagline && (
                <motion.p
                  className="text-gray-400 italic mb-4 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  "{movie.tagline}"
                </motion.p>
              )}

              {/* Overview */}
              <motion.p
                className="text-gray-300 leading-relaxed mb-8 max-w-2xl line-clamp-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {movie.overview}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                {/* Play Now — primary CTA */}
                <motion.button
                  onClick={handlePlay}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-white text-black rounded-lg font-bold text-base hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Play size={20} fill="black" />
                  Play Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gray-700/70 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-gray-600/80 transition-colors"
                >
                  <Plus size={18} />
                  My List
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gray-700/70 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-gray-600/80 transition-colors"
                >
                  <ThumbsUp size={18} />
                  Like
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gray-700/70 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-gray-600/80 transition-colors"
                >
                  <Share2 size={18} />
                  Share
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Movie stats */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { label: 'Budget', value: movie.budget ? `$${(movie.budget / 1e6).toFixed(0)}M` : 'N/A' },
            { label: 'Revenue', value: movie.revenue ? `$${(movie.revenue / 1e6).toFixed(0)}M` : 'N/A' },
            { label: 'Status', value: movie.status || 'N/A' },
            { label: 'Votes', value: movie.vote_count?.toLocaleString() ?? 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <span className="text-gray-400 text-xs uppercase tracking-wide block mb-1">{label}</span>
              <span className="text-white font-semibold">{value}</span>
            </div>
          ))}
        </motion.div>

        {/* Similar Movies */}
        {movie.similar?.results && movie.similar.results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ContentRow
              title="Similar Movies"
              items={movie.similar.results}
              loading={false}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
