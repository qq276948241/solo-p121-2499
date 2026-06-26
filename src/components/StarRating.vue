<script setup lang="ts">
import { computed, ref } from 'vue';
import { Star } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    allowHalf?: boolean;
  }>(),
  {
    readonly: false,
    size: 'md',
    allowHalf: true,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const hoverValue = ref<number | null>(null);

const displayValue = computed(() => (hoverValue.value !== null ? hoverValue.value : props.modelValue));

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const gapMap = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
};

function handleClick(index: number, isHalf: boolean): void {
  if (props.readonly) return;
  const val = isHalf && props.allowHalf ? index + 0.5 : index + 1;
  if (props.modelValue === val) {
    emit('update:modelValue', 0);
  } else {
    emit('update:modelValue', val);
  }
}

function handleMouseMove(e: MouseEvent, index: number): void {
  if (props.readonly || !props.allowHalf) return;
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const isHalf = x < rect.width / 2;
  hoverValue.value = isHalf ? index + 0.5 : index + 1;
}

function handleMouseLeave(): void {
  hoverValue.value = null;
}

function starFill(index: number): 'full' | 'half' | 'empty' {
  const v = displayValue.value;
  if (v >= index + 1) return 'full';
  if (v >= index + 0.5) return 'half';
  return 'empty';
}
</script>

<template>
  <div
    class="inline-flex items-center select-none"
    :class="[gapMap[size], { 'cursor-pointer': !readonly, 'cursor-default': readonly }]"
    @mouseleave="handleMouseLeave"
  >
    <div
      v-for="i in 5"
      :key="i"
      class="relative flex items-center"
      :class="sizeMap[size]"
      @click="handleClick(i - 1, false)"
      @mousemove="handleMouseMove($event, i - 1)"
    >
      <Star
        :class="[
          sizeMap[size],
          'transition-colors duration-150',
          starFill(i - 1) === 'empty' ? 'text-zinc-700' : 'text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.3)]',
        ]"
        :fill="starFill(i - 1) === 'full' ? 'currentColor' : 'none'"
        :stroke-width="2"
      />
      <div
        v-if="starFill(i - 1) === 'half'"
        class="absolute inset-0 overflow-hidden"
        style="width: 50%"
      >
        <Star
          :class="[sizeMap[size], 'text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.3)]']"
          fill="currentColor"
          :stroke-width="2"
        />
      </div>
      <div
        v-if="!readonly && allowHalf"
        class="absolute inset-0 flex"
      >
        <div
          class="w-1/2 h-full cursor-pointer"
          @click.stop="handleClick(i - 1, true)"
          @mousemove.stop="handleMouseMove($event, i - 1)"
        />
        <div
          class="w-1/2 h-full cursor-pointer"
          @click.stop="handleClick(i - 1, false)"
          @mousemove.stop="handleMouseMove($event, i - 1)"
        />
      </div>
    </div>
    <span
      v-if="modelValue > 0 && size !== 'sm'"
      class="ml-2 text-sm font-semibold text-amber-400 tabular-nums"
    >
      {{ modelValue.toFixed(1) }}
    </span>
  </div>
</template>
