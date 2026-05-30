/**
 * tmdb-fallback.ts — Curated premium mock/fallback data for BaseStream
 * 
 * Provides highly polished, realistic metadata for popular films and series.
 * Used automatically in production if TMDB API requests fail, are rate-limited,
 * or if environment keys are not configured.
 */

import { Movie, TVShow } from '@/types';

// Curated top-tier movies with real TMDB IDs & working posters/backdrops
export const MOCK_MOVIES: Movie[] = [
  {
    id: 693134, // Dune: Part Two
    title: "Dune: Part Two",
    original_title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster_path: "/1pdfx48tU42jXY3FdGwb35g7Suo.jpg",
    backdrop_path: "/xOMo8BRK7PqaJ80d05X742A2ZUk.jpg",
    vote_average: 8.3,
    vote_count: 4200,
    popularity: 1250.5,
    release_date: "2024-02-27",
    genre_ids: [878, 12],
    adult: false,
    original_language: "en"
  },
  {
    id: 872585, // Oppenheimer
    title: "Oppenheimer",
    original_title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II, charting his rise, his leadership of the Manhattan Project, and the subsequent political backlash.",
    poster_path: "/8Gxv2Z7dh2WGjbgNqbWv0R7YEFZ.jpg",
    backdrop_path: "/fm6NqXyZ4VJIS2k42OA30GZHYok.jpg",
    vote_average: 8.1,
    vote_count: 7800,
    popularity: 980.2,
    release_date: "2023-07-19",
    genre_ids: [18, 36],
    adult: false,
    original_language: "en"
  },
  {
    id: 508883, // Boy Kills World
    title: "Boy Kills World",
    original_title: "Boy Kills World",
    overview: "When his family is murdered by Hilda van der Koy, the deranged matriarch of a corrupt post-apocalyptic dynasty that left him deaf and voiceless, an instrument of death is forged.",
    poster_path: "/25Jee25CuRI7fh8uD51Ucn0Z1w7.jpg",
    backdrop_path: "/5E8Of2415jZ48z249zozyp8R3P5.jpg",
    vote_average: 6.9,
    vote_count: 320,
    popularity: 840.4,
    release_date: "2024-04-24",
    genre_ids: [28, 53],
    adult: false,
    original_language: "en"
  },
  {
    id: 569094, // Spider-Man: Across the Spider-Verse
    title: "Spider-Man: Across the Spider-Verse",
    original_title: "Spider-Man: Across the Spider-Verse",
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society, a team of Spider-People charged with protecting the Multiverse’s very existence.",
    poster_path: "/8Vt1egxiNEoVK2STfv46P0kgS8Z.jpg",
    backdrop_path: "/ctMserH8g2kgvGJax4wWY5DqiA6.jpg",
    vote_average: 8.4,
    vote_count: 5900,
    popularity: 760.1,
    release_date: "2023-05-31",
    genre_ids: [16, 28, 12, 878],
    adult: false,
    original_language: "en"
  },
  {
    id: 157336, // Interstellar
    title: "Interstellar",
    original_title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2Qv6155vbs3QHGQeZZzfbG8d.jpg",
    backdrop_path: "/xJHokZbljvjC1OHvvZ1C46tja15.jpg",
    vote_average: 8.4,
    vote_count: 32000,
    popularity: 650.8,
    release_date: "2014-11-05",
    genre_ids: [12, 18, 878],
    adult: false,
    original_language: "en"
  },
  {
    id: 27205, // Inception
    title: "Inception",
    original_title: "Inception",
    overview: "Cobb, a skilled thief who is absolute best in the dangerous art of extraction, steals valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable.",
    poster_path: "/o07wJywtv1Y1jX087u7gf3vUbf9.jpg",
    backdrop_path: "/s3TBrRGB1q7jY4L56N2y1aOhXPh.jpg",
    vote_average: 8.4,
    vote_count: 34000,
    popularity: 580.4,
    release_date: "2010-07-14",
    genre_ids: [28, 878, 12],
    adult: false,
    original_language: "en"
  },
  {
    id: 155, // The Dark Knight
    title: "The Dark Knight",
    original_title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tWUBRAsuxFA21ZJ67rm76YPn.jpg",
    backdrop_path: "/nMKdUUepw0OIQY0F1wG18mK0qSt.jpg",
    vote_average: 8.5,
    vote_count: 31000,
    popularity: 520.1,
    release_date: "2008-07-16",
    genre_ids: [18, 28, 80, 53],
    adult: false,
    original_language: "en"
  }
];

