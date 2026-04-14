import { TMDB_BASE_URL, TMDB_API_KEY, tmdbApiCalls } from './tmdb-config';

if (!TMDB_API_KEY) {
  console.warn('TMDB_API_KEY is not set for server-side fetching');
}

export const tmdbServer = {
  fetch: async (endpoint: string, revalidate = 3600) => {
    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=en-US`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) {
        // Log the error but don't crash the whole page if one category fails
        console.error(`TMDB Server Error: ${res.statusText} for ${endpoint}`);
        return { results: [] };
    }
    return res.json();
  },

  getTrending: (mediaType: 'all' | 'movie' | 'tv' = 'all') => 
    tmdbServer.fetch(tmdbApiCalls.getTrending(mediaType, 'week')),
    
  getPopularMovies: () => tmdbServer.fetch(tmdbApiCalls.getPopularMovies()),
  getPopularTV: () => tmdbServer.fetch(tmdbApiCalls.getPopularTV()),
  getTopRatedMovies: () => tmdbServer.fetch(tmdbApiCalls.getTopRatedMovies()),
};
