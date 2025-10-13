<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div 
      v-if="cartStore.isCartOpen" 
      class="cart-overlay"
      @click="cartStore.closeCart()"
    ></div>
  </Transition>

  <!-- Sidebar del carrito -->
  <Transition name="slide">
    <div v-if="cartStore.isCartOpen" class="cart-sidebar">
      <!-- Header -->
      <div class="cart-header">
        <h5 class="mb-0 fw-bold">
          CARRITO
          <span class="badge bg-dark ms-2">{{ cartStore.itemsCount }}</span>
        </h5>
        <button 
          class="btn-close" 
          @click="cartStore.closeCart()"
          aria-label="Cerrar carrito"
        ></button>
      </div>

      <!-- Contenido del carrito -->
      <div class="cart-body">
        <!-- Carrito vacío -->
        <div v-if="cartStore.items.length === 0" class="empty-cart">
          <i class="fa-solid fa-shopping-cart fa-3x text-muted mb-3"></i>
          <p class="text-muted">Tu carrito está vacío</p>
          <button class="btn btn-primary" @click="cartStore.closeCart()">
            Ir a la tienda
          </button>
        </div>

        <!-- Items del carrito -->
        <div v-else class="cart-items">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="cart-item"
          >
            <!-- Imagen -->
            <div class="cart-item-image">
              <img 
                :src="item.image_url || 'https://dummyimage.com/100x100/dee2e6/6c757d.jpg'" 
                :alt="item.name"
                loading="lazy"  
              />
            </div>

            <!-- Detalles -->
            <div class="cart-item-details">
              <h6 class="mb-1">{{ item.name }}</h6>
              <p class="text-muted small mb-1">
                <span v-if="item.size">{{ item.size }}</span>
                <span v-if="item.size && item.color"> | </span>
                <span v-if="item.color">{{ item.color }}</span>
              </p>
              <p class="mb-2 fw-bold">{{ formatPrice(item.price) }}</p>

              <!-- Controles de cantidad -->
              <div class="quantity-controls">
                <button 
                  class="btn btn-sm btn-outline-secondary"
                  @click="cartStore.decrementQuantity(item.id)"
                >
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button 
                  class="btn btn-sm btn-outline-secondary"
                  @click="cartStore.incrementQuantity(item.id)"
                  :disabled="item.quantity >= item.stock"
                >
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>

              <!-- Stock disponible -->
              <small v-if="item.quantity >= item.stock" class="text-warning">
                Stock máximo alcanzado
              </small>
            </div>

            <!-- Botón eliminar -->
            <button 
              class="btn-remove"
              @click="cartStore.removeItem(item.id)"
              title="Eliminar producto"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer con totales y botón de pago -->
      <div v-if="cartStore.items.length > 0" class="cart-footer">
        <!-- Sección de descuento -->
        <div class="discount-section">
          <button 
            class="btn btn-link w-100 text-start text-decoration-none"
            type="button"
            @click="showDiscountInput = !showDiscountInput"
          >
            DESCUENTO
            <i class="fa-solid float-end mt-1" :class="showDiscountInput ? 'fa-minus' : 'fa-plus'"></i>
          </button>
          
          <div v-if="showDiscountInput" class="discount-input mt-2">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Código de descuento"
              disabled
            />
          </div>
        </div>

        <hr class="my-3" />

        <!-- Total -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">Total estimado</h6>
          <h5 class="mb-0 fw-bold">{{ formatPrice(cartStore.total) }}</h5>
        </div>

        <p class="text-muted small mb-3">
          Los envíos e impuestos se calculan en la página de pago.
        </p>

        <!-- Botón pagar -->
        <button 
          class="btn btn-dark w-100 mb-2 py-3"
          @click="goToCheckout"
        >
          <i class="fa-solid fa-lock me-2"></i>
          PAGAR
        </button>

        <!-- Opciones de pago -->
        <div class="payment-options text-center">
          <small class="text-muted">Métodos de pago aceptados</small>
          <div class="d-flex justify-content-center gap-2 mt-2">
            <i class="fa-brands fa-cc-visa fa-2x text-muted"></i>
            <i class="fa-brands fa-cc-mastercard fa-2x text-muted"></i>
            <i class="fa-brands fa-cc-paypal fa-2x text-muted"></i>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import '@/assets/Styles/cart-sidebar.css'

const router = useRouter()
const cartStore = useCartStore()
const showDiscountInput = ref(false)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(price)
}

const goToCheckout = () => {
  cartStore.closeCart()
  router.push('/checkout')
}
</script>