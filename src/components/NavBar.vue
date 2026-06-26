<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Film, Plus, BarChart3, Home, Menu, X } from 'lucide-vue-next';

const route = useRoute();
const mobileOpen = ref(false);

const navItems = [
  { to: '/', label: '影单', icon: Home },
  { to: '/add', label: '添加', icon: Plus },
  { to: '/stats', label: '统计', icon: BarChart3 },
];

function isActive(path: string): boolean {
  return route.path === path;
}

function closeMobile(): void {
  mobileOpen.value = false;
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center gap-2 group" @click="closeMobile">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <Film class="w-5 h-5 text-zinc-900" :stroke-width="2.5" />
          </div>
          <span class="font-bold text-lg tracking-tight text-zinc-100">光影手札</span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            :class="isActive(item.to)
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.label }}
            <span
              v-if="isActive(item.to)"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-400 rounded-full"
            />
          </RouterLink>
        </nav>

        <button
          class="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav v-if="mobileOpen" class="md:hidden border-t border-zinc-800 bg-zinc-900">
        <div class="px-4 py-3 space-y-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.to)
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60'"
            @click="closeMobile"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>
    </transition>
  </header>
</template>
