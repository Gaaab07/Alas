<template>
  <div class="checkout-container">
    <div class="container py-5">
      <!-- Alerta si el carrito está vacío -->
      <div v-if="cartStore.items.length === 0" class="alert alert-warning text-center" role="alert">
        <i class="fa-solid fa-shopping-cart fa-3x mb-3"></i>
        <h4 class="alert-heading">Tu carrito está vacío</h4>
        <p>No tienes productos en tu carrito. Agrega algunos productos antes de realizar una compra.</p>
        <hr>
        <router-link to="/shop" class="btn btn-primary">
          <i class="fa-solid fa-store me-2"></i>
          Ir a la tienda
        </router-link>
      </div>

      <!-- Formulario de checkout -->
      <div v-else>
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
                  placeholder="Email"
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

            <!-- Dirección de envío -->
            <section class="mb-5">
              <h4 class="mb-3">Dirección de envío</h4>
              
              <div class="row g-3">
                <!-- País/Región -->
                <div class="col-12">
                  <label class="form-label fw-bold">País / Región *</label>
                  <select 
                    v-model="checkoutForm.country"
                    class="form-select form-select-lg"
                    @change="onCountryChange"
                    required
                  >
                    <option value="">Seleccionar país...</option>
                    <option 
                      v-for="country in availableCountries" 
                      :key="country.code"
                      :value="country.code"
                    >
                      {{ country.name }}
                    </option>
                  </select>
                </div>

                <!-- Nombre y Apellido -->
                <div class="col-md-6">
                  <label class="form-label">Nombre *</label>
                  <input 
                    v-model="checkoutForm.firstName"
                    type="text" 
                    class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.firstName }"
                    placeholder="Nombre"
                    @input="validateName('firstName')"
                    required
                  />
                  <div v-if="errors.firstName" class="invalid-feedback">
                    {{ errors.firstName }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellidos *</label>
                  <input 
                    v-model="checkoutForm.lastName"
                    type="text" 
                    class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.lastName }"
                    placeholder="Apellidos"
                    @input="validateName('lastName')"
                    required
                  />
                  <div v-if="errors.lastName" class="invalid-feedback">
                    {{ errors.lastName }}
                  </div>
                </div>

                <!-- DNI/Documento -->
                <div class="col-12">
                  <label class="form-label">{{ documentLabel }} *</label>
                  <input 
                    v-model="checkoutForm.documentId"
                    type="text" 
                    class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.documentId }"
                    :placeholder="documentPlaceholder"
                    :maxlength="documentMaxLength"
                    @input="validateDocumentId"
                    required
                  />
                  <div v-if="errors.documentId" class="invalid-feedback">
                    {{ errors.documentId }}
                  </div>
                  <small class="text-muted">{{ documentHint }}</small>
                </div>

                <!-- Dirección -->
                <div class="col-12">
                  <label class="form-label">Dirección *</label>
                  <input 
                    v-model="checkoutForm.address"
                    type="text" 
                    class="form-control form-control-lg" 
                    placeholder="Calle, número, etc."
                    required
                  />
                </div>

                <!-- Apartamento (opcional) -->
                <div class="col-12">
                  <label class="form-label">Apartamento, departamento, etc. (opcional)</label>
                  <input 
                    v-model="checkoutForm.apartment"
                    type="text" 
                    class="form-control form-control-lg" 
                    placeholder="Apto, Dpto, Piso, etc."
                  />
                </div>

                <!-- Provincia/Estado y Distrito/Ciudad -->
                <div class="col-md-6">
                  <label class="form-label">{{ provinceLabel }} *</label>
                  <select 
                    v-model="checkoutForm.province"
                    class="form-select form-select-lg"
                    @change="onProvinceChange"
                    :disabled="!checkoutForm.country"
                    required
                  >
                    <option value="">Seleccionar {{ provinceLabel.toLowerCase() }}...</option>
                    <option 
                      v-for="province in availableProvinces" 
                      :key="province.name"
                      :value="province.name"
                    >
                      {{ province.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">{{ districtLabel }}</label>
                  <input 
                    v-model="checkoutForm.district"
                    type="text" 
                    class="form-control form-control-lg" 
                    :placeholder="districtPlaceholder"
                    :required="checkoutForm.country === 'PE'"
                  />
                </div>

                <!-- Código postal -->
                <div class="col-md-6">
                  <label class="form-label">Código postal {{ isInternational ? '*' : '' }}</label>
                  <input 
                    v-model="checkoutForm.postalCode"
                    type="text" 
                    class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.postalCode }"
                    placeholder="Código postal"
                    @input="validatePostalCode"
                    :required="isInternational"
                  />
                  <div v-if="errors.postalCode" class="invalid-feedback">
                    {{ errors.postalCode }}
                  </div>
                </div>

                <!-- Teléfono -->
                <div class="col-md-6">
                  <label class="form-label">Teléfono *</label>
                  <input 
                    v-model="checkoutForm.phone"
                    type="tel" 
                    class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.phone }"
                    :placeholder="phonePlaceholder"
                    :maxlength="phoneMaxLength"
                    @input="validatePhone"
                    required
                  />
                  <div v-if="errors.phone" class="invalid-feedback">
                    {{ errors.phone }}
                  </div>
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
                <div 
                  v-for="option in availableShippingOptions"
                  :key="option.id"
                  class="shipping-option-card"
                  :class="{ 
                    'active': selectedShippingOption?.id === option.id,
                    'disabled': !option.available 
                  }"
                  @click="option.available && selectShippingOption(option)"
                >
                  <div class="shipping-option-header">
                    <input 
                      type="radio" 
                      :name="'shipping-' + option.id" 
                      :value="option.id"
                      :checked="selectedShippingOption?.id === option.id"
                      :disabled="!option.available"
                      @click.stop
                    />
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
                  
                  <!-- Condiciones -->
                  <div v-if="option.conditions && option.conditions.length > 0" class="shipping-option-conditions">
                    <ul class="mb-0">
                      <li v-for="(condition, idx) in option.conditions" :key="idx">
                        {{ condition }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <!-- Método de Pago (Simulado) -->
            <section class="mb-5">
              <h4 class="mb-3">Método de Pago</h4>
              
              <div class="alert alert-info mb-3">
                <i class="fa-solid fa-info-circle me-2"></i>
                <strong>Modo Demo:</strong> Esta es una simulación. Usa los datos de prueba proporcionados.
              </div>

              <div class="payment-card-form">
                <div class="row g-3">
                  <!-- Número de tarjeta -->
                  <div class="col-12">
                    <label class="form-label">Número de tarjeta *</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text">
                        <i class="fa-solid fa-credit-card"></i>
                      </span>
                      <input 
                        v-model="paymentForm.cardNumber"
                        type="text" 
                        class="form-control" 
                        :class="{ 'is-invalid': errors.cardNumber }"
                        placeholder="1234 5678 9012 3456"
                        maxlength="19"
                        @input="formatCardNumber"
                        required
                      />
                      <div v-if="errors.cardNumber" class="invalid-feedback">
                        {{ errors.cardNumber }}
                      </div>
                    </div>
                    <small class="text-muted">
                      💳 Prueba: <code class="bg-light px-2 py-1 rounded">4532 1488 0343 6467</code>
                    </small>
                  </div>

                  <!-- Nombre en la tarjeta -->
                  <div class="col-12">
                    <label class="form-label">Nombre en la tarjeta *</label>
                    <input 
                      v-model="paymentForm.cardName"
                      type="text" 
                      class="form-control form-control-lg" 
                      :class="{ 'is-invalid': errors.cardName }"
                      placeholder="JUAN PEREZ"
                      @input="validateCardName"
                      required
                    />
                    <div v-if="errors.cardName" class="invalid-feedback">
                      {{ errors.cardName }}
                    </div>
                  </div>

                  <!-- Fecha de expiración y CVV -->
                  <div class="col-md-6">
                    <label class="form-label">Fecha de expiración *</label>
                    <input 
                      v-model="paymentForm.expiryDate"
                      type="text" 
                      class="form-control form-control-lg" 
                      :class="{ 'is-invalid': errors.expiryDate }"
                      placeholder="MM/AA"
                      maxlength="5"
                      @input="formatExpiryDate"
                      required
                    />
                    <div v-if="errors.expiryDate" class="invalid-feedback">
                      {{ errors.expiryDate }}
                    </div>
                    <small class="text-muted">💳 Prueba: <code class="bg-light px-2 py-1 rounded">12/25</code></small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">CVV *</label>
                    <input 
                      v-model="paymentForm.cvv"
                      type="text" 
                      class="form-control form-control-lg" 
                      :class="{ 'is-invalid': errors.cvv }"
                      placeholder="123"
                      maxlength="4"
                      @input="validateCVV"
                      required
                    />
                    <div v-if="errors.cvv" class="invalid-feedback">
                      {{ errors.cvv }}
                    </div>
                    <small class="text-muted">💳 Prueba: <code class="bg-light px-2 py-1 rounded">123</code></small>
                  </div>
                </div>

                <!-- Indicador visual de tarjeta válida -->
                <div v-if="isPaymentValid" class="alert alert-success mt-3 mb-0">
                  <i class="fa-solid fa-check-circle me-2"></i>
                  Información de pago válida
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
                :disabled="!canProceedToPayment"
              >
                <span v-if="isProcessing">
                  <i class="fa-solid fa-spinner fa-spin me-2"></i>
                  Procesando...
                </span>
                <span v-else>
                  Completar Pedido
                  <i class="fa-solid fa-chevron-right ms-2"></i>
                </span>
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
                      <span v-if="item.size">{{ item.size }}</span>
                      <span v-if="item.color"> • {{ item.color }}</span>
                    </p>
                  </div>
                  <div class="item-price">
                    S/. {{ (item.price * item.quantity).toFixed(2) }}
                  </div>
                </div>
              </div>

              <hr class="my-4" />

              <!-- Subtotal, envío y total -->
              <div class="summary-totals">
                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span class="fw-bold">S/. {{ cartStore.subtotal.toFixed(2) }}</span>
                </div>
                
                <div class="d-flex justify-content-between mb-2">
                  <span>Envío</span>
                  <span :class="shippingCost > 0 ? 'fw-bold' : 'text-muted'">
                    {{ shippingCostDisplay }}
                  </span>
                </div>

                <hr class="my-3" />

                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Total</h5>
                  <h4 class="mb-0 fw-bold">S/. {{ finalTotal.toFixed(2) }}</h4>
                </div>

                <!-- Nota de conversión para envíos internacionales -->
                <div v-if="isInternational && selectedShippingOption" class="alert alert-warning mt-3 mb-0 small">
                  <i class="fa-solid fa-info-circle me-1"></i>
                  Envío internacional: ${{ selectedShippingOption.cost }} USD
                  (≈ S/. {{ (selectedShippingOption.cost * 3.75).toFixed(2) }})
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
            <button 
              @click="closeSuccessModal" 
              class="btn btn-primary btn-lg px-5"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import { 
  COUNTRIES, 
  PROVINCES, 
  getShippingOptions,
  formatShippingCost as formatCost
} from '@/utils/shipping'
import type { ShippingOption } from '@/types/shipping'
import '@/assets/styles/checkout.css'

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated, user } = useAuth()

