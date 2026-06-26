export type MovieStatus = 'watched' | 'wishlist';

export interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  poster: string;
  genre: string;
  status: MovieStatus;
  rating: number;
  review: string;
  createdAt: number;
  updatedAt: number;
}

export const GENRES = [
  '动作',
  '喜剧',
  '剧情',
  '科幻',
  '悬疑',
  '爱情',
  '动画',
  '恐怖',
  '纪录片',
  '其他',
] as const;

export type Genre = (typeof GENRES)[number];
