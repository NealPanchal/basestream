'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import { useTrending, usePopularMovies, usePopularTV, useTopRatedMovies } from '@/lib/tmdb';
import { tmdbApiCalls } from '@/lib/tmdb-config';
import { getContinueWatching } from '@/utils/storage';
import { Movie, TVShow } from '@/types';
import AccessBadge from '@/components/AccessBadge';
import { useAccess } from '@/hooks/useAccess';

// Dynamic imports for performance
const ContentRow = dynamic(() => import('@/components/ContentRow'), { 
  loading: () => <div className="skeleton-shimmer h-48 w-full rounded-lg" />
});
const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), {
  loading: () => <div className="skeleton-shimmer w-full" style={{ height: 'clamp(480px,88vh,860px)' }} />
});
const SkeletonLoader = dynamic(() => import('@/components/SkeletonLoader'), { 
  ssr: false 
});

interface HomeClientProps {
  fallback: Record<string, any>;
}

export default function HomeClient({ fallback }: HomeClientProps) {
  return (
    <SWRConfig value={{ fallback }}>
      <HomeContent />
    </SWRConfig>
  );
}

function HomeContent() {
  const [continueWatching, setContinueWatching] = useState<(Movie | TVShow)[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerMovie, setPlayerMovie] = useState<Movie | null>(null);
  const { address } = useAccount();
  
  // No redirect here, AccessGate handles it. We just need the badge.
  const { hasAccess, timeRemaining, timeFormatted } = useAccess(false, address);
  
  // Fetch data using SWR hooks (will use fallback data instantly)
  const { data: trendingDayData, isLoading: trendingDayLoading } = useTrending('movie', 'day');
  const { data: trendingData, isLoading: trendingLoading } = useTrending('all', 'week');
  const { data: popularMoviesData, isLoading: popularMoviesLoading } = usePopularMovies();
  const { data: popularTVData, isLoading: popularTVLoading } = usePopularTV();
  const { data: topRatedMoviesData, isLoading: topRatedLoading } = useTopRatedMovies();

  useEffect(() => {
    if (address) {
      const watchedItems = getContinueWatching(address, 10);
      setContinueWatching(watchedItems);
    }
  }, [address]);

  const handlePlayContent = (movie: Movie) => {
    setPlayerMovie(movie);
    setPlayerLoading(true);
    setShowPlayer(true);
  };

  const carouselItems = trendingDayData?.results?.slice(0, 7) || [];
  const trendingMovies = trendingData?.results?.filter((item: any) => item.media_type === 'movie') || [];
  const trendingTV = trendingData?.results?.filter((item: any) => item.media_type === 'tv') || [];

  return (
    <div
      className="min-h-screen text-white font-base"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Active access indicator */}
      {hasAccess && (
        <motion.div
          className="fixed top-20 right-6 z-50 flex flex-col items-end gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <AccessBadge
            timeRemaining={timeRemaining}
            timeFormatted={timeFormatted}
            variant="default"
          />
        </motion.div>
      )}

      {/* Player Overlay */}
      <AnimatePresence mode="wait">
        {showPlayer && playerMovie && (
          <motion.div
            key="player-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={() => setShowPlayer(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">{playerMovie.title}</span>
              </button>
              {/* BaseStream watermark */}
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-4 h-4 rounded bg-base-blue flex items-center justify-center">
                  <span className="text-[8px] font-black text-white leading-none">B</span>
                </div>
                <span className="text-gray-400 text-xs font-semibold tracking-wide hidden sm:block">BaseStream</span>
              </div>
            </div>
            {/* Player wrapper — clean z-index stack */}
            <div className="flex-1 relative overflow-hidden" style={{ zIndex: 0 }}>
              {playerLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black" style={{ zIndex: 10 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 border-4 border-base-blue border-t-transparent rounded-full"
                  />
                </div>
              )}
              <iframe
                src={`https://www.vidking.net/embed/movie/${playerMovie.id}?autoPlay=true&color=0052FF`}
                className="w-full h-full border-0"
                style={{ zIndex: 1 }}
                allowFullScreen
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                onLoad={() => setPlayerLoading(false)}
              />
              {/* Minimal glass brand badge — top-right, pointer-events off */}
              <div
                aria-hidden="true"
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  zIndex: 2,
                  pointerEvents: 'none',
                  background: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  opacity: 0.70,
                }}
              >
                <div className="w-3.5 h-3.5 rounded-sm bg-base-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] font-black text-white leading-none">B</span>
                </div>
                <span className="text-[10px] font-semibold text-white/80 tracking-wide leading-none">BaseStream</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Carousel */}
      {carouselItems.length > 0 ? (
        <HeroCarousel items={carouselItems} onPlay={handlePlayContent} />
      ) : (
        <div className="skeleton-shimmer w-full" style={{ height: 'clamp(480px,88vh,860px)' }} />
      )}

      {/* ── Content Rows ─────────────────────────────────── */}
      <div
        className="mx-auto px-4 sm:px-6 md:px-10 xl:px-14 pb-24 space-y-14"
        style={{ maxWidth: '1800px' }}
      >
        <AnimatePresence mode="popLayout">
          {continueWatching.length > 0 && (
            <ContentRow key="continue" title="Continue Watching" items={continueWatching} />
          )}
          <ContentRow key="trending-movies" title="Trending Today"         items={trendingMovies}                    loading={trendingLoading} />
          <ContentRow key="trending-tv"     title="New on BaseStream"       items={trendingTV}                        loading={trendingLoading} />
          <ContentRow key="popular-movies"  title="Popular Hits"            items={popularMoviesData?.results || []}   loading={popularMoviesLoading} />
          <ContentRow key="popular-tv"      title="Binge-Worthy TV"         items={popularTVData?.results || []}      loading={popularTVLoading} />
          <ContentRow key="top-rated"       title="Critically Acclaimed"    items={topRatedMoviesData?.results || []} loading={topRatedLoading} />
        </AnimatePresence>
      </div>
    </div>
  );
}
