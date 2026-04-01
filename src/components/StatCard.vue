<template>
  <div class="p-5 rounded-3xl border backdrop-blur-sm" :class="colorClasses">
    <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{{ title }}</p>
    <p class="text-2xl font-black tracking-tighter">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string | number
  color: string
}>()

const colors: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
  indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

const colorClasses = computed(() => colors[props.color] || '')
</script>
