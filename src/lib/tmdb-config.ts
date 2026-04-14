export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

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
};
