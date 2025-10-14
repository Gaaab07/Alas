<template>
  <div class="orders-view">
    <div class="container py-5">
      <h1 class="orders-title mb-4">Mis Pedidos</h1>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando pedidos...</span>
        </div>
      </div>

      <!-- No autenticado -->
      <div v-else-if="!user" class="alert alert-warning">
        <i class="fa-solid fa-exclamation-triangle me-2"></i>
        Necesitas iniciar sesión para ver tus pedidos.
        <router-link to="/signin" class="btn btn-primary ms-3">
          Iniciar Sesión
        </router-link>
      </div>

      <!-- Sin pedidos -->
      <div v-else-if="totalOrders === 0" class="empty-orders text-center py-5">
        <i class="fa-solid fa-shopping-bag fa-3x text-muted mb-3"></i>
        <h3>No tienes pedidos aún</h3>
        <p class="text-muted">Cuando realices una compra, tus pedidos aparecerán aquí.</p>
        <router-link to="/shop" class="btn btn-primary mt-3">
          <i class="fa-solid fa-store me-2"></i>
          Ir a la tienda
        </router-link>
      </div>

      <!-- Lista de pedidos -->
      <div v-else>
        <div class="orders-list">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="order-card mb-4"
          >
            <!-- Header de la orden -->
            <div class="order-header">
              <div class="row align-items-center">
                <div class="col-md-3 col-6 mb-2 mb-md-0">
                  <small class="text-muted d-block">Pedido</small>
                  <strong>#{{ order.id.substring(0, 8) }}</strong>
                </div>
                <div class="col-md-3 col-6 mb-2 mb-md-0">
                  <small class="text-muted d-block">Fecha</small>
                  <strong>{{ formatDate(order.created_at) }}</strong>
                </div>
                <div class="col-md-3 col-6">
                  <small class="text-muted d-block">Total</small>
                  <strong class="text-primary">S/. {{ order.total.toFixed(2) }}</strong>
                </div>
                <div class="col-md-3 col-6 text-end text-md-start">
                  <span class="badge bg-success">
                    {{ order.status === 'completed' ? 'Completado' : order.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Items de la orden -->
            <div class="order-body">
              <h6 class="mb-3">Productos ({{ order.items?.length || 0 }})</h6>
              <div class="order-items">
                <div 
                  v-for="item in order.items" 
                  :key="item.id"
                  class="order-item"
                >
                  <div class="item-image">
                    <img 
                      :src="item.product_image_url || 'https://dummyimage.com/80x80/dee2e6/6c757d.jpg'" 
                      :alt="item.product_name"
                      loading="lazy"
                    />
                  </div>
                  <div class="item-details flex-grow-1">
                    <h6>{{ item.product_name }}</h6>
                    <p class="text-muted small mb-1">
                      <span v-if="item.product_size">Talla: {{ item.product_size }}</span>
                      <span v-if="item.product_size && item.product_color"> | </span>
                      <span v-if="item.product_color">Color: {{ item.product_color }}</span>
                    </p>
                    <p class="text-muted small mb-0">Cantidad: {{ item.quantity }}</p>
                  </div>
                  <div class="item-price">
                    <strong>S/. {{ item.subtotal.toFixed(2) }}</strong>
                    <small class="text-muted d-block">S/. {{ item.product_price.toFixed(2) }} c/u</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer con dirección -->
            <div class="order-footer">
              <div class="row">
                <div class="col-md-6 mb-3 mb-md-0">
                  <h6 class="mb-2">
                    <i class="fa-solid fa-location-dot me-2 text-primary"></i>
                    Dirección de envío
                  </h6>
                  <p class="mb-1">
                    <strong>{{ order.shipping_address.firstName }} {{ order.shipping_address.lastName }}</strong>
                  </p>
                  <p class="text-muted small mb-1">
                    <i class="fa-solid fa-home me-1"></i>
                    {{ order.shipping_address.address }}
                    <span v-if="order.shipping_address.apartment">
                      , {{ order.shipping_address.apartment }}
                    </span>
                  </p>
                  <p class="text-muted small mb-1">
                    <i class="fa-solid fa-map-marker-alt me-1"></i>
                    {{ order.shipping_address.district }}, {{ order.shipping_address.province }}
                    <span v-if="order.shipping_address.postalCode">
                      - {{ order.shipping_address.postalCode }}
                    </span>
                  </p>
                  <p class="text-muted small mb-1">
                    <i class="fa-solid fa-phone me-1"></i>
                    {{ order.shipping_address.phone }}
                  </p>
                  <p class="text-muted small mb-0">
                    <i class="fa-solid fa-id-card me-1"></i>
                    DNI: {{ order.shipping_address.documentId }}
                  </p>
                </div>
                
                <!-- Método de entrega -->
                <div class="col-md-6">
                  <h6 class="mb-2">
                    <i class="fa-solid fa-shipping-fast me-2 text-primary"></i>
                    Método de entrega
                  </h6>
                  <div class="delivery-info">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fa-solid fa-2x me-3" 
                         :class="getDeliveryIcon(order.delivery_method)">
                      </i>
                      <div>
                        <p class="mb-0 fw-bold">
                          {{ getDeliveryLabel(order.delivery_method) }}
                        </p>
                        <small class="text-muted d-block">
                          {{ getDeliveryDescription(order.delivery_method) }}
                        </small>
                        
                        <small v-if="order.shipping_address?.shippingMethod" class="d-block mt-1 text-primary">
                          <i class="fa-solid fa-info-circle me-1"></i>
                          {{ order.shipping_address.shippingMethod }}
                        </small>
                        <small v-if="order.shipping_address?.deliveryTime" class="d-block text-muted">
                          <i class="fa-solid fa-clock me-1"></i>
                          {{ order.shipping_address.deliveryTime }}
                        </small>
                        <small v-if="order.shipping_address?.shippingCost !== undefined" class="d-block text-success fw-bold">
                          <i class="fa-solid fa-money-bill-wave me-1"></i>
                          Costo de envío: S/. {{ order.shipping_address.shippingCost.toFixed(2) }}
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Email de confirmación -->
                  <div class="mt-3 p-2 bg-light rounded">
                    <small class="text-muted">
                      <i class="fa-solid fa-envelope me-1"></i>
                      Confirmación enviada a: <strong>{{ order.user_email }}</strong>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="pagination-container">
          <button 
            class="pagination-arrow"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="pagination-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-number"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            class="pagination-arrow"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import type { OrderWithItems } from '@/types/order'
import '@/assets/Styles/orders.css'
import '@/assets/Styles/pagination.css'

const { user } = useAuth()
const orders = ref<OrderWithItems[]>([])
const loading = ref(true)
const currentPage = ref(1)
const ordersPerPage = 5
const totalOrders = ref(0)

// Computed properties
const totalPages = computed(() => Math.ceil(totalOrders.value / ordersPerPage))

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const fetchOrders = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true

    // Obtener el total de órdenes
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)

    totalOrders.value = count || 0

    // Calcular offset para paginación
    const from = (currentPage.value - 1) * ordersPerPage
    const to = from + ordersPerPage - 1

    // Obtener las órdenes del usuario con paginación
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (ordersError) throw ordersError

    // Para cada orden, obtener sus items
    const ordersWithItems = await Promise.all(
      (ordersData || []).map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        if (itemsError) throw itemsError

        return {
          ...order,
          items: items || []
        }
      })
    )

    orders.value = ordersWithItems as OrderWithItems[]
  } catch {
    alert('Error al cargar los pedidos. Por favor, intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getDeliveryLabel = (method: string) => {
  const labels: Record<string, string> = {
    'pickup': 'Retiro en Tienda',
    'express-lima': 'Envío Express - Lima',
    'regular-lima': 'Envío Regular - Lima',
    'province': 'Envío a Provincia',
    'international': 'Envío Internacional',
    'shipping': 'Envío a Domicilio'
  }
  return labels[method] || 'Método no especificado'
}

const getDeliveryIcon = (method: string) => {
  const icons: Record<string, string> = {
    'pickup': 'fa-store text-success',
    'express-lima': 'fa-bolt text-warning',
    'regular-lima': 'fa-truck text-primary',
    'province': 'fa-truck text-info',
    'international': 'fa-plane text-danger',
    'shipping': 'fa-truck text-primary'
  }
  return icons[method] || 'fa-box text-secondary'
}

const getDeliveryDescription = (method: string) => {
  const descriptions: Record<string, string> = {
    'pickup': 'Puedes recoger tu pedido en nuestra tienda',
    'express-lima': 'Entrega en 24 horas en Lima Metropolitana',
    'regular-lima': 'Entrega en 3-5 días hábiles en Lima',
    'province': 'Entrega en 3-7 días hábiles a provincia',
    'international': 'Entrega en ~15 días hábiles vía DHL',
    'shipping': 'El pedido será enviado a tu dirección'
  }
  return descriptions[method] || 'Consulta el estado de tu envío'
}

onMounted(() => {
  fetchOrders()
})
</script>