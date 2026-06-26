<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Eye, Bookmark, Star, Film } from 'lucide-vue-next';
import type { Movie } from '@/types';
import StarRating from './StarRating.vue';

defineProps<{
  movie: Movie;
}>();

const router = useRouter();

function goDetail(id: string): void {
  router.push(`/movie/${id}`);
}
</script>

<template>
  <article
    class="group relative bg-zinc-800/50 rounded-2xl overflow-hidden border border-zinc-700/50 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
    tabindex="0"
    @click="goDetail(movie.id)"
    @keydown.enter="goDetail(movie.id)"
  >
    <div class="relative aspect-[2/3] overflow-hidden bg-zinc-900">
      <img
        v-if="movie.poster"
        :src="movie.poster"
        :alt="movie.title"
        class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div v-if="!movie.poster" class="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-600">
        <Film class="w-16 h-16 opacity-50" />
        <span class="text-sm px-4 text-center line-clamp-2">{{ movie.title }}</span>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

      <div class="absolute top-3 left-3">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
          :class="movie.status === 'watched'
            ? 'bg-amber-500/90 text-zinc-900'
            : 'bg-zinc-800/90 text-amber-300 border border-zinc-600'"
        >
          <Eye v-if="movie.status === 'watched'" class="w-3 h-3" :stroke-width="2.5" />
          <Bookmark v-else class="w-3 h-3" :stroke-width="2.5" />
          {{ movie.status === 'watched' ? '已看' : '想看' }}
        </span>
      </div>

      <div v-if="movie.rating > 0" class="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900/80 backdrop-blur-sm">
        <Star class="w-3 h-3 text-amber-400" fill="currentColor" :stroke-width="0" />
        <span class="text-xs font-bold text-amber-400 tabular-nums">{{ movie.rating.toFixed(1) }}</span>
      </div>

      <div class="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-zinc-900/70 backdrop-blur-sm text-xs text-zinc-300 font-medium tabular-nums">
        {{ movie.year }}
      </div>

      <div class="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 backdrop-blur-sm">
        {{ movie.genre }}
      </div>
    </div>

    <div class="p-4">
      <h3 class="font-semibold text-zinc-100 text-base leading-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
        {{ movie.title }}
      </h3>
      <p class="mt-1 text-sm text-zinc-500 line-clamp-1">
        {{ movie.director }}
      </p>
      <div v-if="movie.rating > 0" class="mt-3">
        <StarRating :model-value="movie.rating" readonly size="sm" />
      </div>
      <div v-else class="mt-3 h-4" />
    </div>
  </article>
</template>
