<template>
  <div class="collections-view">
    <div class="container">
      <!-- Header -->
      <div class="collections-header">
        <h1 class="collections-title">COLECCIONES</h1>
        <p class="collections-subtitle">
          Descubre nuestras colecciones exclusivas diseñadas para cada temporada del año
        </p>
      </div>

      <!-- Grid de colecciones -->
      <div class="collections-grid">
        <!-- Colección Verano -->
        <div class="collection-card collection-verano" @click="goToCollection('verano')">
          <img 
            src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=800" 
            alt="Colección Verano"
            class="collection-image"
          />
          <div class="collection-overlay">
            <h2 class="collection-name">VERANO</h2>
            <p class="collection-description">
              Camisetas, shorts, gorras y más para los días soleados
            </p>
            <span class="collection-cta">
              Ver colección <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>

        <!-- Colección Invierno -->
        <div class="collection-card collection-invierno" @click="goToCollection('invierno')">
          <img 
            src="https://images.unsplash.com/photo-1483118714900-540cf339fd46?w=800" 
            alt="Colección Invierno"
            class="collection-image"
          />
          <div class="collection-overlay">
            <h2 class="collection-name">INVIERNO</h2>
            <p class="collection-description">
              Sudaderas, chaquetas y abrigos para el frío
            </p>
            <span class="collection-cta">
              Ver colección <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>

        <!-- Colección Primavera -->
        <div class="collection-card collection-primavera" @click="goToCollection('primavera')">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800" 
            alt="Colección Primavera"
            class="collection-image"
          />
          <div class="collection-overlay">
            <h2 class="collection-name">PRIMAVERA</h2>
            <p class="collection-description">
              Lo mejor del verano e invierno combinados
            </p>
            <span class="collection-cta">
              Ver colección <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>

        <!-- Colección Otoño -->
        <div class="collection-card collection-otono" @click="goToCollection('otono')">
          <img 
            src="https://images.unsplash.com/photo-1504198266287-1659872e6590?w=800" 
            alt="Colección Otoño"
            class="collection-image"
          />
          <div class="collection-overlay">
            <h2 class="collection-name">OTOÑO</h2>
            <p class="collection-description">
              Cardigans, sudaderas y prendas de transición
            </p>
            <span class="collection-cta">
              Ver colección <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Todos los productos -->
      <div class="text-center">
        <button 
          class="btn btn-dark btn-lg px-5 py-3"
          @click="goToCollection('all-products')"
        >
          <i class="fa-solid fa-grid-2 me-2"></i>
          Ver Todos los Productos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import '@/assets/styles/collections.css'

const router = useRouter()

const goToCollection = (collection: string) => {
  router.push({ name: 'collection-detail', params: { collection } })
}
</script>