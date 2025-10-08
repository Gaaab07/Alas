<template>
  <div>
    <RouterView />
    
    <!-- Modal de advertencia de sesión -->
    <Transition name="fade">
      <div v-if="showWarning" class="session-warning-overlay" @click.self="stayLoggedIn">
        <div class="session-warning-modal">
          <div class="text-center">
            <i class="fa-solid fa-clock fa-3x text-warning mb-3"></i>
            <h4 class="mb-3">Tu sesión está por expirar</h4>
            <p class="mb-4">
              Por seguridad, tu sesión se cerrará en 
              <span class="text-danger fs-4 fw-bold session-countdown">{{ remainingSeconds }}</span> 
              segundos por inactividad.
            </p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <button 
                class="btn btn-primary btn-lg"
                @click="stayLoggedIn"
              >
                <i class="fa-solid fa-check me-2"></i>
                Continuar navegando
              </button>
              <button 
                class="btn btn-outline-secondary btn-lg"
                @click="performLogout"
              >
                <i class="fa-solid fa-sign-out-alt me-2"></i>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useAutoLogout } from '@/composables/useAutoLogout'
import '@/assets/styles/session-warning.css'

// 2 minutos de inactividad, advertencia de 30 segundos antes
const { showWarning, remainingSeconds, stayLoggedIn, performLogout } = useAutoLogout(2, 30)
</script>