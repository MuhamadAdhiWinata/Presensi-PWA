<template>
  <div>
    <!-- Splash Screen -->
    <SplashScreen />

    <!-- Main App (after splash fades) -->
    <Transition name="page">
      <LoginForm v-if="!isLoggedIn" />
      <HomeView v-else :user="user!" @logout="handleLogout" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import SplashScreen from './components/SplashScreen.vue'
import LoginForm from './components/LoginForm.vue'
import HomeView from './components/HomeView.vue'
import { useAuth } from './composables/useAuth'

const { user, isLoggedIn, logout } = useAuth()

function handleLogout() {
  if (confirm('Yakin ingin keluar? Data login akan dihapus.')) {
    logout()
  }
}
</script>