const isProcessing = ref(false)
const showSuccessModal = ref(false)
const selectedShippingOption = ref<ShippingOption | null>(null)

const checkoutForm = ref({
  email: '',
  newsletter: false,
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

const paymentForm = ref({
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: ''
})

const errors = ref({
  firstName: '',
  lastName: '',
  documentId: '',
  postalCode: '',
  phone: '',
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: ''
})

// Computed properties
const availableCountries = computed(() => COUNTRIES)

const availableProvinces = computed(() => {
  return PROVINCES[checkoutForm.value.country] || []
})

const isInternational = computed(() => checkoutForm.value.country !== 'PE')

const availableShippingOptions = computed(() => {
  if (!checkoutForm.value.country || !checkoutForm.value.province) {
    return []
  }
  return getShippingOptions(
    checkoutForm.value.country,
    checkoutForm.value.province,
    checkoutForm.value.district
  )
})

const shippingCost = computed(() => {
  if (!selectedShippingOption.value) return 0
  if (selectedShippingOption.value.currency === 'USD') {
    return selectedShippingOption.value.cost * 3.75 // Conversión USD a PEN
  }
  return selectedShippingOption.value.cost
})

const shippingCostDisplay = computed(() => {
  if (!selectedShippingOption.value) {
    return 'Seleccionar método de envío'
  }
  return formatCost(selectedShippingOption.value.cost, selectedShippingOption.value.currency)
})

const finalTotal = computed(() => {
  return cartStore.subtotal + shippingCost.value
})

// Labels dinámicos según el país
const documentLabel = computed(() => {
  return checkoutForm.value.country === 'PE' ? 'DNI' : 'Documento de Identidad'
})

const documentPlaceholder = computed(() => {
  return checkoutForm.value.country === 'PE' ? 'DNI (8 dígitos)' : 'Número de documento'
})

const documentHint = computed(() => {
  return checkoutForm.value.country === 'PE' ? 'Ingrese su DNI de 8 dígitos' : 'Ingrese su documento de identidad'
})

const documentMaxLength = computed(() => {
  return checkoutForm.value.country === 'PE' ? 8 : 20
})

const provinceLabel = computed(() => {
  return checkoutForm.value.country === 'PE' ? 'Provincia' : 'Estado/Provincia'
})

const districtLabel = computed(() => {
  const labels: Record<string, string> = {
    PE: 'Distrito *',
    AR: 'Ciudad',
    CL: 'Comuna',
    CO: 'Ciudad',
    MX: 'Municipio',
    US: 'City'
  }
  return labels[checkoutForm.value.country] || 'Ciudad'
})

const districtPlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    PE: 'Ej: Miraflores',
    AR: 'Ej: Palermo',
    CL: 'Ej: Providencia',
    CO: 'Ej: Chapinero',
    MX: 'Ej: Polanco',
    US: 'Ex: Manhattan'
  }
  return placeholders[checkoutForm.value.country] || 'Ciudad'
})

const phonePlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    PE: 'Teléfono (9 dígitos)',
    AR: 'Teléfono (10 dígitos)',
    CL: 'Teléfono (9 dígitos)',
    CO: 'Teléfono (10 dígitos)',
    MX: 'Teléfono (10 dígitos)',
    US: 'Phone (10 digits)'
  }
  return placeholders[checkoutForm.value.country] || 'Teléfono'
})

const phoneHint = computed(() => {
  const hints: Record<string, string> = {
    PE: 'Ingrese su número de 9 dígitos',
    AR: 'Ingrese su número de 10 dígitos',
    CL: 'Ingrese su número de 9 dígitos',
    CO: 'Ingrese su número de 10 dígitos',
    MX: 'Ingrese su número de 10 dígitos',
    US: 'Enter your 10-digit phone number'
  }
  return hints[checkoutForm.value.country] || ''
})

const phoneMaxLength = computed(() => {
  const lengths: Record<string, number> = {
    PE: 9,
    AR: 10,
    CL: 9,
    CO: 10,
    MX: 10,
    US: 10
  }
  return lengths[checkoutForm.value.country] || 15
})

const canProceedToPayment = computed(() => {
  return (
    cartStore.items.length > 0 &&
    isFormValid.value &&
    !hasErrors.value &&
    !isProcessing.value &&
    selectedShippingOption.value !== null &&
    isPaymentValid.value
  )
})

