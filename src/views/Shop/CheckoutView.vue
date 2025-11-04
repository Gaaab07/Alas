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
                <div class="d-flex gap-2">
                  <!-- Botón para usar información del perfil -->
                  <button 
                    v-if="isAuthenticated && hasProfileData" 
                    @click="useProfileData"
                    class="btn btn-sm btn-outline-success"
                    title="Auto-completar con tu información guardada"
                  >
                    <i class="fa-solid fa-user-check me-1"></i>
                    Usar mi información
                  </button>
                  <button v-if="!isAuthenticated" @click="goToSignIn" class="btn btn-link text-decoration-underline p-0">
                    Iniciar sesión
                  </button>
                </div>
              </div>

              <!-- Alerta si tiene información guardada -->
              <div v-if="isAuthenticated && hasProfileData" class="alert alert-success mb-3">
                <i class="fa-solid fa-sparkles me-2"></i>
                Tienes información guardada en tu perfil. 
                <a href="#" @click.prevent="useProfileData" class="alert-link">Click aquí para auto-completar todos los campos</a>
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
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Dirección de envío</h4>
                <!-- Botón para usar direcciones guardadas -->
                <button 
                  v-if="isAuthenticated && savedAddresses.length > 0" 
                  @click="showSavedAddressesModal = true"
                  class="btn btn-sm btn-outline-primary"
                >
                  <i class="fa-solid fa-address-book me-1"></i>
                  Usar dirección guardada
                </button>
              </div>

              <!-- Alerta si hay direcciones guardadas -->
              <div v-if="isAuthenticated && savedAddresses.length > 0" class="alert alert-info mb-3">
                <i class="fa-solid fa-info-circle me-2"></i>
                Tienes <strong>{{ savedAddresses.length }}</strong> dirección(es) guardada(s). 
                <a href="#" @click.prevent="showSavedAddressesModal = true" class="alert-link">Usar una de ellas</a>
              </div>

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
                    :class="{ 'is-invalid': errors.firstName }" placeholder="Nombre" 
                    @input="validateName('firstName')" @keypress="preventNumbers" required />
                  <div v-if="errors.firstName" class="invalid-feedback">{{ errors.firstName }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellidos *</label>
                  <input v-model="checkoutForm.lastName" type="text" class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.lastName }" placeholder="Apellidos" 
                    @input="validateName('lastName')" @keypress="preventNumbers" required />
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
                  <label class="form-label">Referencia (opcional)</label>
                  <input v-model="checkoutForm.apartment" type="text" class="form-control form-control-lg" 
                    placeholder="Frente al parque, cerca de..." @keypress="preventNumbers" />
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
                    :placeholder="districtPlaceholder" @keypress="preventNumbers" :required="checkoutForm.country === 'PE'" />
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
                    :maxlength="phoneMaxLength" @input="validatePhone" @keypress="preventLetters" required />
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
                      :class="{ 'is-invalid': errors.cardName }" placeholder="JUAN PEREZ" 
                      @input="validateCardName" @keypress="preventNumbers" required />
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

    <!-- Modal de direcciones guardadas -->
    <div v-if="showSavedAddressesModal" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-address-book me-2"></i>
              Selecciona una dirección
            </h5>
            <button type="button" class="btn-close" @click="showSavedAddressesModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingSavedAddresses" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2 text-muted">Cargando direcciones...</p>
            </div>
            <div v-else class="row g-3">
              <div v-for="address in savedAddresses" :key="address.id" class="col-md-6">
                <div 
                  class="saved-address-card" 
                  :class="{ 'selected': selectedSavedAddress?.id === address.id }"
                  @click="selectSavedAddress(address)"
                >
                  <div class="d-flex justify-content-between mb-2">
                    <span class="badge bg-primary">{{ address.label }}</span>
                    <i v-if="selectedSavedAddress?.id === address.id" class="fa-solid fa-check-circle text-success"></i>
                  </div>
                  <div>
                    <strong>{{ address.full_name }}</strong><br>
                    <small class="text-muted">
                      {{ address.address }}<br>
                      {{ address.district }}, {{ address.province }}<br>
                      Tel: {{ address.phone }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showSavedAddressesModal = false">Cancelar</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="applySavedAddress"
              :disabled="!selectedSavedAddress"
            >
              <i class="fa-solid fa-check me-2"></i>Usar esta dirección
            </button>
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
import { supabase } from '@/supabase'
import '@/assets/Styles/checkout.css'

// Interfaces
interface SavedAddress {
  id: string
  label: string
  full_name: string
  address: string
  district: string
  province: string
  phone: string
  postal_code?: string
  country?: string
}

const cartStore = useCartStore()
const { isAuthenticated, user, profile } = useAuth()

// Direcciones guardadas
const savedAddresses = ref<SavedAddress[]>([])
const loadingSavedAddresses = ref(false)
const showSavedAddressesModal = ref(false)
const selectedSavedAddress = ref<SavedAddress | null>(null)

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

// Funciones de prevención de caracteres
const preventNumbers = (event: KeyboardEvent) => {
  if (/[0-9]/.test(event.key)) {
    event.preventDefault()
  }
}

const preventLetters = (event: KeyboardEvent) => {
  if (!/[0-9+\-() ]/.test(event.key)) {
    event.preventDefault()
  }
}

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

// Pago
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
)

