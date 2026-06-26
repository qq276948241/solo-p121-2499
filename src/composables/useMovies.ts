import { computed, ref } from 'vue';
import { useStorage } from './useStorage';
import type { Movie, MovieStatus } from '@/types';
import { GENRES } from '@/types';

export type SortKey = 'default' | 'rating-desc' | 'rating-asc' | 'year-desc' | 'year-asc' | 'newest';

function generateId(): string {
  return 'm_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function useMovies() {
  const { movies } = useStorage();

  const filterGenre = ref<string>('all');
  const filterStatus = ref<'all' | MovieStatus>('all');
  const sortKey = ref<SortKey>('newest');
  const yearFrom = ref<number | ''>('');
  const yearTo = ref<number | ''>('');

  const filteredMovies = computed(() => {
    let result = [...movies.value];

    if (filterGenre.value !== 'all') {
      result = result.filter((m) => m.genre === filterGenre.value);
    }

    if (filterStatus.value !== 'all') {
      result = result.filter((m) => m.status === filterStatus.value);
    }

    if (yearFrom.value !== '') {
      result = result.filter((m) => m.year >= Number(yearFrom.value));
    }

    if (yearTo.value !== '') {
      result = result.filter((m) => m.year <= Number(yearTo.value));
    }

    switch (sortKey.value) {
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-asc':
        result.sort((a, b) => {
          const ar = a.rating || -1;
          const br = b.rating || -1;
          return ar - br;
        });
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        result.sort((a, b) => a.year - b.year);
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  });

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
    filteredMovies,
    filterGenre,
    filterStatus,
    sortKey,
    yearFrom,
    yearTo,
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