const hasErrors = computed(() => {
  return Object.values(errors.value).some(error => error !== '')
})

const isPaymentValid = computed(() => {
  return (
    paymentForm.value.cardNumber.replace(/\s/g, '').length === 16 &&
    paymentForm.value.cardName.trim().length >= 3 &&
    paymentForm.value.expiryDate.length === 5 &&
    paymentForm.value.cvv.length >= 3 &&
    !errors.value.cardNumber &&
    !errors.value.cardName &&
    !errors.value.expiryDate &&
    !errors.value.cvv
  )
})

const isFormValid = computed(() => {
  const basicValid = (
    checkoutForm.value.email &&
    checkoutForm.value.firstName &&
    checkoutForm.value.lastName &&
    checkoutForm.value.documentId &&
    checkoutForm.value.address &&
    checkoutForm.value.province &&
    checkoutForm.value.phone &&
    checkoutForm.value.country
  )

  // Para Perú, distrito es obligatorio
  if (checkoutForm.value.country === 'PE') {
    return basicValid && checkoutForm.value.district
  }

  // Para internacionales, código postal es obligatorio
  if (isInternational.value) {
    return basicValid && checkoutForm.value.postalCode
  }

  return basicValid
})

// Methods
const validateName = (field: 'firstName' | 'lastName') => {
  const value = checkoutForm.value[field]
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  
  if (!nameRegex.test(value)) {
    checkoutForm.value[field] = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    errors.value[field] = 'Solo se permiten letras y espacios'
  } else {
    errors.value[field] = ''
  }
}

const validateDocumentId = () => {
  const value = checkoutForm.value.documentId
  const numbersOnly = value.replace(/\D/g, '')
  checkoutForm.value.documentId = numbersOnly
  
  if (checkoutForm.value.country === 'PE') {
    if (numbersOnly.length > 0 && numbersOnly.length < 8) {
      errors.value.documentId = 'El DNI debe tener 8 dígitos'
    } else {
      errors.value.documentId = ''
    }
  } else {
    errors.value.documentId = ''
  }
}

