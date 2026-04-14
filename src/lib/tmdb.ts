import axios from 'axios';
import useSWR from 'swr';
import { TMDB_BASE_URL, TMDB_API_KEY, tmdbApiCalls } from './tmdb-config';

// Create axios instance with default configuration
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add API key
tmdbAxios.interceptors.request.use(
  (config: any) => {
    if (TMDB_API_KEY) {
      config.params = {
        ...config.params,
        api_key: TMDB_API_KEY,
        language: 'en-US',
      };
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await tmdbAxios.get(url);
  return response.data;
};

// SWR Hooks
export const useTrending = (mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getTrending(mediaType, timeWindow),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 60000 }
  );
  return { data, error, isLoading, mutate };
};

export const usePopularMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getPopularMovies(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const useTopRatedMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getTopRatedMovies(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 600000 }
  );
  return { data, error, isLoading, mutate };
};

export const useUpcomingMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getUpcomingMovies(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const useNowPlayingMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getNowPlayingMovies(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const usePopularTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getPopularTV(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const useTopRatedTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getTopRatedTV(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 600000 }
  );
  return { data, error, isLoading, mutate };
};

export const useAiringTodayTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getAiringTodayTV(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const useOnTheAirTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getOnTheAirTV(page),
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const useSearch = (query: string, page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    query ? tmdbApiCalls.searchMulti(query, page) : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const useMovieDetails = (id: string | number) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? tmdbApiCalls.getMovieDetails(id) : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const useTVDetails = (id: string | number) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? tmdbApiCalls.getTVDetails(id) : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 300000 }
  );
  return { data, error, isLoading, mutate };
};

export const tmdbApi = {
  get: async (url: string): Promise<any> => {
    const response = await tmdbAxios.get(url);
    return response.data;
  },
};

export default tmdbApi;
