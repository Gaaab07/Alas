<template>
  <div class="checkout-container">
    <div class="container py-5">
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

      <div v-else>
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
          <div class="col-lg-7">
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

            <section class="mb-5">
              <h4 class="mb-3">Dirección de envío</h4>
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-bold">País / Región *</label>
                  <select v-model="checkoutForm.country" class="form-select form-select-lg" @change="onCountryChange" required>
                    <option value="">Seleccionar país...</option>
                    <option v-for="country in availableCountries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                </div>

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

                <div class="col-12">
                  <label class="form-label">Dirección *</label>
                  <input v-model="checkoutForm.address" type="text" class="form-control form-control-lg" placeholder="Calle, número, etc." required />
                </div>

                <div class="col-12">
                  <label class="form-label">Apartamento (opcional)</label>
                  <input v-model="checkoutForm.apartment" type="text" class="form-control form-control-lg" placeholder="Apto, Dpto, Piso, etc." />
                </div>

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
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import { COUNTRIES, PROVINCES, getShippingOptions, formatShippingCost as formatCost } from '@/utils/shipping'
import type { ShippingOption } from '@/types/shipping'
import '@/assets/Styles/checkout.css'

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated, user } = useAuth()
const isProcessing = ref(false)
const showSuccessModal = ref(false)
const selectedShippingOption = ref<ShippingOption | null>(null)

const COUNTRY_VALIDATION = {
  PE: { postal: { maxLength: 5 }, phone: { maxLength: 9 } },
  AR: { postal: { maxLength: 8 }, phone: { maxLength: 10 } },
  CL: { postal: { maxLength: 7 }, phone: { maxLength: 9 } },
  CO: { postal: { maxLength: 6 }, phone: { maxLength: 10 } },
  MX: { postal: { maxLength: 5 }, phone: { maxLength: 10 } },
  US: { postal: { maxLength: 5 }, phone: { maxLength: 10 } }
}

