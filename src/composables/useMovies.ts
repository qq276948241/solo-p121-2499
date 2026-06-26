import { computed, reactive } from 'vue';
import { useStorage } from './useStorage';
import type { Movie, MovieStatus } from '@/types';
import { GENRES } from '@/types';

export type SortKey = 'default' | 'rating-desc' | 'rating-asc' | 'year-desc' | 'year-asc' | 'newest';

export interface MovieFilterState {
  genre: string;
  status: 'all' | MovieStatus;
  sort: SortKey;
  yearFrom: number | '';
  yearTo: number | '';
}

function createDefaultFilterState(): MovieFilterState {
  return {
    genre: 'all',
    status: 'all',
    sort: 'newest',
    yearFrom: '',
    yearTo: '',
  };
}

function generateId(): string {
  return 'm_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function filterByGenre(movies: Movie[], genre: string): Movie[] {
  if (genre === 'all') return movies;
  return movies.filter((m) => m.genre === genre);
}

function filterByStatus(movies: Movie[], status: 'all' | MovieStatus): Movie[] {
  if (status === 'all') return movies;
  return movies.filter((m) => m.status === status);
}

function filterByYear(movies: Movie[], yearFrom: number | '', yearTo: number | ''): Movie[] {
  let result = movies;
  if (yearFrom !== '') {
    const from = Number(yearFrom);
    result = result.filter((m) => m.year >= from);
  }
  if (yearTo !== '') {
    const to = Number(yearTo);
    result = result.filter((m) => m.year <= to);
  }
  return result;
}

function sortMovies(movies: Movie[], sortKey: SortKey): Movie[] {
  const result = [...movies];
  switch (sortKey) {
    case 'rating-desc':
      return result.sort((a, b) => b.rating - a.rating);
    case 'rating-asc':
      return result.sort((a, b) => {
        const ar = a.rating || -1;
        const br = b.rating || -1;
        return ar - br;
      });
    case 'year-desc':
      return result.sort((a, b) => b.year - a.year);
    case 'year-asc':
      return result.sort((a, b) => a.year - b.year);
    case 'newest':
    case 'default':
    default:
      return result.sort((a, b) => b.createdAt - a.createdAt);
  }
}

function pipeMovies(
  movies: Movie[],
  filter: MovieFilterState
): Movie[] {
  let result = filterByGenre(movies, filter.genre);
  result = filterByStatus(result, filter.status);
  result = filterByYear(result, filter.yearFrom, filter.yearTo);
  return sortMovies(result, filter.sort);
}

export function useMovies() {
  const { movies } = useStorage();
  const filterState = reactive<MovieFilterState>(createDefaultFilterState());

  const filteredMovies = computed(() => pipeMovies(movies.value, filterState));

  function findMovie(id: string): Movie | undefined {
    return movies.value.find((m) => m.id === id);
  }

  function addMovie(data: Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'review'> & { rating?: number; review?: string }): Movie {
    const now = Date.now();
    const newMovie: Movie = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      rating: data.rating ?? 0,
      review: data.review ?? '',
      title: data.title,
      director: data.director,
      year: data.year,
      poster: data.poster,
      genre: data.genre,
      status: data.status,
    };
    movies.value.unshift(newMovie);
    return newMovie;
  }

  function updateMovie(id: string, patch: Partial<Omit<Movie, 'id' | 'createdAt'>>): void {
    const idx = movies.value.findIndex((m) => m.id === id);
    if (idx === -1) return;
    movies.value[idx] = {
      ...movies.value[idx],
      ...patch,
      updatedAt: Date.now(),
    };
  }

  function deleteMovie(id: string): void {
    const idx = movies.value.findIndex((m) => m.id === id);
    if (idx !== -1) {
      movies.value.splice(idx, 1);
    }
  }

  function setRating(id: string, rating: number): void {
    updateMovie(id, { rating });
  }

  function setReview(id: string, review: string): void {
    updateMovie(id, { review });
  }

  function toggleStatus(id: string): void {
    const movie = findMovie(id);
    if (!movie) return;
    updateMovie(id, { status: movie.status === 'watched' ? 'wishlist' : 'watched' });
  }

  const stats = computed(() => {
    const total = movies.value.length;
    const watched = movies.value.filter((m) => m.status === 'watched');
    const wishlist = movies.value.filter((m) => m.status === 'wishlist');
    const rated = watched.filter((m) => m.rating > 0);
    const avgRating = rated.length > 0 ? rated.reduce((sum, m) => sum + m.rating, 0) / rated.length : 0;

    const genreCount = GENRES.reduce<Record<string, number>>((acc, g) => {
      acc[g] = 0;
      return acc;
    }, {});
    for (const m of movies.value) {
      if (genreCount[m.genre] !== undefined) {
        genreCount[m.genre]++;
      }
    }
    const genreStats = GENRES.map((g) => ({ genre: g, count: genreCount[g] })).filter((s) => s.count > 0);

    return {
      total,
      watchedCount: watched.length,
      wishlistCount: wishlist.length,
      avgRating,
      ratedCount: rated.length,
      genreStats,
    };
  });

  return {
    movies,
    filterState,
    filteredMovies,
    findMovie,
    addMovie,
    updateMovie,
    deleteMovie,
    setRating,
    setReview,
    toggleStatus,
    stats,
  };
}