// Computed - Verificar si tiene datos en el perfil
const hasProfileData = computed(() => {
  if (!profile.value) return false
  return !!(
    profile.value.phone || 
    profile.value.document_type || 
    profile.value.country
  )
})

// Usar información del perfil
const useProfileData = () => {
  if (!profile.value) return
  
  // Llenar nombre completo
  if (profile.value.full_name) {
    const nameParts = profile.value.full_name.split(' ')
    checkoutForm.value.firstName = nameParts[0] || ''
    checkoutForm.value.lastName = nameParts.slice(1).join(' ') || ''
  }
  
  // Llenar teléfono
  if (profile.value.phone) {
    checkoutForm.value.phone = profile.value.phone
  }
  
  // Llenar tipo y número de documento
  if (profile.value.document_type) {
    checkoutForm.value.documentType = profile.value.document_type
    // Trigger validation después de cambiar el tipo
    setTimeout(() => {
      if (profile.value?.document_number) {
        checkoutForm.value.documentId = profile.value.document_number
      }
    }, 100)
  }
  
  // Llenar país
  if (profile.value.country) {
    checkoutForm.value.country = profile.value.country
    // Esperar a que se actualicen las provincias
    setTimeout(() => {
      onCountryChange()
    }, 50)
  }
}

// Cargar direcciones guardadas
const loadSavedAddresses = async () => {
  if (!user.value) return
  loadingSavedAddresses.value = true
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    savedAddresses.value = data || []
  } catch (error) {
    console.error('Error loading saved addresses:', error)
  } finally {
    loadingSavedAddresses.value = false
  }
}

// Seleccionar dirección guardada
const selectSavedAddress = (address: SavedAddress) => {
  selectedSavedAddress.value = address
}

// Aplicar dirección guardada al formulario
const applySavedAddress = () => {
  if (!selectedSavedAddress.value) return
  
  const address = selectedSavedAddress.value
  const nameParts = address.full_name.split(' ')
  
  // Separar nombre y apellidos (primer palabra = nombre, resto = apellidos)
  checkoutForm.value.firstName = nameParts[0] || ''
  checkoutForm.value.lastName = nameParts.slice(1).join(' ') || ''
  
  // Llenar el resto de campos
  checkoutForm.value.address = address.address
  checkoutForm.value.apartment = address.label // Usar la referencia como apartamento
  checkoutForm.value.district = address.district
  checkoutForm.value.province = address.province
  checkoutForm.value.phone = address.phone
  
  // Seleccionar Perú como país por defecto
  checkoutForm.value.country = 'PE'
  onCountryChange()
  
  showSavedAddressesModal.value = false
  selectedSavedAddress.value = null
}

// Auto-seleccionar primer método de envío disponible
watch(availableShippingOptions, (newOptions) => {
  if (newOptions.length > 0 && !selectedShippingOption.value) {
    const firstAvailable = newOptions.find(opt => opt.available)
    if (firstAvailable) selectedShippingOption.value = firstAvailable
  }
})

// Pre-llenar datos si está logueado
onMounted(async () => {
  // Llenar email automáticamente
  if (user.value?.email) {
    checkoutForm.value.email = user.value.email
  }
  
  // NO auto-llenar datos del perfil automáticamente
  // El usuario debe hacer click en "Usar mi información"
  
  // Cargar direcciones guardadas
  if (isAuthenticated.value) {
    await loadSavedAddresses()
  }
})
</script>

<style scoped>
.saved-address-card {
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
}

.saved-address-card:hover {
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
}

.saved-address-card.selected {
  border-color: #0d6efd;
  background-color: #f0f7ff;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.25);
}

.modal.show {
  display: block;
}
</style>