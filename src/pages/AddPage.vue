<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, ImageOff, Upload, ArrowLeft } from 'lucide-vue-next';
import { useMovies } from '@/composables/useMovies';
import { GENRES } from '@/types';
import type { MovieStatus } from '@/types';

const router = useRouter();
const { addMovie } = useMovies();

const title = ref('');
const director = ref('');
const year = ref<number | ''>(new Date().getFullYear());
const poster = ref('');
const genre = ref(GENRES[2]);
const status = ref<MovieStatus>('wishlist');
const submitting = ref(false);
const showSuccess = ref(false);

const formValid = computed(() =>
  title.value.trim().length > 0 &&
  director.value.trim().length > 0 &&
  year.value !== '' &&
  year.value > 1800 &&
  year.value <= 2100
);

function handleSubmit(): void {
  if (!formValid.value || submitting.value) return;
  submitting.value = true;

  const movie = addMovie({
    title: title.value.trim(),
    director: director.value.trim(),
    year: Number(year.value),
    poster: poster.value.trim(),
    genre: genre.value,
    status: status.value,
  });

  showSuccess.value = true;
  setTimeout(() => {
    router.push(`/movie/${movie.id}`);
  }, 1000);
}

function resetForm(): void {
  title.value = '';
  director.value = '';
  year.value = new Date().getFullYear();
  poster.value = '';
  genre.value = GENRES[2];
  status.value = 'wishlist';
}
</script>

<template>
  <div class="min-h-screen pt-20 pb-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="mb-8">
        <button
          @click="router.back()"
          class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400 transition-colors mb-4"
        >
          <ArrowLeft class="w-4 h-4" />
          返回
        </button>
        <h1 class="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight">添加电影</h1>
        <p class="mt-2 text-zinc-500">填写电影信息，收藏到你的私人影单</p>
      </div>

      <div v-if="showSuccess" class="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-emerald-300">添加成功！</p>
          <p class="text-sm text-emerald-400/70">正在跳转到详情页...</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div class="lg:col-span-3 space-y-6">
          <div class="bg-zinc-800/40 backdrop-blur-sm rounded-2xl border border-zinc-700/50 p-6 space-y-5">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">
                片名 <span class="text-amber-400">*</span>
              </label>
              <input
                v-model="title"
                type="text"
                placeholder="例如：盗梦空间"
                class="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  导演 <span class="text-amber-400">*</span>
                </label>
                <input
                  v-model="director"
                  type="text"
                  placeholder="例如：诺兰"
                  class="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  上映年份 <span class="text-amber-400">*</span>
                </label>
                <input
                  v-model.number="year"
                  type="number"
                  min="1888"
                  max="2100"
                  placeholder="2024"
                  class="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">类型</label>
                <select
                  v-model="genre"
                  class="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all cursor-pointer appearance-none"
                >
                  <option v-for="g in GENRES" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">观影状态</label>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="status = 'watched'"
                    class="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    :class="status === 'watched'
                      ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/25'
                      : 'bg-zinc-900/60 text-zinc-400 border border-zinc-700 hover:text-zinc-200'"
                  >
                    已看
                  </button>
                  <button
                    type="button"
                    @click="status = 'wishlist'"
                    class="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    :class="status === 'wishlist'
                      ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/25'
                      : 'bg-zinc-900/60 text-zinc-400 border border-zinc-700 hover:text-zinc-200'"
                  >
                    想看
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">海报 URL</label>
              <input
                v-model="poster"
                type="url"
                placeholder="https://example.com/poster.jpg（可选）"
                class="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="handleSubmit"
              :disabled="!formValid || submitting"
              class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-amber-500/25"
            >
              <Plus class="w-5 h-5" :stroke-width="2.5" />
              添加到影单
            </button>
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-3.5 rounded-xl border border-zinc-700 text-zinc-400 font-medium hover:text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/40 transition-all"
            >
              重置表单
            </button>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="sticky top-24">
            <div class="bg-zinc-800/40 backdrop-blur-sm rounded-2xl border border-zinc-700/50 p-6">
              <h3 class="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                <Upload class="w-4 h-4 text-amber-400" />
                海报预览
              </h3>
              <div class="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900/80 border border-zinc-700/50">
                <img
                  v-if="poster"
                  :src="poster"
                  :alt="title || '海报预览'"
                  class="w-full h-full object-cover"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
                <div v-if="!poster" class="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-600 p-6">
                  <ImageOff class="w-14 h-14 opacity-50" />
                  <div class="text-center">
                    <p class="text-sm font-medium text-zinc-500">{{ title || '电影海报' }}</p>
                    <p class="text-xs text-zinc-600 mt-1">填写海报URL后预览</p>
                  </div>
                </div>
              </div>
              <div class="mt-4 space-y-2 text-sm">
                <div class="flex items-start gap-3">
                  <span class="text-zinc-500 flex-shrink-0 w-12">片名</span>
                  <span class="text-zinc-200 truncate">{{ title || '—' }}</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-zinc-500 flex-shrink-0 w-12">导演</span>
                  <span class="text-zinc-200 truncate">{{ director || '—' }}</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-zinc-500 flex-shrink-0 w-12">年份</span>
                  <span class="text-zinc-200 tabular-nums">{{ year || '—' }}</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-zinc-500 flex-shrink-0 w-12">类型</span>
                  <span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/30">{{ genre }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
