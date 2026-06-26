<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  Eye,
  Bookmark,
  Trash2,
  Star,
  Film,
  PenLine,
  Calendar,
  User,
  Tag,
  Save,
  AlertTriangle,
} from 'lucide-vue-next';
import { useMovies } from '@/composables/useMovies';
import StarRating from '@/components/StarRating.vue';
import type { MovieStatus } from '@/types';

const route = useRoute();
const router = useRouter();
const { findMovie, setRating, setReview, toggleStatus, deleteMovie, updateMovie } = useMovies();

const movieId = computed(() => String(route.params.id || ''));
const movie = computed(() => findMovie(movieId.value));

const localRating = ref(0);
const localReview = ref('');
const reviewEditing = ref(false);
const confirmDelete = ref(false);
const showSaveToast = ref(false);

onMounted(() => {
  if (movie.value) {
    localRating.value = movie.value.rating;
    localReview.value = movie.value.review;
  }
});

function saveRating(): void {
  if (!movie.value) return;
  setRating(movieId.value, localRating.value);
  if (localRating.value > 0 && movie.value.status === 'wishlist') {
    updateMovie(movieId.value, { status: 'watched' });
  }
  flashToast();
}

function saveReview(): void {
  if (!movie.value) return;
  setReview(movieId.value, localReview.value.trim());
  reviewEditing.value = false;
  flashToast();
}

function flashToast(): void {
  showSaveToast.value = true;
  setTimeout(() => {
    showSaveToast.value = false;
  }, 1500);
}

function handleToggleStatus(): void {
  toggleStatus(movieId.value);
  flashToast();
}

function handleDelete(): void {
  deleteMovie(movieId.value);
  router.push('/');
}

const statusLabel: Record<MovieStatus, string> = {
  watched: '已看',
  wishlist: '想看',
};
</script>

