<template>
  <div class="hero-video-container">
    <video autoplay muted loop playsinline class="w-100">
      <source src="@/assets/videos/Dior.mp4" type="video/mp4" />
      Tu navegador no soporta video.
    </video>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero-video-container video {
  object-fit: cover; /* ocupa todo el contenedor */
  height: 500px; /* ajusta la altura a tu gusto */
}
</style>
