<template>
  <div class="min-h-screen bg-slate-900 text-white pb-12 overflow-x-hidden uppercase-none">
    <!-- Header -->
    <header class="sticky top-0 z-20 backdrop-blur-md bg-slate-900/70 border-b border-white/10 px-4 pt-10 pb-6">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/" class="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </router-link>
          <div>
            <h1 class="text-xl font-black tracking-tight">Monitoring Presensi</h1>
            <p class="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Dashboard • Real-time</p>
          </div>
        </div>
        <button 
          @click="fetchRekap" 
          :disabled="isLoading"
          class="p-2.5 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-400 hover:bg-blue-600/20 transition disabled:opacity-30"
        >
          <svg class="w-5 h-5" :class="{'animate-spin': isLoading}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 mt-8 space-y-6">
      
      <!-- Search & Filters -->
      <div class="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cari nama karyawan..." 
            class="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:outline-none text-sm transition"
          />
        </div>
        <div class="flex gap-2">
          <button 
            @click="filterStatus = 'Semua'"
            class="px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition"
            :class="filterStatus === 'Semua' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-slate-400'"
          >
            Semua
          </button>
          <button 
            @click="filterStatus = 'Sudah'"
            class="px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition"
            :class="filterStatus === 'Sudah' ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/20' : 'bg-white/5 border-white/10 text-slate-400'"
          >
            Sudah Absen
          </button>
          <button 
            @click="filterStatus = 'Belum'"
            class="px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition"
            :class="filterStatus === 'Belum' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 border-white/10 text-slate-400'"
          >
            Belum Absen
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total User" :value="stats.total" color="blue" />
        <StatCard title="Sudah Absen" :value="stats.sudah" color="green" />
        <StatCard title="Belum Absen" :value="stats.belum" color="red" />
        <StatCard title="Persentase" :value="stats.percent + '%'" color="indigo" />
      </div>

      <!-- Table Card -->
      <div class="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/5 bg-white/2">
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">NIK</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Lengkap</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Status Hari Ini</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="item in filteredRekap" 
                :key="item.nik" 
                class="border-b border-white/5 hover:bg-white/[0.02] transition"
              >
                <td class="px-6 py-4 text-xs font-mono text-slate-400">{{ item.nik }}</td>
                <td class="px-6 py-4 text-sm font-bold">{{ item.nama }}</td>
                <td class="px-6 py-4 text-right">
                  <span 
                    class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
                    :class="item.status === 'Sudah' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'"
                  >
                    {{ item.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredRekap.length === 0 && !isLoading">
                <td colspan="3" class="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                  Tidak ada data yang cocok dengan kriteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StatCard from './StatCard.vue'

interface RekapItem {
  nik: string
  nama: string
  status: 'Sudah' | 'Belum'
}

const rekapData = ref<RekapItem[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const filterStatus = ref<'Semua' | 'Sudah' | 'Belum'>('Semua')

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

async function fetchRekap() {
  isLoading.value = true
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'getRekap' })
    })
    const data = await response.json()
    rekapData.value = data
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredRekap = computed(() => {
  return rekapData.value.filter(item => {
    const matchName = item.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = filterStatus.value === 'Semua' || item.status === filterStatus.value
    return matchName && matchStatus
  })
})

const stats = computed(() => {
  const total = rekapData.value.length
  const sudah = rekapData.value.filter(i => i.status === 'Sudah').length
  const belum = total - sudah
  const percent = total > 0 ? Math.round((sudah / total) * 100) : 0
  return { total, sudah, belum, percent }
})



onMounted(fetchRekap)
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
