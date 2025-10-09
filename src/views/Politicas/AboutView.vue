<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="about-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">ALAS®</h1>
        <p class="hero-subtitle">Moda urbana con estilo propio</p>
        <div class="hero-divider"></div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="about-story">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <div class="story-image-wrapper">
              <div class="story-image-placeholder">
                <i class="fa-solid fa-vest"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="story-content">
              <h2 class="section-title">Nuestra Historia</h2>
              <p class="story-text">
                ALAS® nació en el corazón de Lima, Perú, con una visión clara: 
                crear moda urbana que permita a cada persona expresar su personalidad 
                única. Somos más que una marca de ropa, somos un movimiento que 
                celebra la individualidad y el estilo auténtico.
              </p>
              <p class="story-text">
                Desde nuestros inicios, nos hemos comprometido a ofrecer prendas 
                de alta calidad que combinan diseño contemporáneo, comodidad y 
                durabilidad. Cada pieza está cuidadosamente seleccionada para 
                reflejar las últimas tendencias urbanas sin perder nuestra esencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="about-values">
      <div class="container">
        <h2 class="section-title text-center mb-5">Nuestros Valores</h2>
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="value-card">
              <div class="value-icon">
                <i class="fa-solid fa-star"></i>
              </div>
              <h3 class="value-title">Calidad</h3>
              <p class="value-description">
                Seleccionamos las mejores telas y materiales para garantizar 
                prendas duraderas y cómodas.
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="value-card">
              <div class="value-icon">
                <i class="fa-solid fa-palette"></i>
              </div>
              <h3 class="value-title">Estilo</h3>
              <p class="value-description">
                Diseños únicos que reflejan las últimas tendencias de la 
                moda urbana global.
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="value-card">
              <div class="value-icon">
                <i class="fa-solid fa-users"></i>
              </div>
              <h3 class="value-title">Comunidad</h3>
              <p class="value-description">
                Construimos una comunidad de personas que comparten nuestra 
                pasión por la moda.
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="value-card">
              <div class="value-icon">
                <i class="fa-solid fa-leaf"></i>
              </div>
              <h3 class="value-title">Sostenibilidad</h3>
              <p class="value-description">
                Comprometidos con prácticas responsables que cuidan nuestro 
                planeta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Location Section -->
    <section class="about-location">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 order-lg-2 mb-4 mb-lg-0">
            <div class="location-image-wrapper">
              <div class="location-image-placeholder">
                <i class="fa-solid fa-map-location-dot"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-6 order-lg-1">
            <div class="location-content">
              <h2 class="section-title">Desde Lima para el Mundo</h2>
              <p class="location-text">
                Ubicados en Lima, Perú, nuestra marca lleva el espíritu vibrante 
                y la energía de la ciudad a cada una de nuestras colecciones. 
                Nos inspiramos en la riqueza cultural de nuestro país y la 
                fusionamos con las tendencias urbanas globales.
              </p>
              <div class="location-details">
                <div class="location-detail">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>Lima, Perú</span>
                </div>
                <div class="location-detail">
                  <i class="fa-solid fa-envelope"></i>
                  <span>contacto@alas.pe</span>
                </div>
                <div class="location-detail">
                  <i class="fa-solid fa-phone"></i>
                  <span>+51 XXX XXX XXX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="about-mission">
      <div class="container">
        <div class="mission-card">
          <h2 class="section-title text-center mb-4">Nuestra Misión</h2>
          <p class="mission-text">
            En ALAS® creemos que la moda es una forma de expresión personal. 
            Nuestra misión es proporcionar prendas de alta calidad que permitan 
            a cada persona contar su propia historia, celebrar su individualidad 
            y sentirse segura en su propia piel. Trabajamos cada día para ofrecer 
            las mejores experiencias de compra y productos que superen las 
            expectativas de nuestra comunidad.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="about-cta">
      <div class="container text-center">
        <h2 class="cta-title">Únete a la Familia ALAS®</h2>
        <p class="cta-text">
          Descubre nuestra última colección y encuentra las prendas perfectas 
          para expresar tu estilo único.
        </p>
        <router-link to="/shop" class="btn btn-dark btn-lg cta-button">
          Explorar Tienda
          <i class="fa-solid fa-arrow-right ms-2"></i>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0)
})
</script>
<style scoped>
@import '@/assets/styles/about.css';
</style>