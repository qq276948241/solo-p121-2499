import { ref, watch } from 'vue';
import type { Movie } from '@/types';

const STORAGE_KEY = 'my-movie-list-v1';

function loadFromStorage(): Movie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultMovies();
    const parsed = JSON.parse(raw) as Movie[];
    return Array.isArray(parsed) ? parsed : getDefaultMovies();
  } catch {
    return getDefaultMovies();
  }
}

function saveToStorage(movies: Movie[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch {
    console.warn('Failed to save movies to localStorage');
  }
}

function getDefaultMovies(): Movie[] {
  const now = Date.now();
  return [
    {
      id: 'm1',
      title: '盗梦空间',
      director: '克里斯托弗·诺兰',
      year: 2010,
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
      genre: '科幻',
      status: 'watched',
      rating: 4.5,
      review: '层层嵌套的梦境结构令人叹为观止，诺兰的叙事功力炉火纯青。',
      createdAt: now - 86400000 * 30,
      updatedAt: now - 86400000 * 5,
    },
    {
      id: 'm2',
      title: '肖申克的救赎',
      director: '弗兰克·德拉邦特',
      year: 1994,
      poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80',
      genre: '剧情',
      status: 'watched',
      rating: 5,
      review: '希望是美好的，也许是人间至善，而美好的事物永不消逝。',
      createdAt: now - 86400000 * 60,
      updatedAt: now - 86400000 * 20,
    },
    {
      id: 'm3',
      title: '千与千寻',
      director: '宫崎骏',
      year: 2001,
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
      genre: '动画',
      status: 'watched',
      rating: 4.5,
      review: '宫崎骏的奇幻世界永远那么温暖，每一帧都是艺术品。',
      createdAt: now - 86400000 * 45,
      updatedAt: now - 86400000 * 15,
    },
    {
      id: 'm4',
      title: '星际穿越',
      director: '克里斯托弗·诺兰',
      year: 2014,
      poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80',
      genre: '科幻',
      status: 'wishlist',
      rating: 0,
      review: '',
      createdAt: now - 86400000 * 10,
      updatedAt: now - 86400000 * 10,
    },
    {
      id: 'm5',
      title: '寄生虫',
      director: '奉俊昊',
      year: 2019,
      poster: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&q=80',
      genre: '悬疑',
      status: 'watched',
      rating: 4,
      review: '关于阶层的黑色寓言，节奏紧凑，结局令人唏嘘。',
      createdAt: now - 86400000 * 25,
      updatedAt: now - 86400000 * 12,
    },
    {
      id: 'm6',
      title: '让子弹飞',
      director: '姜文',
      year: 2010,
      poster: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&q=80',
      genre: '动作',
      status: 'watched',
      rating: 4.5,
      review: '站着把钱挣了，姜文的黑色幽默无人能敌。',
      createdAt: now - 86400000 * 50,
      updatedAt: now - 86400000 * 22,
    },
    {
      id: 'm7',
      title: '沙丘2',
      director: '丹尼斯·维伦纽瓦',
      year: 2024,
      poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      genre: '科幻',
      status: 'wishlist',
      rating: 0,
      review: '',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: 'm8',
      title: '爱在黎明破晓前',
      director: '理查德·林克莱特',
      year: 1995,
      poster: 'https://images.unsplash.com/photo-1518676590629-3dcba9c5a555?w=600&q=80',
      genre: '爱情',
      status: 'wishlist',
      rating: 0,
      review: '',
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000 * 7,
    },
  ];
}

export function useStorage() {
  const movies = ref<Movie[]>(loadFromStorage());

  watch(
    movies,
    (val) => {
      saveToStorage(val);
    },
    { deep: true }
  );

  return { movies };
}
