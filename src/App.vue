<template>
  <div class="bg-slate-900 min-h-screen font-sans antialiased">
    <!-- Splash Screen -->
    <SplashScreen v-if="showSplash" @finish="showSplash = false" />

    <!-- Main Router View -->
    <router-view v-else v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SplashScreen from './components/SplashScreen.vue'

const showSplash = ref(true)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

body {
  margin: 0;
  padding: 0;
  background-color: #0f172a; /* matches slate-900 */
}

#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.page-enter-active, .page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
