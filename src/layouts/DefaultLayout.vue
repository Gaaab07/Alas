<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Navbar -->
    <Navbar />

    <!-- Contenido principal -->
    <main class="flex-grow-1 app-content">
      <RouterView />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/AppNavbar.vue'
import Footer from '../components/AppFooter.vue'
</script>
