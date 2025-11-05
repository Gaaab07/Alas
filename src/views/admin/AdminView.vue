<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Panel de Administración</h1>

    <p v-if="profile?.role !== 'admin'">
      No tienes permisos para acceder a esta sección.
    </p>

    <div v-else>
      <p>Bienvenido administrador <b>{{ fullName }}</b></p>
      <ul class="mt-4 list-disc list-inside">
        <li>Gestionar usuarios</li>
        <li>Gestionar productos</li>
        <li>Ver estadísticas de ventas</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { profile } = useAuth()


const fullName = computed(() => {
  if (!profile.value) return 'Administrador'
  const first = profile.value.first_name || ''
  const last = profile.value.last_name || ''
  return `${first} ${last}`.trim() || 'Administrador'
})
</script>