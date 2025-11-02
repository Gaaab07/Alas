<template>
  <div class="checkout-container">
    <div class="container py-5">
      <!-- Carrito vacío -->
      <div v-if="cartStore.items.length === 0" class="alert alert-warning text-center" role="alert">
        <i class="fa-solid fa-shopping-cart fa-3x mb-3"></i>
        <h4 class="alert-heading">Tu carrito está vacío</h4>
        <p>No tienes productos en tu carrito. Agrega algunos productos antes de realizar una compra.</p>
        <hr>
        <router-link to="/shop" class="btn btn-primary">
          <i class="fa-solid fa-store me-2"></i>Ir a la tienda
        </router-link>
      </div>

      <!-- Checkout -->
      <div v-else>
        <!-- Breadcrumb -->
        <div class="checkout-header mb-4">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/shop">Tienda</router-link></li>
              <li class="breadcrumb-item"><a href="#" @click.prevent="cartStore.openCart()">Carrito</a></li>
              <li class="breadcrumb-item active" aria-current="page">Información</li>
              <li class="breadcrumb-item text-muted">Pago</li>
            </ol>
          </nav>
        </div>

        <div class="row g-5">
          <!-- Columna Izquierda: Formulario -->
          <div class="col-lg-7">
            <!-- Contacto -->
            <section class="mb-5">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Contacto</h4>
                <button v-if="!isAuthenticated" @click="goToSignIn" class="btn btn-link text-decoration-underline p-0">
                  Iniciar sesión
                </button>
              </div>
              <div class="form-group">
                <input v-model="checkoutForm.email" type="email" class="form-control form-control-lg" placeholder="Email" required />
              </div>
              <div class="form-check mt-3">
                <input v-model="checkoutForm.newsletter" class="form-check-input" type="checkbox" id="newsletter" />
                <label class="form-check-label" for="newsletter">
                  Enviarme novedades y ofertas por correo electrónico
                </label>
              </div>
            </section>

            <!-- Dirección de envío -->
            <section class="mb-5">
              <h4 class="mb-3">Dirección de envío</h4>
              <div class="row g-3">
                <!-- País -->
                <div class="col-12">
                  <label class="form-label fw-bold">País / Región *</label>
                  <select v-model="checkoutForm.country" class="form-select form-select-lg" @change="onCountryChange" required>
                    <option value="">Seleccionar país...</option>
                    <option v-for="country in availableCountries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                </div>

                <!-- Nombres -->
                <div class="col-md-6">
                  <label class="form-label">Nombre *</label>
                  <input v-model="checkoutForm.firstName" type="text" class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.firstName }" placeholder="Nombre" @input="validateName('firstName')" required />
                  <div v-if="errors.firstName" class="invalid-feedback">{{ errors.firstName }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellidos *</label>
                  <input v-model="checkoutForm.lastName" type="text" class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.lastName }" placeholder="Apellidos" @input="validateName('lastName')" required />
                  <div v-if="errors.lastName" class="invalid-feedback">{{ errors.lastName }}</div>
                </div>

                <!-- Documento -->
                <div class="col-12">
                  <label class="form-label">Tipo de Documento *</label>
                  <select v-model="checkoutForm.documentType" class="form-select form-select-lg" @change="onDocumentTypeChange" required>
                    <option value="">Seleccionar tipo...</option>
                    <option v-for="docType in availableDocumentTypes" :key="docType.value" :value="docType.value">
                      {{ docType.label }}
                    </option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label">{{ selectedDocumentLabel }} *</label>
                  <input v-model="checkoutForm.documentId" type="text" class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.documentId }" :placeholder="selectedDocumentPlaceholder" 
                    :maxlength="selectedDocumentMaxLength" @input="validateDocumentId" 
                    :disabled="!checkoutForm.documentType" required />
                  <div v-if="errors.documentId" class="invalid-feedback">{{ errors.documentId }}</div>
                  <small class="text-muted">{{ selectedDocumentHint }}</small>
                </div>

                <!-- Dirección -->
                <div class="col-12">
                  <label class="form-label">Dirección *</label>
                  <input v-model="checkoutForm.address" type="text" class="form-control form-control-lg" placeholder="Calle, número, etc." required />
                </div>

                <div class="col-12">
                  <label class="form-label">Apartamento (opcional)</label>
                  <input v-model="checkoutForm.apartment" type="text" class="form-control form-control-lg" placeholder="Apto, Dpto, Piso, etc." />
                </div>

                <!-- Provincia/Distrito -->
                <div class="col-md-6">
                  <label class="form-label">{{ provinceLabel }} *</label>
                  <select v-model="checkoutForm.province" class="form-select form-select-lg" @change="onProvinceChange" :disabled="!checkoutForm.country" required>
                    <option value="">Seleccionar...</option>
                    <option v-for="province in availableProvinces" :key="province.name" :value="province.name">
                      {{ province.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">{{ districtLabel }}</label>
                  <input v-model="checkoutForm.district" type="text" class="form-control form-control-lg" 
                    :placeholder="districtPlaceholder" :required="checkoutForm.country === 'PE'" />
                </div>

                <!-- Postal/Teléfono -->
                <div class="col-md-6">
                  <label class="form-label">Código postal {{ isInternational ? '*' : '' }}</label>
                  <input v-model="checkoutForm.postalCode" type="text" class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.postalCode }" :placeholder="postalPlaceholder" 
                    :maxlength="postalMaxLength" @input="validatePostalCode" :required="isInternational" />
                  <div v-if="errors.postalCode" class="invalid-feedback">{{ errors.postalCode }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Teléfono *</label>
                  <input v-model="checkoutForm.phone" type="tel" class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.phone }" :placeholder="phonePlaceholder" 
                    :maxlength="phoneMaxLength" @input="validatePhone" required />
                  <div v-if="errors.phone" class="invalid-feedback">{{ errors.phone }}</div>
                  <small class="text-muted">{{ phoneHint }}</small>
                </div>
              </div>
            </section>

            <!-- Forma de entrega -->
            <section class="mb-5">
              <h4 class="mb-3">Forma de entrega</h4>
              <div class="alert alert-info" v-if="!checkoutForm.country">
                <i class="fa-solid fa-info-circle me-2"></i>
                Selecciona un país para ver las opciones de envío disponibles
              </div>
              <div v-else class="shipping-options-list">
                <div v-for="option in availableShippingOptions" :key="option.id" class="shipping-option-card"
                  :class="{ 'active': selectedShippingOption?.id === option.id, 'disabled': !option.available }"
                  @click="option.available && selectShippingOption(option)">
                  <div class="shipping-option-header">
                    <input type="radio" :name="'shipping-' + option.id" :value="option.id"
                      :checked="selectedShippingOption?.id === option.id" :disabled="!option.available" @click.stop />
                    <div class="shipping-option-info">
                      <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid" :class="option.icon"></i>
                        <strong>{{ option.label }}</strong>
                      </div>
                      <small class="text-muted">{{ option.description }}</small>
                    </div>
                    <div class="shipping-option-price">
                      <strong>{{ formatCost(option.cost, option.currency) }}</strong>
                      <small class="text-muted d-block">{{ option.deliveryTime }}</small>
                    </div>
                  </div>
                  <div v-if="option.conditions && option.conditions.length > 0" class="shipping-option-conditions">
                    <ul class="mb-0">
                      <li v-for="(condition, idx) in option.conditions" :key="idx">{{ condition }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <!-- Método de Pago -->
            <section class="mb-5">
              <h4 class="mb-3">Método de Pago</h4>
              <div class="alert alert-info mb-3">
                <i class="fa-solid fa-info-circle me-2"></i>
                <strong>Modo Demo:</strong> Esta es una simulación. Usa los datos de prueba proporcionados.
              </div>
              <div class="payment-card-form">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">Número de tarjeta *</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text"><i class="fa-solid fa-credit-card"></i></span>
                      <input v-model="paymentForm.cardNumber" type="text" class="form-control" 
                        :class="{ 'is-invalid': errors.cardNumber }" placeholder="1234 5678 9012 3456" 
                        maxlength="19" @input="formatCardNumber" required />
                      <div v-if="errors.cardNumber" class="invalid-feedback">{{ errors.cardNumber }}</div>
                    </div>
                    <small class="text-muted">💳 Prueba: <code class="bg-light px-2 py-1 rounded">4532 1488 0343 6467</code></small>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Nombre en la tarjeta *</label>
                    <input v-model="paymentForm.cardName" type="text" class="form-control form-control-lg" 
                      :class="{ 'is-invalid': errors.cardName }" placeholder="JUAN PEREZ" @input="validateCardName" required />
                    <div v-if="errors.cardName" class="invalid-feedback">{{ errors.cardName }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Fecha de expiración *</label>
                    <input v-model="paymentForm.expiryDate" type="text" class="form-control form-control-lg" 
                      :class="{ 'is-invalid': errors.expiryDate }" placeholder="MM/AA" maxlength="5" @input="formatExpiryDate" required />
                    <div v-if="errors.expiryDate" class="invalid-feedback">{{ errors.expiryDate }}</div>
                    <small class="text-muted">💳 Prueba: <code class="bg-light px-2 py-1 rounded">12/25</code></small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">CVV *</label>
                    <input v-model="paymentForm.cvv" type="text" class="form-control form-control-lg" 
                      :class="{ 'is-invalid': errors.cvv }" placeholder="123" maxlength="4" @input="validateCVV" required />
                    <div v-if="errors.cvv" class="invalid-feedback">{{ errors.cvv }}</div>
                    <small class="text-muted">💳 Prueba: <code class="bg-light px-2 py-1 rounded">123</code></small>
                  </div>
                </div>
                <div v-if="isPaymentValid" class="alert alert-success mt-3 mb-0">
                  <i class="fa-solid fa-check-circle me-2"></i>
                  Información de pago válida
                </div>
              </div>
            </section>

            <!-- Botones -->
            <div class="d-flex justify-content-between mt-4">
              <router-link to="/shop" class="btn btn-link text-decoration-none">
                <i class="fa-solid fa-chevron-left me-2"></i>Volver a la tienda
              </router-link>
              <button @click="proceedToPayment" class="btn btn-dark btn-lg px-5" :disabled="!canProceedToPayment">
                <span v-if="isProcessing">
                  <i class="fa-solid fa-spinner fa-spin me-2"></i>Procesando...
                </span>
                <span v-else>
                  Completar Pedido<i class="fa-solid fa-chevron-right ms-2"></i>
                </span>
              </button>
            </div>
          </div>

          <!-- Columna Derecha: Resumen -->
          <div class="col-lg-5">
            <div class="order-summary">
              <h5 class="mb-4">Resumen del pedido</h5>
              <div class="cart-items-summary">
                <div v-for="item in cartStore.items" :key="item.id" class="cart-item-summary">
                  <div class="item-image-wrapper">
                    <img :src="item.image_url || 'https://dummyimage.com/80x80/dee2e6/6c757d.jpg'" :alt="item.name" />
                    <span class="item-quantity-badge">{{ item.quantity }}</span>
                  </div>
                  <div class="item-details">
                    <h6>{{ item.name }}</h6>
                    <p class="text-muted small mb-0">
                      <span v-if="item.size">{{ item.size }}</span>
                      <span v-if="item.color"> • {{ item.color }}</span>
                    </p>
                  </div>
                  <div class="item-price">S/. {{ (item.price * item.quantity).toFixed(2) }}</div>
                </div>
              </div>
              <hr class="my-4" />
              <div class="summary-totals">
                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span class="fw-bold">S/. {{ cartStore.subtotal.toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Envío</span>
                  <span :class="shippingCost > 0 ? 'fw-bold' : 'text-muted'">{{ shippingCostDisplay }}</span>
                </div>
                <hr class="my-3" />
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Total</h5>
                  <h4 class="mb-0 fw-bold">S/. {{ finalTotal.toFixed(2) }}</h4>
                </div>
                <div v-if="isInternational && selectedShippingOption" class="alert alert-warning mt-3 mb-0 small">
                  <i class="fa-solid fa-info-circle me-1"></i>
                  Envío internacional: ${{ selectedShippingOption.cost }} USD (≈ S/. {{ (selectedShippingOption.cost * 3.75).toFixed(2) }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de éxito -->
    <Transition name="fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
        <div class="modal-success" @click.stop>
          <div class="text-center">
            <i class="fa-solid fa-circle-check text-success" style="font-size: 4rem;"></i>
            <h3 class="mt-4 mb-3">¡Compra exitosa!</h3>
            <p class="text-muted mb-4">
              Tu pedido ha sido procesado correctamente.<br>
              Recibirás un correo con los detalles de tu compra.
            </p>
            <button @click="closeSuccessModal" class="btn btn-primary btn-lg px-5">Volver a la tienda</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { useCheckoutForm } from '@/composables/useCheckoutForm'
import { useCheckoutValidation } from '@/composables/useCheckoutValidation'
import { useCheckoutPayment } from '@/composables/useCheckoutPayment'
import { formatShippingCost as formatCost } from '@/utils/shipping'
import '@/assets/Styles/checkout.css'

const cartStore = useCartStore()
const { isAuthenticated, user } = useAuth()

// Formulario principal
const {
  checkoutForm,
  errors,
  selectedShippingOption,
  availableCountries,
  availableProvinces,
  isInternational,
  availableShippingOptions,
  provinceLabel,
  districtLabel,
  districtPlaceholder,
  isFormValid,
  onCountryChange,
  onProvinceChange,
  selectShippingOption
} = useCheckoutForm()

// Validaciones
const {
  availableDocumentTypes,
  selectedDocumentLabel,
  selectedDocumentPlaceholder,
  selectedDocumentMaxLength,
  selectedDocumentHint,
  postalMaxLength,
  postalPlaceholder,
  phoneMaxLength,
  phonePlaceholder,
  phoneHint,
  validateName,
  onDocumentTypeChange,
  validateDocumentId,
  validatePostalCode,
  validatePhone
} = useCheckoutValidation(checkoutForm, errors, isInternational)

// Formulario de pago
const paymentForm = ref({
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: ''
})

// Costos
const shippingCost = computed(() => {
  if (!selectedShippingOption.value) return 0
  return selectedShippingOption.value.currency === 'USD' 
    ? selectedShippingOption.value.cost * 3.75 
    : selectedShippingOption.value.cost
})

const shippingCostDisplay = computed(() =>
  !selectedShippingOption.value 
    ? 'Seleccionar método de envío' 
    : formatCost(selectedShippingOption.value.cost, selectedShippingOption.value.currency)
)

const finalTotal = computed(() => cartStore.subtotal + shippingCost.value)

// Pago (SIN hasErrors - se calcula internamente)
const {
  isProcessing,
  showSuccessModal,
  isPaymentValid,
  canProceedToPayment,
  formatCardNumber,
  validateCardName,
  formatExpiryDate,
  validateCVV,
  proceedToPayment,
  closeSuccessModal,
  goToSignIn
} = useCheckoutPayment(
  paymentForm,
  errors,
  checkoutForm,
  selectedShippingOption,
  shippingCost,
  finalTotal,
  isFormValid
  // ✅ hasErrors removido - se calcula dentro del composable
)

// Auto-seleccionar primer método de envío disponible
watch(availableShippingOptions, (newOptions) => {
  if (newOptions.length > 0 && !selectedShippingOption.value) {
    const firstAvailable = newOptions.find(opt => opt.available)
    if (firstAvailable) selectedShippingOption.value = firstAvailable
  }
})

// Pre-llenar email si está logueado
onMounted(() => {
  if (user.value?.email) checkoutForm.value.email = user.value.email
})
</script>