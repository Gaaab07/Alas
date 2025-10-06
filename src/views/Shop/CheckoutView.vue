<template>
  <div class="checkout-container">
    <div class="container py-5">
      <!-- Header con breadcrumb -->
      <div class="checkout-header mb-4">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/shop">Tienda</router-link>
            </li>
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="cartStore.openCart()">Carrito</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Información</li>
            <li class="breadcrumb-item text-muted">Envío</li>
            <li class="breadcrumb-item text-muted">Pago</li>
          </ol>
        </nav>
      </div>

      <div class="row g-5">
        <!-- Columna izquierda: Formulario -->
        <div class="col-lg-7">
          <!-- Contacto -->
          <section class="mb-5">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0">Contacto</h4>
              <button 
                v-if="!isAuthenticated"
                @click="goToSignIn" 
                class="btn btn-link text-decoration-underline p-0"
              >
                Iniciar sesión
              </button>
            </div>
            
            <div class="form-group">
              <input 
                v-model="checkoutForm.email"
                type="email" 
                class="form-control form-control-lg" 
                placeholder="Email o número de teléfono móvil"
                required
              />
            </div>
            
            <div class="form-check mt-3">
              <input 
                v-model="checkoutForm.newsletter"
                class="form-check-input" 
                type="checkbox" 
                id="newsletter"
              />
              <label class="form-check-label" for="newsletter">
                Enviarme novedades y ofertas por correo electrónico
              </label>
            </div>
          </section>

          <!-- Forma de entrega -->
          <section class="mb-5">
            <h4 class="mb-3">Forma de entrega</h4>
            
            <div class="delivery-options">
              <div 
                class="delivery-option"
                :class="{ active: checkoutForm.deliveryMethod === 'shipping' }"
                @click="checkoutForm.deliveryMethod = 'shipping'"
              >
                <input 
                  type="radio" 
                  name="delivery" 
                  value="shipping"
                  v-model="checkoutForm.deliveryMethod"
                />
                <span class="delivery-label">
                  <i class="fa-solid fa-truck me-2"></i>
                  Envío
                </span>
              </div>
              
              <div 
                class="delivery-option"
                :class="{ active: checkoutForm.deliveryMethod === 'pickup' }"
                @click="checkoutForm.deliveryMethod = 'pickup'"
              >
                <input 
                  type="radio" 
                  name="delivery" 
                  value="pickup"
                  v-model="checkoutForm.deliveryMethod"
                />
                <span class="delivery-label">
                  <i class="fa-solid fa-store me-2"></i>
                  Retiro
                </span>
              </div>
            </div>
          </section>

          <!-- Dirección de envío -->
          <section class="mb-5">
            <h4 class="mb-3">Dirección de envío</h4>
            
            <div class="row g-3">
              <!-- País/Región -->
              <div class="col-12">
                <label class="form-label">País / Región</label>
                <select 
                  v-model="checkoutForm.country"
                  class="form-select form-select-lg"
                >
                  <option value="PE">Perú</option>
                  <option value="AR">Argentina</option>
                  <option value="CL">Chile</option>
                  <option value="CO">Colombia</option>
                </select>
              </div>

              <!-- Nombre y Apellido -->
              <div class="col-md-6">
                <input 
                  v-model="checkoutForm.firstName"
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Nombre"
                  required
                />
              </div>
              <div class="col-md-6">
                <input 
                  v-model="checkoutForm.lastName"
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Apellidos"
                  required
                />
              </div>

              <!-- DNI/CE/Pasaporte -->
              <div class="col-12">
                <input 
                  v-model="checkoutForm.documentId"
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="DNI, CE o Pasaporte"
                  required
                />
              </div>

              <!-- Dirección -->
              <div class="col-12">
                <input 
                  v-model="checkoutForm.address"
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Dirección"
                  required
                />
              </div>

              <!-- Apartamento (opcional) -->
              <div class="col-12">
                <input 
                  v-model="checkoutForm.apartment"
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Casa, apartamento, etc. (opcional)"
                />
              </div>

              <!-- Código postal, Distrito, Provincia -->
              <div class="col-md-4">
                <input 
                  v-model="checkoutForm.postalCode"
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Código postal"
                />
              </div>
              <div class="col-md-4">
                <input 
                  v-model="checkoutForm.district"
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="Distrito"
                  required
                />
              </div>
              <div class="col-md-4">
                <select 
                  v-model="checkoutForm.province"
                  class="form-select form-select-lg"
                  required
                >
                  <option value="">Provincia / Estado</option>
                  <option value="Lima">Lima</option>
                  <option value="Arequipa">Arequipa</option>
                  <option value="Cusco">Cusco</option>
                  <option value="Trujillo">Trujillo</option>
                </select>
              </div>

              <!-- Teléfono -->
              <div class="col-12">
                <div class="input-group input-group-lg">
                  <input 
                    v-model="checkoutForm.phone"
                    type="tel" 
                    class="form-control" 
                    placeholder="Teléfono"
                    required
                  />
                  <button class="btn btn-outline-secondary" type="button">
                    <i class="fa-solid fa-circle-info"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Botones de navegación -->
          <div class="d-flex justify-content-between mt-4">
            <router-link to="/shop" class="btn btn-link text-decoration-none">
              <i class="fa-solid fa-chevron-left me-2"></i>
              Volver a la tienda
            </router-link>
            
            <button 
              @click="proceedToPayment"
              class="btn btn-dark btn-lg px-5"
              :disabled="!isFormValid"
            >
              Continuar al envío
              <i class="fa-solid fa-chevron-right ms-2"></i>
            </button>
          </div>
        </div>

        <!-- Columna derecha: Resumen del pedido -->
        <div class="col-lg-5">
          <div class="order-summary">
            <h5 class="mb-4">Resumen del pedido</h5>

            <!-- Items del carrito -->
            <div class="cart-items-summary">
              <div 
                v-for="item in cartStore.items" 
                :key="item.id"
                class="cart-item-summary"
              >
                <div class="item-image-wrapper">
                  <img 
                    :src="item.image_url || 'https://dummyimage.com/80x80/dee2e6/6c757d.jpg'" 
                    :alt="item.name"
                  />
                  <span class="item-quantity-badge">{{ item.quantity }}</span>
                </div>
                <div class="item-details">
                  <h6>{{ item.name }}</h6>
                  <p class="text-muted small mb-0">
                    {{ item.size }}
                  </p>
                </div>
                <div class="item-price">
                  PEN {{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>

            <hr class="my-4" />

            <!-- Subtotal y total -->
            <div class="summary-totals">
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span class="fw-bold">PEN {{ cartStore.subtotal.toFixed(2) }}</span>
              </div>
              
              <div class="d-flex justify-content-between mb-2">
                <span>
                  Envío
                  <i class="fa-solid fa-circle-info ms-1 text-muted"></i>
                </span>
                <span class="text-muted small">Calculado en el siguiente paso</span>
              </div>

              <hr class="my-3" />

              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Total</h5>
                <h4 class="mb-0 fw-bold">PEN {{ cartStore.total.toFixed(2) }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import '@/assets/styles/checkout.css'

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()

const checkoutForm = ref({
  email: '',
  newsletter: false,
  deliveryMethod: 'shipping',
  country: 'PE',
  firstName: '',
  lastName: '',
  documentId: '',
  address: '',
  apartment: '',
  postalCode: '',
  district: '',
  province: '',
  phone: ''
})

const isFormValid = computed(() => {
  return (
    checkoutForm.value.email &&
    checkoutForm.value.firstName &&
    checkoutForm.value.lastName &&
    checkoutForm.value.documentId &&
    checkoutForm.value.address &&
    checkoutForm.value.district &&
    checkoutForm.value.province &&
    checkoutForm.value.phone
  )
})

const goToSignIn = () => {
  router.push('/signin')
}

const proceedToPayment = () => {
  if (isFormValid.value) {
    console.log('Datos del checkout:', checkoutForm.value)
    alert('Continuando al siguiente paso...')
  }
}
</script>