const DOCUMENT_TYPES = {
  PE: [
    { value: 'dni', label: 'DNI - Documento Nacional de Identidad', maxLength: 8, hint: '8 dígitos', numeric: true },
    { value: 'ce', label: 'Carné de Extranjería', maxLength: 12, hint: '12 caracteres alfanuméricos', numeric: false },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  AR: [
    { value: 'dni', label: 'DNI - Documento Nacional de Identidad', maxLength: 8, hint: '8 dígitos', numeric: true },
    { value: 'cuil', label: 'CUIL/CUIT', maxLength: 11, hint: '11 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  CL: [
    { value: 'rut', label: 'RUT - Rol Único Tributario', maxLength: 9, hint: '9 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  CO: [
    { value: 'cc', label: 'Cédula de Ciudadanía', maxLength: 11, hint: 'Hasta 11 dígitos', numeric: true },
    { value: 'ce', label: 'Cédula de Extranjería', maxLength: 11, hint: 'Hasta 11 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  MX: [
    { value: 'curp', label: 'CURP - Clave Única de Registro', maxLength: 18, hint: '18 caracteres', numeric: false },
    { value: 'ine', label: 'INE - Credencial de Elector', maxLength: 13, hint: '13 dígitos', numeric: true },
    { value: 'passport', label: 'Pasaporte', maxLength: 12, hint: 'Hasta 12 caracteres', numeric: false }
  ],
  US: [
    { value: 'ssn', label: 'SSN - Social Security Number', maxLength: 9, hint: '9 dígitos', numeric: true },
    { value: 'drivers', label: 'Driver License', maxLength: 15, hint: 'Hasta 15 caracteres', numeric: false },
    { value: 'passport', label: 'Passport', maxLength: 12, hint: 'Up to 12 characters', numeric: false }
  ]
}

const checkoutForm = ref({
  email: '', newsletter: false, country: 'PE', documentType: '', firstName: '', lastName: '', documentId: '', 
  address: '', apartment: '', postalCode: '', district: '', province: '', phone: ''
})

const paymentForm = ref({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' })
const errors = ref({ firstName: '', lastName: '', documentId: '', postalCode: '', phone: '', cardNumber: '', cardName: '', expiryDate: '', cvv: '' })

const availableCountries = computed(() => COUNTRIES)
const availableProvinces = computed(() => PROVINCES[checkoutForm.value.country] || [])
const isInternational = computed(() => checkoutForm.value.country !== 'PE')
const availableDocumentTypes = computed(() => DOCUMENT_TYPES[checkoutForm.value.country as keyof typeof DOCUMENT_TYPES] || [])
const selectedDocumentConfig = computed(() => {
  if (!checkoutForm.value.documentType) return null
  const types = DOCUMENT_TYPES[checkoutForm.value.country as keyof typeof DOCUMENT_TYPES] || []
  return types.find(t => t.value === checkoutForm.value.documentType) || null
})

const selectedDocumentLabel = computed(() => selectedDocumentConfig.value?.label || 'Número de Documento')
const selectedDocumentPlaceholder = computed(() => {
  const config = selectedDocumentConfig.value
  return config ? `${config.label} (${config.hint})` : 'Seleccione primero el tipo de documento'
})
const selectedDocumentMaxLength = computed(() => selectedDocumentConfig.value?.maxLength || 20)
const selectedDocumentHint = computed(() => {
  const config = selectedDocumentConfig.value
  return config ? `Ingrese su ${config.label} - ${config.hint}` : 'Seleccione el tipo de documento primero'
})

const availableShippingOptions = computed(() => {
  if (!checkoutForm.value.country || !checkoutForm.value.province) return []
  return getShippingOptions(checkoutForm.value.country, checkoutForm.value.province, checkoutForm.value.district)
})

const shippingCost = computed(() => {
  if (!selectedShippingOption.value) return 0
  return selectedShippingOption.value.currency === 'USD' ? selectedShippingOption.value.cost * 3.75 : selectedShippingOption.value.cost
})
const shippingCostDisplay = computed(() => 
  !selectedShippingOption.value ? 'Seleccionar método de envío' : formatCost(selectedShippingOption.value.cost, selectedShippingOption.value.currency)
)
const finalTotal = computed(() => cartStore.subtotal + shippingCost.value)

const postalMaxLength = computed(() => {
  const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
  return cfg?.postal.maxLength || 10
})
const postalPlaceholder = computed(() => {
  const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
  const max = cfg?.postal.maxLength || 10
  return `Código postal (${max} caracteres)`
})
const phoneMaxLength = computed(() => {
  const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
  return cfg?.phone.maxLength || 15
})
const phonePlaceholder = computed(() => {
  const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
  const max = cfg?.phone.maxLength || 15
  return `Teléfono (${max} dígitos)`
})
const phoneHint = computed(() => {
  const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
  const max = cfg?.phone.maxLength || 15
  return `Ingrese su número de ${max} dígitos`
})
const provinceLabel = computed(() => checkoutForm.value.country === 'PE' ? 'Provincia' : 'Estado/Provincia')
const districtLabel = computed(() => {
  const labels: Record<string, string> = { PE: 'Distrito *', AR: 'Ciudad', CL: 'Comuna', CO: 'Ciudad', MX: 'Municipio', US: 'City' }
  return labels[checkoutForm.value.country] || 'Ciudad'
})
const districtPlaceholder = computed(() => {
  const ph: Record<string, string> = { PE: 'Ej: Miraflores', AR: 'Ej: Palermo', CL: 'Ej: Providencia', CO: 'Ej: Chapinero', MX: 'Ej: Polanco', US: 'Ex: Manhattan' }
  return ph[checkoutForm.value.country] || 'Ciudad'
})

const validateName = (field: 'firstName' | 'lastName') => {
  const value = checkoutForm.value[field]
  const cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  checkoutForm.value[field] = cleaned
  errors.value[field] = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) ? '' : 'Solo se permiten letras'
}

const onDocumentTypeChange = () => {
  checkoutForm.value.documentId = ''
  errors.value.documentId = ''
}

const validateDocumentId = () => {
  const value = checkoutForm.value.documentId
  const config = selectedDocumentConfig.value
  
  if (!config) {
    errors.value.documentId = 'Seleccione el tipo de documento primero'
    return
  }
  
  if (config.numeric) {
    const numbersOnly = value.replace(/\D/g, '').substring(0, config.maxLength)
    checkoutForm.value.documentId = numbersOnly
    errors.value.documentId = (numbersOnly.length > 0 && numbersOnly.length < config.maxLength) 
      ? `Debe tener ${config.maxLength} dígitos` : ''
  } else {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, config.maxLength)
    checkoutForm.value.documentId = cleaned.toUpperCase()
    errors.value.documentId = (cleaned.length > 0 && cleaned.length < 6) ? 'Mínimo 6 caracteres' : ''
  }
}

const validatePostalCode = () => {
  const value = checkoutForm.value.postalCode
  const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
  const maxLength = cfg?.postal.maxLength || 10
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, maxLength)
  checkoutForm.value.postalCode = cleaned.toUpperCase()
  if (isInternational.value) {
    errors.value.postalCode = (cleaned.length > 0 && cleaned.length < maxLength) 
      ? `Debe tener ${maxLength} caracteres` : ''
  } else {
    errors.value.postalCode = ''
  }
}

const validatePhone = () => {
  const value = checkoutForm.value.phone
  const numbersOnly = value.replace(/\D/g, '')
  const cfg = COUNTRY_VALIDATION[checkoutForm.value.country as keyof typeof COUNTRY_VALIDATION]
  const maxLength = cfg?.phone.maxLength || 15
  checkoutForm.value.phone = numbersOnly.substring(0, maxLength)
  errors.value.phone = (numbersOnly.length > 0 && numbersOnly.length < maxLength) 
    ? `Debe tener ${maxLength} dígitos` : ''
}

const formatCardNumber = () => {
  const value = paymentForm.value.cardNumber.replace(/\s/g, '').replace(/\D/g, '').substring(0, 16)
  const formatted = value.match(/.{1,4}/g)?.join(' ') || value
  paymentForm.value.cardNumber = formatted
  errors.value.cardNumber = (value.length > 0 && value.length < 16) ? 'Debe tener 16 dígitos' : ''
}

const validateCardName = () => {
  const cleaned = paymentForm.value.cardName.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase()
  paymentForm.value.cardName = cleaned
  errors.value.cardName = (cleaned.length > 0 && cleaned.length < 3) ? 'Mínimo 3 caracteres' : ''
}

const formatExpiryDate = () => {
  let value = paymentForm.value.expiryDate.replace(/\D/g, '')
  if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4)
  paymentForm.value.expiryDate = value
  if (value.length === 5) {
    const month = parseInt(value.split('/')[0])
    errors.value.expiryDate = (month < 1 || month > 12) ? 'Mes inválido (01-12)' : ''
  } else if (value.length > 0) {
    errors.value.expiryDate = 'Formato: MM/AA'
  } else {
    errors.value.expiryDate = ''
  }
}

const validateCVV = () => {
  const value = paymentForm.value.cvv.replace(/\D/g, '').substring(0, 4)
  paymentForm.value.cvv = value
  errors.value.cvv = (value.length > 0 && value.length < 3) ? 'Mínimo 3 dígitos' : ''
}

const hasErrors = computed(() => Object.values(errors.value).some(e => e !== ''))
const isPaymentValid = computed(() => 
  paymentForm.value.cardNumber.replace(/\s/g, '').length === 16 &&
  paymentForm.value.cardName.trim().length >= 3 &&
  paymentForm.value.expiryDate.length === 5 &&
  paymentForm.value.cvv.length >= 3 &&
  !hasErrors.value
)
const isFormValid = computed(() => {
  const basic = checkoutForm.value.email && checkoutForm.value.firstName && checkoutForm.value.lastName &&
    checkoutForm.value.documentType && checkoutForm.value.documentId && checkoutForm.value.address && 
    checkoutForm.value.province && checkoutForm.value.phone && checkoutForm.value.country
  if (checkoutForm.value.country === 'PE') return basic && checkoutForm.value.district
  if (isInternational.value) return basic && checkoutForm.value.postalCode
  return basic
})
const canProceedToPayment = computed(() => 
  cartStore.items.length > 0 && isFormValid.value && !hasErrors.value && !isProcessing.value &&
  selectedShippingOption.value !== null && isPaymentValid.value
)

const onCountryChange = () => {
  checkoutForm.value.province = ''
  checkoutForm.value.district = ''
  checkoutForm.value.postalCode = ''
  checkoutForm.value.documentType = ''
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
    if (fetchError) throw new Error(`Error al obtener producto ${item.name}`)
    const newStock = product.stock - item.quantity
    if (newStock < 0) throw new Error(`Stock insuficiente para ${item.name}`)
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.id)
    if (updateError) throw new Error(`Error al actualizar stock de ${item.name}`)
    updates.push({ productId: item.id, productName: item.name, quantity: item.quantity, previousStock: product.stock, newStock: newStock })
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
  if (!selectedShippingOption.value) return false
  try {
    await supabase.functions.invoke('send-order-email-gmail', {
      body: {
        order: {
          id: orderData.id,
          user_id: user.value?.id || '',
          user_email: checkoutForm.value.email,
          total: finalTotal.value,
          status: 'completed',
          delivery_method: selectedShippingOption.value.id,
          shipping_address: {
            firstName: checkoutForm.value.firstName,
            lastName: checkoutForm.value.lastName,
            documentType: checkoutForm.value.documentType,
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
            shippingCost: shippingCost.value
          },
          created_at: orderData.created_at
        },
        items: cartStore.items.map(item => ({
          id: crypto.randomUUID(),
          order_id: orderData.id,
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          product_size: item.size,
          product_color: item.color,
          product_image_url: item.image_url,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }))
      }
    })
    return true
  } catch {
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
    await updateStock()
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
          documentType: checkoutForm.value.documentType,
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
    if (orderError) throw new Error('Error al crear la orden: ' + orderError.message)
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
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw new Error('Error al guardar los productos: ' + itemsError.message)
    await sendOrderConfirmationEmail(order)
    cartStore.clearCart()
    showSuccessModal.value = true
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Error al procesar la compra')
  } finally {
    isProcessing.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/shop')
}

watch(availableShippingOptions, (newOptions) => {
  if (newOptions.length > 0 && !selectedShippingOption.value) {
    const firstAvailable = newOptions.find(opt => opt.available)
    if (firstAvailable) selectedShippingOption.value = firstAvailable
  }
})

onMounted(() => {
  if (user.value?.email) checkoutForm.value.email = user.value.email
})
</script>