const validatePostalCode = () => {
  const value = checkoutForm.value.postalCode
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '')
  checkoutForm.value.postalCode = cleaned
  errors.value.postalCode = ''
}

const validatePhone = () => {
  const value = checkoutForm.value.phone
  const numbersOnly = value.replace(/\D/g, '')
  checkoutForm.value.phone = numbersOnly
  
  const maxLength = phoneMaxLength.value
  if (numbersOnly.length > 0 && numbersOnly.length < maxLength) {
    errors.value.phone = `El teléfono debe tener ${maxLength} dígitos`
  } else {
    errors.value.phone = ''
  }
}

// Validaciones de pago
const formatCardNumber = () => {
  let value = paymentForm.value.cardNumber.replace(/\s/g, '').replace(/\D/g, '')
  
  // Limitar a 16 dígitos
  value = value.substring(0, 16)
  
  // Formatear con espacios cada 4 dígitos
  const formatted = value.match(/.{1,4}/g)?.join(' ') || value
  paymentForm.value.cardNumber = formatted
  
  // Validar longitud
  if (value.length > 0 && value.length < 16) {
    errors.value.cardNumber = 'El número de tarjeta debe tener 16 dígitos'
  } else if (value.length === 16) {
    // Validación simple de Luhn (opcional)
    errors.value.cardNumber = ''
  } else {
    errors.value.cardNumber = ''
  }
}

const validateCardName = () => {
  const value = paymentForm.value.cardName
  // Solo letras y espacios
  const cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase()
  paymentForm.value.cardName = cleaned
  
  if (cleaned.length > 0 && cleaned.length < 3) {
    errors.value.cardName = 'El nombre debe tener al menos 3 caracteres'
  } else {
    errors.value.cardName = ''
  }
}

const formatExpiryDate = () => {
  let value = paymentForm.value.expiryDate.replace(/\D/g, '')
  
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  
  paymentForm.value.expiryDate = value
  
  if (value.length === 5) {
    const month = value.split('/')[0]
    const monthNum = parseInt(month)
    
    if (monthNum < 1 || monthNum > 12) {
      errors.value.expiryDate = 'Mes inválido (01-12)'
    } else {
      errors.value.expiryDate = ''
    }
  } else if (value.length > 0) {
    errors.value.expiryDate = 'Formato: MM/AA'
  } else {
    errors.value.expiryDate = ''
  }
}

const validateCVV = () => {
  const value = paymentForm.value.cvv.replace(/\D/g, '')
  paymentForm.value.cvv = value.substring(0, 4)
  
  if (value.length > 0 && value.length < 3) {
    errors.value.cvv = 'El CVV debe tener 3 o 4 dígitos'
  } else {
    errors.value.cvv = ''
  }
}

const onCountryChange = () => {
  checkoutForm.value.province = ''
  checkoutForm.value.district = ''
  checkoutForm.value.postalCode = ''
  checkoutForm.value.documentId = ''
  checkoutForm.value.phone = ''
  selectedShippingOption.value = null
  errors.value.documentId = ''
  errors.value.phone = ''
}

const onProvinceChange = () => {
  checkoutForm.value.district = ''
  selectedShippingOption.value = null
}

const selectShippingOption = (option: ShippingOption) => {
  selectedShippingOption.value = option
}

const goToSignIn = () => {
  router.push('/signin')
}

const updateStock = async () => {
  const updates = []
  
  for (const item of cartStore.items) {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.id)
      .single()

    if (fetchError) {
      throw new Error(`Error al obtener producto ${item.name}`)
    }

    const newStock = product.stock - item.quantity

    if (newStock < 0) {
      throw new Error(`Stock insuficiente para ${item.name}`)
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.id)

    if (updateError) {
      throw new Error(`Error al actualizar stock de ${item.name}`)
    }

    updates.push({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      previousStock: product.stock,
      newStock: newStock
    })
  }

  return updates
}

interface OrderData {
  id: string
  created_at: string
  total: number
  user_email: string
  user_id: string
  status: string
  delivery_method: string
  shipping_address: Record<string, unknown>
}

