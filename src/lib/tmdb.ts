import axios from 'axios';
import useSWR from 'swr';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.warn('NEXT_PUBLIC_TMDB_API_KEY environment variable is not set');
}

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

// Response interceptor for error handling
tmdbAxios.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('TMDB API: Invalid API key');
          break;
        case 404:
          console.error('TMDB API: Resource not found');
          break;
        case 429:
          console.error('TMDB API: Rate limit exceeded');
          break;
        default:
          console.error('TMDB API Error:', data.status_message || error.message);
      }
    } else if (error.request) {
      console.error('TMDB API: Network error', error.message);
    } else {
      console.error('TMDB API: Request setup error', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await tmdbAxios.get(url);
  return response.data;
};

// TMDB API Functions
export const tmdbApiCalls = {
  // Trending
  getTrending: (mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all', timeWindow: 'day' | 'week' = 'week') =>
    `/trending/${mediaType}/${timeWindow}`,
  
  // Movies
  getMovieDetails: (id: string | number, appendToResponse = 'videos,credits,similar') =>
    `/movie/${id}?append_to_response=${appendToResponse}`,
  
  getPopularMovies: (page = 1) => `/movie/popular?page=${page}`,
  
  getTopRatedMovies: (page = 1) => `/movie/top_rated?page=${page}`,
  
  getUpcomingMovies: (page = 1) => `/movie/upcoming?page=${page}`,
  
  getNowPlayingMovies: (page = 1) => `/movie/now_playing?page=${page}`,
  
  // TV Shows
  getTVDetails: (id: string | number, appendToResponse = 'videos,credits,similar') =>
    `/tv/${id}?append_to_response=${appendToResponse}`,
  
  getPopularTV: (page = 1) => `/tv/popular?page=${page}`,
  
  getTopRatedTV: (page = 1) => `/tv/top_rated?page=${page}`,
  
  getOnTheAirTV: (page = 1) => `/tv/on_the_air?page=${page}`,
  
  getAiringTodayTV: (page = 1) => `/tv/airing_today?page=${page}`,
  
  // Search
  searchMulti: (query: string, page = 1) => 
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}`,
  
  searchMovies: (query: string, page = 1) => 
    `/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
  
  searchTV: (query: string, page = 1) => 
    `/search/tv?query=${encodeURIComponent(query)}&page=${page}`,
  
  // Genres
  getMovieGenres: () => '/genre/movie/list',
  
  getTVGenres: () => '/genre/tv/list',
  
  // Discover
  discoverMovies: (page = 1, genre?: string, year?: number) => {
    const params = new URLSearchParams({ page: page.toString() });
    if (genre) params.append('with_genres', genre);
    if (year) params.append('primary_release_year', year.toString());
    return `/discover/movie?${params.toString()}`;
  },
  
  discoverTV: (page = 1, genre?: string, year?: number) => {
    const params = new URLSearchParams({ page: page.toString() });
    if (genre) params.append('with_genres', genre);
    if (year) params.append('first_air_date_year', year.toString());
    return `/discover/tv?${params.toString()}`;
  },
};

// SWR Hooks
export const useTrending = (mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getTrending(mediaType, timeWindow),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const useMovieDetails = (id: string | number) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? tmdbApiCalls.getMovieDetails(id) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const useTVDetails = (id: string | number) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? tmdbApiCalls.getTVDetails(id) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const usePopularMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getPopularMovies(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const usePopularTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getPopularTV(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const useTopRatedMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getTopRatedMovies(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 600000, // 10 minutes
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const useTopRatedTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getTopRatedTV(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 600000, // 10 minutes
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const useUpcomingMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getUpcomingMovies(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000,
    }
  );
  return { data, error, isLoading, mutate };
};

export const useNowPlayingMovies = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getNowPlayingMovies(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000,
    }
  );
  return { data, error, isLoading, mutate };
};

export const useOnTheAirTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getOnTheAirTV(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000,
    }
  );
  return { data, error, isLoading, mutate };
};

export const useAiringTodayTV = (page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getAiringTodayTV(page),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000,
    }
  );
  return { data, error, isLoading, mutate };
};

export const useSearch = (query: string, page = 1) => {
  const { data, error, isLoading, mutate } = useSWR(
    query ? tmdbApiCalls.searchMulti(query, page) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const useMovieGenres = () => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getMovieGenres(),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 86400000, // 24 hours
    }
  );
  
  return { data, error, isLoading, mutate };
};

export const useTVGenres = () => {
  const { data, error, isLoading, mutate } = useSWR(
    tmdbApiCalls.getTVGenres(),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 86400000, // 24 hours
    }
  );
  
  return { data, error, isLoading, mutate };
};

// Manual API calls for non-SWR usage
export const tmdbApi = {
  get: async (url: string): Promise<any> => {
    const response = await tmdbAxios.get(url);
    return response.data;
  },
  
  post: async (url: string, data?: any): Promise<any> => {
    const response = await tmdbAxios.post(url, data);
    return response.data;
  },
};

export default tmdbApi;
