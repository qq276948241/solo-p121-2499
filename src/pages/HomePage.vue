<script setup lang="ts">
import { computed } from 'vue';
import { SlidersHorizontal, SortAsc, Film, Search } from 'lucide-vue-next';
import MovieCard from '@/components/MovieCard.vue';
import { useMovies, type SortKey } from '@/composables/useMovies';
import { GENRES } from '@/types';

const { filteredMovies, filterGenre, filterStatus, sortKey, stats } = useMovies();

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'newest', label: '最新添加' },
  { key: 'rating-desc', label: '评分从高到低' },
  { key: 'rating-asc', label: '评分从低到高' },
  { key: 'year-desc', label: '年份从新到旧' },
  { key: 'year-asc', label: '年份从旧到新' },
];

const searchQuery = computed({
  get: () => '',
  set: () => {},
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight">
              我的影单
            </h1>
            <p class="mt-2 text-zinc-500 text-sm sm:text-base">
              共收录 <span class="text-amber-400 font-semibold">{{ stats.total }}</span> 部 · 
              已看 <span class="text-amber-400 font-semibold">{{ stats.watchedCount }}</span> 部 · 
              想看 <span class="text-amber-400 font-semibold">{{ stats.wishlistCount }}</span> 部
            </p>
          </div>
        </div>
      </div>

      <div class="bg-zinc-800/40 backdrop-blur-sm rounded-2xl border border-zinc-700/50 p-4 sm:p-6 mb-8">
        <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
          <div class="flex items-center gap-2 text-zinc-400 w-full lg:w-auto">
            <SlidersHorizontal class="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span class="text-sm font-medium text-zinc-300 whitespace-nowrap">筛选</span>
          </div>

          <div class="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1.5">类型</label>
              <select
                v-model="filterGenre"
                class="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">全部类型</option>
                <option v-for="g in GENRES" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1.5">状态</label>
              <div class="flex gap-2">
                <button
                  v-for="opt in [
                    { key: 'all', label: '全部' },
                    { key: 'watched', label: '已看' },
                    { key: 'wishlist', label: '想看' },
                  ]"
                  :key="opt.key"
                  @click="filterStatus = opt.key as any"
                  class="flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  :class="filterStatus === opt.key
                    ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/25'
                    : 'bg-zinc-900/60 text-zinc-400 border border-zinc-700 hover:text-zinc-200 hover:border-zinc-600'"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1.5">排序</label>
              <div class="relative">
                <select
                  v-model="sortKey"
                  class="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none cursor-pointer pr-10"
                >
                  <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
                    {{ opt.label }}
                  </option>
                </select>
                <SortAsc class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredMovies.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-20 h-20 rounded-3xl bg-zinc-800/60 flex items-center justify-center mb-6">
          <Film class="w-10 h-10 text-zinc-600" />
        </div>
        <h3 class="text-xl font-semibold text-zinc-300 mb-2">暂无电影</h3>
        <p class="text-zinc-500 text-sm max-w-md">
          当前筛选条件下还没有电影，试试调整筛选条件，或者添加新电影吧。
        </p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        <MovieCard v-for="movie in filteredMovies" :key="movie.id" :movie="movie" />
      </div>
    </div>
  </div>
</template>