const sendOrderConfirmationEmail = async (orderData: OrderData) => {
  // ✅ AGREGAR ESTA VALIDACIÓN AL INICIO
  if (!selectedShippingOption.value) {
    console.error('❌ No hay método de envío seleccionado')
    return false
  }

  try {
    console.log('📧 Enviando email de confirmación...')
     
    const { data, error } = await supabase.functions.invoke('send-order-email-gmail', {
      body: {
        order: {
          id: orderData.id,
          user_id: user.value?.id || '',
          user_email: checkoutForm.value.email,
          total: finalTotal.value,
          status: 'completed',
          delivery_method: selectedShippingOption.value.id, // ✅ Ahora TypeScript sabe que no es null
          shipping_address: {
            firstName: checkoutForm.value.firstName,
            lastName: checkoutForm.value.lastName,
            documentId: checkoutForm.value.documentId,
            email: checkoutForm.value.email,
            phone: checkoutForm.value.phone,
            country: checkoutForm.value.country,
            address: checkoutForm.value.address,
            apartment: checkoutForm.value.apartment,
            district: checkoutForm.value.district,
            province: checkoutForm.value.province,
            postalCode: checkoutForm.value.postalCode,
            shippingMethod: selectedShippingOption.value.label,
            deliveryTime: selectedShippingOption.value.deliveryTime,
            shippingCost: shippingCost.value  // Usa el computed que ya calcula la conversión USD->PEN
          },
          created_at: orderData.created_at
        },
        items: cartStore.items.map(item => ({
          id: crypto.randomUUID(),
          order_id: orderData.id,
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          product_size: item.size,        // ✅ CAMBIO AQUÍ
          product_color: item.color,      // ✅ CAMBIO AQUÍ
          product_image_url: item.image_url,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }))
      }
    })

    if (error) {
      console.error('❌ Error enviando email:', error)
      return false
    }

    console.log('✅ Email enviado exitosamente:', data)
    return true
  } catch (error) {
    console.error('❌ Error en sendOrderConfirmationEmail:', error)
    return false
  }
}

const proceedToPayment = async () => {
  if (cartStore.items.length === 0) {
    alert('Tu carrito está vacío. Agrega productos antes de continuar.')
    return
  }

  if (!isAuthenticated.value || !user.value) {
    alert('Debes iniciar sesión para completar tu compra')
    router.push('/signin')
    return
  }

  if (!selectedShippingOption.value) {
    alert('Por favor selecciona un método de envío')
    return
  }

  if (!canProceedToPayment.value) return

  try {
    isProcessing.value = true

    // 1. Actualizar stock
    const stockUpdates = await updateStock()

    // 2. Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.value.id,
        user_email: user.value.email || checkoutForm.value.email,
        total: finalTotal.value,
        status: 'completed',
        delivery_method: selectedShippingOption.value.id,
        shipping_address: {
          firstName: checkoutForm.value.firstName,
          lastName: checkoutForm.value.lastName,
          documentId: checkoutForm.value.documentId,
          email: checkoutForm.value.email,
          phone: checkoutForm.value.phone,
          country: checkoutForm.value.country,
          address: checkoutForm.value.address,
          apartment: checkoutForm.value.apartment,
          district: checkoutForm.value.district,
          province: checkoutForm.value.province,
          postalCode: checkoutForm.value.postalCode,
          shippingMethod: selectedShippingOption.value.label,
          shippingCost: shippingCost.value,
          deliveryTime: selectedShippingOption.value.deliveryTime
        }
      })
      .select()
      .single()

    if (orderError) {
      throw new Error('Error al crear la orden: ' + orderError.message)
    }

    // 3. Crear los items
    const orderItems = cartStore.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      product_size: item.size,
      product_color: item.color,
      product_image_url: item.image_url,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      throw new Error('Error al guardar los productos: ' + itemsError.message)
    }

    console.log('✅ Orden creada:', order.id)
    console.log('📦 Stock actualizado:', stockUpdates)
// 🟢 ENVIAR EMAIL
    await sendOrderConfirmationEmail(order)
    cartStore.clearCart()
    showSuccessModal.value = true

  } catch (error) {
    console.error('❌ Error:', error)
    alert(error instanceof Error ? error.message : 'Error al procesar la compra')
  } finally {
    isProcessing.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/shop')
}

// Watch para auto-seleccionar el primer método de envío disponible
watch(availableShippingOptions, (newOptions) => {
  if (newOptions.length > 0 && !selectedShippingOption.value) {
    const firstAvailable = newOptions.find(opt => opt.available)
    if (firstAvailable) {
      selectedShippingOption.value = firstAvailable
    }
  }
})

onMounted(() => {
  if (cartStore.items.length === 0) {
    console.warn('⚠️ El carrito está vacío')
  }
  
  // Pre-llenar email si el usuario está autenticado
  if (user.value?.email) {
    checkoutForm.value.email = user.value.email
  }
})
</script>