<template>
  <div class="min-h-screen pt-20 pb-16">
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="showSaveToast"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500/90 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 backdrop-blur-sm flex items-center gap-2"
      >
        <Save class="w-4 h-4" />
        已保存
      </div>
    </transition>

    <div v-if="!movie" class="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div class="w-20 h-20 rounded-3xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-6">
        <Film class="w-10 h-10 text-zinc-600" />
      </div>
      <h3 class="text-xl font-semibold text-zinc-300 mb-2">电影不存在</h3>
      <p class="text-zinc-500 text-sm mb-6">找不到对应的电影记录，可能已被删除</p>
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-900 font-semibold hover:bg-amber-400 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        返回影单
      </button>
    </div>

    <div v-else class="max-w-5xl mx-auto px-4 sm:px-6">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400 transition-colors mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        返回
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <div class="relative aspect-[2/3] rounded-3xl overflow-hidden bg-zinc-800 shadow-2xl shadow-black/40 border border-zinc-700/50">
              <img
                v-if="movie.poster"
                :src="movie.poster"
                :alt="movie.title"
                class="w-full h-full object-cover"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div v-if="!movie.poster" class="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-600 p-6">
                <Film class="w-20 h-20 opacity-40" />
                <p class="text-base font-medium text-center text-zinc-400">{{ movie.title }}</p>
              </div>

              <div class="absolute top-4 left-4">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md"
                  :class="movie.status === 'watched'
                    ? 'bg-amber-500/95 text-zinc-900 shadow-lg shadow-amber-500/30'
                    : 'bg-zinc-900/80 text-amber-300 border border-zinc-700'"
                >
                  <Eye v-if="movie.status === 'watched'" class="w-4 h-4" :stroke-width="2.5" />
                  <Bookmark v-else class="w-4 h-4" :stroke-width="2.5" />
                  {{ statusLabel[movie.status] }}
                </span>
              </div>

              <div v-if="movie.rating > 0" class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50">
                <Star class="w-4 h-4 text-amber-400" fill="currentColor" :stroke-width="0" />
                <span class="text-sm font-bold text-amber-400 tabular-nums">{{ movie.rating.toFixed(1) }}</span>
              </div>
            </div>

            <div class="mt-6 space-y-3">
              <button
                @click="handleToggleStatus"
                class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all"
                :class="movie.status === 'wishlist'
                  ? 'bg-amber-500 text-zinc-900 border-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25'
                  : 'bg-zinc-800/60 text-zinc-200 border-zinc-700 hover:bg-zinc-700/60'"
              >
                <Eye v-if="movie.status === 'wishlist'" class="w-5 h-5" />
                <Bookmark v-else class="w-5 h-5" />
                {{ movie.status === 'wishlist' ? '标记为已看' : '移回想看单' }}
              </button>

              <div class="relative">
                <button
                  v-if="!confirmDelete"
                  @click="confirmDelete = true"
                  class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-all"
                >
                  <Trash2 class="w-5 h-5" />
                  删除电影
                </button>
                <div v-else class="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div class="flex items-start gap-3 mb-3">
                    <AlertTriangle class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p class="text-sm text-red-300">确定要删除这部电影吗？此操作无法撤销。</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="handleDelete"
                      class="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-400 transition-colors"
                    >
                      确认删除
                    </button>
                    <button
                      @click="confirmDelete = false"
                      class="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-700 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div>
            <div class="flex items-start gap-3 mb-3">
              <span class="inline-flex px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-semibold border border-amber-500/30">
                {{ movie.genre }}
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight leading-tight">
              {{ movie.title }}
            </h1>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div class="bg-zinc-800/40 rounded-2xl border border-zinc-700/50 p-4">
              <div class="flex items-center gap-2 text-zinc-500 text-xs font-medium mb-1.5">
                <User class="w-3.5 h-3.5" />
                导演
              </div>
              <p class="text-zinc-100 font-medium truncate">{{ movie.director }}</p>
            </div>
            <div class="bg-zinc-800/40 rounded-2xl border border-zinc-700/50 p-4">
              <div class="flex items-center gap-2 text-zinc-500 text-xs font-medium mb-1.5">
                <Calendar class="w-3.5 h-3.5" />
                上映年份
              </div>
              <p class="text-zinc-100 font-medium tabular-nums">{{ movie.year }}</p>
            </div>
            <div class="bg-zinc-800/40 rounded-2xl border border-zinc-700/50 p-4">
              <div class="flex items-center gap-2 text-zinc-500 text-xs font-medium mb-1.5">
                <Tag class="w-3.5 h-3.5" />
                状态
              </div>
              <p
                class="font-medium"
                :class="movie.status === 'watched' ? 'text-amber-400' : 'text-zinc-400'"
              >
                {{ statusLabel[movie.status] }}
              </p>
            </div>
          </div>

          <div class="bg-gradient-to-br from-zinc-800/50 to-zinc-800/20 rounded-3xl border border-zinc-700/50 p-6 sm:p-8">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Star class="w-5 h-5 text-amber-400" fill="currentColor" :stroke-width="0" />
                我的评分
              </h2>
              <button
                @click="saveRating"
                class="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
              >
                保存评分
              </button>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <StarRating v-model="localRating" size="lg" />
              <div class="text-sm text-zinc-500">
                点击左半颗星可以打半星，再次点击相同分数清除评分
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-zinc-800/50 to-zinc-800/20 rounded-3xl border border-zinc-700/50 p-6 sm:p-8">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <PenLine class="w-5 h-5 text-amber-400" />
                我的短评
              </h2>
              <div v-if="reviewEditing" class="flex gap-2">
                <button
                  @click="localReview = movie.review; reviewEditing = false"
                  class="text-xs font-medium px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                >
                  取消
                </button>
                <button
                  @click="saveReview"
                  class="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-900 hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Save class="w-3.5 h-3.5" />
                  保存
                </button>
              </div>
              <button
                v-else
                @click="reviewEditing = true"
                class="text-xs font-medium px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors flex items-center gap-1.5"
              >
                <PenLine class="w-3.5 h-3.5" />
                编辑
              </button>
            </div>

            <div v-if="reviewEditing">
              <textarea
                v-model="localReview"
                rows="6"
                placeholder="写下你对这部电影的感受..."
                class="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none text-sm leading-relaxed"
              />
            </div>
            <div v-else>
              <p v-if="movie.review" class="text-zinc-200 leading-relaxed text-[15px] whitespace-pre-wrap">
                {{ movie.review }}
              </p>
              <div v-else class="text-zinc-600 text-sm italic py-4 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                还没有写短评，点击编辑按钮记录你的观影感受吧
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
