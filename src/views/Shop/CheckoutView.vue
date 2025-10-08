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

      <!-- Formulario de checkout (solo se muestra si hay items) -->
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

                <!-- DNI/CE/Pasaporte -->
                <div class="col-12">
                  <input 
                    v-model="checkoutForm.documentId"
                    type="text" 
                    class="form-control form-control-lg" 
                    :class="{ 'is-invalid': errors.documentId }"
                    placeholder="DNI (8 dígitos)"
                    maxlength="8"
                    @input="validateDocumentId"
                    required
                  />
                  <div v-if="errors.documentId" class="invalid-feedback">
                    {{ errors.documentId }}
                  </div>
                  <small class="text-muted">Ingrese su DNI de 8 dígitos</small>
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
                    :class="{ 'is-invalid': errors.postalCode }"
                    placeholder="Código postal"
                    @input="validatePostalCode"
                  />
                  <div v-if="errors.postalCode" class="invalid-feedback">
                    {{ errors.postalCode }}
                  </div>
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
                      :class="{ 'is-invalid': errors.phone }"
                      placeholder="Teléfono (9 dígitos)"
                      maxlength="9"
                      @input="validatePhone"
                      required
                    />
                    <button class="btn btn-outline-secondary" type="button">
                      <i class="fa-solid fa-circle-info"></i>
                    </button>
                    <div v-if="errors.phone" class="invalid-feedback">
                      {{ errors.phone }}
                    </div>
                  </div>
                  <small class="text-muted">Ingrese su número de teléfono de 9 dígitos</small>
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
                  Pagar
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import '@/assets/styles/checkout.css'

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated, user } = useAuth()

const isProcessing = ref(false)
const showSuccessModal = ref(false)

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

const errors = ref({
  firstName: '',
  lastName: '',
  documentId: '',
  postalCode: '',
  phone: ''
})

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
  
  if (numbersOnly.length > 0 && numbersOnly.length < 8) {
    errors.value.documentId = 'El DNI debe tener 8 dígitos'
  } else if (numbersOnly.length === 8) {
    errors.value.documentId = ''
  } else if (numbersOnly.length === 0) {
    errors.value.documentId = ''
  }
}

const validatePostalCode = () => {
  const value = checkoutForm.value.postalCode
  const numbersOnly = value.replace(/\D/g, '')
  checkoutForm.value.postalCode = numbersOnly
  
  if (numbersOnly.length > 0) {
    errors.value.postalCode = ''
  }
}

const validatePhone = () => {
  const value = checkoutForm.value.phone
  const numbersOnly = value.replace(/\D/g, '')
  checkoutForm.value.phone = numbersOnly
  
  if (numbersOnly.length > 0 && numbersOnly.length < 9) {
    errors.value.phone = 'El teléfono debe tener 9 dígitos'
  } else if (numbersOnly.length === 9) {
    errors.value.phone = ''
  } else if (numbersOnly.length === 0) {
    errors.value.phone = ''
  }
}

const hasErrors = computed(() => {
  return Object.values(errors.value).some(error => error !== '')
})

const isFormValid = computed(() => {
  return (
    checkoutForm.value.email &&
    checkoutForm.value.firstName &&
    checkoutForm.value.lastName &&
    checkoutForm.value.documentId.length === 8 &&
    checkoutForm.value.address &&
    checkoutForm.value.district &&
    checkoutForm.value.province &&
    checkoutForm.value.phone.length === 9
  )
})

const canProceedToPayment = computed(() => {
  return (
    cartStore.items.length > 0 &&
    isFormValid.value &&
    !hasErrors.value &&
    !isProcessing.value
  )
})

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
        user_email: user.value.email,
        total: cartStore.total,
        status: 'completed',
        delivery_method: checkoutForm.value.deliveryMethod,
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
          postalCode: checkoutForm.value.postalCode
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

onMounted(() => {
  if (cartStore.items.length === 0) {
    console.warn('⚠️ El carrito está vacío')
  }
})
</script>