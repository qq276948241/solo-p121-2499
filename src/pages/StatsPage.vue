<script setup lang="ts">
import { computed } from 'vue';
import {
  Eye,
  Bookmark,
  Star,
  Film,
  TrendingUp,
  PieChart as PieIcon,
} from 'lucide-vue-next';
import { useMovies } from '@/composables/useMovies';

const { stats, movies } = useMovies();

const AMBER_SHADES = [
  '#fbbf24',
  '#f59e0b',
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
  '#fcd34d',
  '#fde68a',
  '#fef3c7',
  '#ea580c',
];

interface DonutSlice {
  genre: string;
  count: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

const donutData = computed<DonutSlice[]>(() => {
  const total = stats.value.total;
  if (total === 0) return [];

  const result: DonutSlice[] = [];
  let currentAngle = -Math.PI / 2;

  stats.value.genreStats.forEach((s, i) => {
    const percentage = s.count / total;
    const angleSpan = percentage * Math.PI * 2;
    result.push({
      genre: s.genre,
      count: s.count,
      percentage,
      color: AMBER_SHADES[i % AMBER_SHADES.length],
      startAngle: currentAngle,
      endAngle: currentAngle + angleSpan,
    });
    currentAngle += angleSpan;
  });

  return result;
});

function describeArc(startAngle: number, endAngle: number, cx: number, cy: number, r: number, rInner: number): string {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  const x1Inner = cx + rInner * Math.cos(endAngle);
  const y1Inner = cy + rInner * Math.sin(endAngle);
  const x2Inner = cx + rInner * Math.cos(startAngle);
  const y2Inner = cy + rInner * Math.sin(startAngle);

  return [
    'M', x1, y1,
    'A', r, r, 0, largeArc, 1, x2, y2,
    'L', x1Inner, y1Inner,
    'A', rInner, rInner, 0, largeArc, 0, x2Inner, y2Inner,
    'Z',
  ].join(' ');
}

const topRated = computed(() =>
  [...movies.value]
    .filter((m) => m.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
);

const SVG_SIZE = 280;
const CENTER = SVG_SIZE / 2;
const OUTER_R = 115;
const INNER_R = 72;
</script>

<template>
  <div class="min-h-screen pt-20 pb-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight">观影统计</h1>
        <p class="mt-2 text-zinc-500">一览你的观影数据全貌</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="group bg-gradient-to-br from-zinc-800/60 to-zinc-800/20 rounded-2xl border border-zinc-700/50 p-5 hover:border-amber-500/30 transition-all">
          <div class="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3 group-hover:bg-amber-500/25 transition-colors">
            <Film class="w-5 h-5 text-amber-400" />
          </div>
          <div class="text-3xl font-bold text-zinc-100 tabular-nums mb-1">{{ stats.total }}</div>
          <div class="text-sm text-zinc-500">全部电影</div>
        </div>

        <div class="group bg-gradient-to-br from-zinc-800/60 to-zinc-800/20 rounded-2xl border border-zinc-700/50 p-5 hover:border-amber-500/30 transition-all">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3 group-hover:bg-emerald-500/25 transition-colors">
            <Eye class="w-5 h-5 text-emerald-400" />
          </div>
          <div class="text-3xl font-bold text-zinc-100 tabular-nums mb-1">{{ stats.watchedCount }}</div>
          <div class="text-sm text-zinc-500">已观看</div>
        </div>

        <div class="group bg-gradient-to-br from-zinc-800/60 to-zinc-800/20 rounded-2xl border border-zinc-700/50 p-5 hover:border-amber-500/30 transition-all">
          <div class="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center mb-3 group-hover:bg-sky-500/25 transition-colors">
            <Bookmark class="w-5 h-5 text-sky-400" />
          </div>
          <div class="text-3xl font-bold text-zinc-100 tabular-nums mb-1">{{ stats.wishlistCount }}</div>
          <div class="text-sm text-zinc-500">待观看</div>
        </div>

        <div class="group bg-gradient-to-br from-zinc-800/60 to-zinc-800/20 rounded-2xl border border-zinc-700/50 p-5 hover:border-amber-500/30 transition-all">
          <div class="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3 group-hover:bg-amber-500/25 transition-colors">
            <Star class="w-5 h-5 text-amber-400" fill="currentColor" />
          </div>
          <div class="text-3xl font-bold text-zinc-100 tabular-nums mb-1">
            {{ stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—' }}
          </div>
          <div class="text-sm text-zinc-500">平均评分</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-gradient-to-br from-zinc-800/40 to-zinc-800/10 rounded-3xl border border-zinc-700/50 p-6 sm:p-8">
          <h2 class="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-6">
            <PieIcon class="w-5 h-5 text-amber-400" />
            类型占比
          </h2>

          <div v-if="donutData.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center mb-4">
              <Film class="w-8 h-8 text-zinc-600" />
            </div>
            <p class="text-zinc-400 text-sm">暂无数据</p>
          </div>

          <div v-else class="flex flex-col sm:flex-row items-center gap-8">
            <div class="relative flex-shrink-0">
              <svg :width="SVG_SIZE" :height="SVG_SIZE" class="overflow-visible">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle
                  :cx="CENTER"
                  :cy="CENTER"
                  :r="OUTER_R + 6"
                  fill="none"
                  stroke="rgba(39, 39, 42, 0.5)"
                  stroke-width="1"
                />

                <path
                  v-for="(slice, i) in donutData"
                  :key="slice.genre"
                  :d="describeArc(slice.startAngle, slice.endAngle, CENTER, CENTER, OUTER_R, INNER_R)"
                  :fill="slice.color"
                  :stroke="'rgba(24, 24, 27, 0.8)'"
                  stroke-width="2"
                  class="transition-all duration-300 hover:opacity-90"
                  :style="{ filter: `drop-shadow(0 0 6px ${slice.color}40)` }"
                  :transform="`rotate(${i * 0.2}, ${CENTER}, ${CENTER})`"
                />

                <circle
                  :cx="CENTER"
                  :cy="CENTER"
                  :r="INNER_R - 2"
                  fill="rgba(24, 24, 27, 0.95)"
                />

                <text
                  :x="CENTER"
                  :y="CENTER - 8"
                  text-anchor="middle"
                  class="fill-zinc-100 font-bold"
                  style="font-size: 34px"
                >
                  {{ stats.total }}
                </text>
                <text
                  :x="CENTER"
                  :y="CENTER + 18"
                  text-anchor="middle"
                  class="fill-zinc-500"
                  style="font-size: 13px"
                >
                  部电影
                </text>
              </svg>
            </div>

            <div class="flex-1 w-full space-y-3">
              <div
                v-for="slice in donutData"
                :key="slice.genre"
                class="flex items-center gap-3 group"
              >
                <div
                  class="w-3.5 h-3.5 rounded-md flex-shrink-0 shadow-sm"
                  :style="{ backgroundColor: slice.color, boxShadow: `0 0 8px ${slice.color}40` }"
                />
                <span class="text-sm text-zinc-300 flex-1">{{ slice.genre }}</span>
                <span class="text-sm font-semibold text-zinc-200 tabular-nums">{{ slice.count }}</span>
                <span class="text-xs text-zinc-500 tabular-nums w-12 text-right">
                  {{ (slice.percentage * 100).toFixed(0) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-zinc-800/40 to-zinc-800/10 rounded-3xl border border-zinc-700/50 p-6 sm:p-8">
          <h2 class="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-6">
            <TrendingUp class="w-5 h-5 text-amber-400" />
            高分榜 Top 5
          </h2>

          <div v-if="topRated.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center mb-4">
              <Star class="w-8 h-8 text-zinc-600" />
            </div>
            <p class="text-zinc-400 text-sm">还没有评分的电影</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(m, idx) in topRated"
              :key="m.id"
              class="flex items-center gap-4 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-amber-500/20 transition-all group"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                :class="idx === 0
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-900 shadow-lg shadow-amber-500/30'
                  : idx <= 2
                  ? 'bg-gradient-to-br from-zinc-600 to-zinc-700 text-zinc-200'
                  : 'bg-zinc-800 text-zinc-400'"
              >
                {{ idx + 1 }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                  {{ m.title }}
                </div>
                <div class="text-xs text-zinc-500 mt-0.5">
                  {{ m.director }} · {{ m.year }}
                </div>
              </div>

              <div class="flex items-center gap-1.5 flex-shrink-0">
                <Star class="w-4 h-4 text-amber-400" fill="currentColor" :stroke-width="0" />
                <span class="font-bold text-amber-400 tabular-nums">{{ m.rating.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-zinc-800/40 to-zinc-800/10 rounded-3xl border border-zinc-700/50 p-6 sm:p-8">
        <h2 class="text-lg font-semibold text-zinc-100 mb-6">完成度概览</h2>

        <div class="space-y-6">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-zinc-400">观看进度</span>
              <span class="text-sm font-semibold text-zinc-200 tabular-nums">
                {{ stats.total > 0 ? Math.round((stats.watchedCount / stats.total) * 100) : 0 }}%
              </span>
            </div>
            <div class="h-3 rounded-full bg-zinc-900/60 overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                :style="{ width: `${stats.total > 0 ? (stats.watchedCount / stats.total) * 100 : 0}%` }"
              />
            </div>
            <div class="mt-2 text-xs text-zinc-500 flex justify-between">
              <span>已看 {{ stats.watchedCount }} 部</span>
              <span>想看 {{ stats.wishlistCount }} 部</span>
              <span>共 {{ stats.total }} 部</span>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-zinc-400">评分覆盖</span>
              <span class="text-sm font-semibold text-zinc-200 tabular-nums">
                {{ stats.watchedCount > 0 ? Math.round((stats.ratedCount / stats.watchedCount) * 100) : 0 }}%
              </span>
            </div>
            <div class="h-3 rounded-full bg-zinc-900/60 overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 ease-out"
                :style="{ width: `${stats.watchedCount > 0 ? (stats.ratedCount / stats.watchedCount) * 100 : 0}%` }"
              />
            </div>
            <div class="mt-2 text-xs text-zinc-500 flex justify-between">
              <span>已评分 {{ stats.ratedCount }} 部</span>
              <span>已观看 {{ stats.watchedCount }} 部</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
