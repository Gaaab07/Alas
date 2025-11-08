<template>
  <footer class="footer text-white">
    <div class="container-fluid px-4 px-lg-5 py-5">
      <div class="row g-4">
        <!-- Columna 1: Información de la empresa -->
        <div class="col-lg-4 col-md-6">
          <h5 class="footer-title mb-3">ALAS®</h5>
          <p class="footer-text mb-3">
            Moda urbana con estilo propio. Encuentra las mejores prendas para expresar tu personalidad.
          </p>
        </div>

        <!-- Columna 2: Enlaces rápidos -->
        <div class="col-lg-3 col-md-6">
          <h6 class="footer-subtitle mb-3">TIENDA</h6>
          <ul class="footer-links">
            <li>
              <router-link to="/shop">Productos</router-link>
            </li>
            <li>
              <router-link to="/collections">Colecciones</router-link>
            </li>
            <li>
              <router-link to="/orders">Mis Pedidos</router-link>
            </li>
            <li>
              <router-link to="/profile">Mi Cuenta</router-link>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Políticas -->
        <div class="col-lg-3 col-md-6">
          <h6 class="footer-subtitle mb-3">POLÍTICAS</h6>
          <ul class="footer-links">
            <li>
              <router-link to="/politicas/reembolso">Política de Reembolso</router-link>
            </li>
            <li>
              <router-link to="/politicas/envios">Política de Envíos</router-link>
            </li>
            <li>
              <router-link to="/politicas/privacidad">Política de Privacidad</router-link>
            </li>
            <li>
              <router-link to="/politicas/terminos">Condiciones de Servicio</router-link>
            </li>
          </ul>
        </div>

        <!-- Columna 4: Contacto -->
        <div class="col-lg-2 col-md-6">
          <h6 class="footer-subtitle mb-3">CONTACTO</h6>
          <ul class="footer-contact">
            <li>
              <i class="fa-solid fa-envelope me-2"></i>
              <a href="mailto:soportealasperu@gmail.com">soportealasperu@gmail.com</a>
            </li>
            <li>
              <i class="fa-brands fa-whatsapp me-2"></i>
              <a href="https://wa.me/51914911135" target="_blank">+51 914 911 135</a>
            </li>
            <li>
              <i class="fa-solid fa-map-marker-alt me-2"></i>
              <span>Lima, Perú</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Línea divisoria -->
      <hr class="footer-divider my-4">

      <!-- Copyright -->
      <div class="text-center">
        <p class="footer-copyright mb-0">
          Copyright &copy; ALAS {{ currentYear }}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import '@/assets/Styles/footer.css'

const currentYear = computed(() => new Date().getFullYear())
</script>