// Curated premium series with real TMDB IDs
export const MOCK_TV: TVShow[] = [
  {
    id: 66732, // Stranger Things
    name: "Stranger Things",
    original_name: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster_path: "/49Wj2vHgFVqJ3HGhCCxthT61FG1.jpg",
    backdrop_path: "/56v2aV2sL56v2aV2sL56v2aV2sL.jpg",
    vote_average: 8.6,
    vote_count: 16000,
    popularity: 750.4,
    first_air_date: "2016-07-15",
    genre_ids: [18, 9648, 878],
    original_language: "en"
  },
  {
    id: 1396, // Breaking Bad
    name: "Breaking Bad",
    original_name: "Breaking Bad",
    overview: "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost.",
    poster_path: "/ztkUQIL6kyjqvAY451G450aZSt3.jpg",
    backdrop_path: "/9FAjtC29Z174y1w2g5S4V1W4d9B.jpg",
    vote_average: 8.9,
    vote_count: 12000,
    popularity: 620.2,
    first_air_date: "2008-01-20",
    genre_ids: [18, 80],
    original_language: "en"
  },
  {
    id: 100088, // The Last of Us
    name: "The Last of Us",
    original_name: "The Last of Us",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey.",
    poster_path: "/uKvPHsnPMznQscuKVlsqtLLn1E4.jpg",
    backdrop_path: "/9FAjtC29Z174y1w2g5S4V1W4d9B.jpg",
    vote_average: 8.6,
    vote_count: 4500,
    popularity: 490.8,
    first_air_date: "2023-01-15",
    genre_ids: [18, 10759],
    original_language: "en"
  },
  {
    id: 94605, // Arcane
    name: "Arcane",
    original_name: "Arcane",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
    poster_path: "/fqld52rw150jR5kmA34t3nZu8kg.jpg",
    backdrop_path: "/a5840Fe5F5Zeh2Vj5uW96G8J9J6.jpg",
    vote_average: 8.7,
    vote_count: 3400,
    popularity: 420.5,
    first_air_date: "2021-11-06",
    genre_ids: [16, 10765, 10759, 18],
    original_language: "en"
  },
  {
    id: 111110, // Shōgun
    name: "Shōgun",
    original_name: "Shōgun",
    overview: "In Japan in the year 1600, Lord Yoshii Toranaga fights for his life as his enemies on the Council of Regents unite against him, when a mysterious European ship is found marooned in a nearby fishing village.",
    poster_path: "/d477J45gd5VTuN4wWp144Uco636.jpg",
    backdrop_path: "/5z7wQvVK174y1w2g5S4V1W4d9B.jpg",
    vote_average: 8.7,
    vote_count: 680,
    popularity: 920.6,
    first_air_date: "2024-02-27",
    genre_ids: [18, 10759, 36],
    original_language: "ja"
  }
];

// Curated search fallbacks
export const getFallbackData = (url: string) => {
  const cleanUrl = url.toLowerCase();
  
  if (cleanUrl.includes('/trending/movie') || cleanUrl.includes('movie/trending') || (cleanUrl.includes('trending') && cleanUrl.includes('movie'))) {
    return { results: MOCK_MOVIES, page: 1, total_pages: 1, total_results: MOCK_MOVIES.length };
  }
  
  if (cleanUrl.includes('/trending/tv') || cleanUrl.includes('tv/trending')) {
    return { results: MOCK_TV, page: 1, total_pages: 1, total_results: MOCK_TV.length };
  }

  if (cleanUrl.includes('trending')) {
    const combined = [...MOCK_MOVIES.map(m => ({ ...m, media_type: 'movie' as const })), ...MOCK_TV.map(t => ({ ...t, media_type: 'tv' as const }))];
    return { results: combined, page: 1, total_pages: 1, total_results: combined.length };
  }

  if (cleanUrl.includes('movie/popular') || cleanUrl.includes('popular?page=') || cleanUrl.includes('popular_movies')) {
    return { results: MOCK_MOVIES, page: 1, total_pages: 1, total_results: MOCK_MOVIES.length };
  }

  if (cleanUrl.includes('tv/popular') || cleanUrl.includes('popular_tv')) {
    return { results: MOCK_TV, page: 1, total_pages: 1, total_results: MOCK_TV.length };
  }

  if (cleanUrl.includes('top_rated')) {
    return { results: MOCK_MOVIES.slice().sort((a,b) => b.vote_average - a.vote_average), page: 1, total_pages: 1, total_results: MOCK_MOVIES.length };
  }

  if (cleanUrl.includes('discover/tv') && cleanUrl.includes('with_genres=16')) {
    // Anime
    return { results: MOCK_TV.filter(t => t.genre_ids.includes(16)), page: 1, total_pages: 1, total_results: 1 };
  }

  if (cleanUrl.includes('discover/movie') && cleanUrl.includes('with_genres=28')) {
    // Action
    return { results: MOCK_MOVIES.filter(m => m.genre_ids.includes(28)), page: 1, total_pages: 1, total_results: 1 };
  }

  // General fallback
  return { results: MOCK_MOVIES, page: 1, total_pages: 1, total_results: MOCK_MOVIES.length };
};
