// src/composables/useCheckoutForm.ts

import { ref, computed } from 'vue'
import { COUNTRIES, PROVINCES, getShippingOptions } from '@/utils/shipping'
import type { ShippingOption } from '@/types/shipping'
import { DISTRICT_LABELS, DISTRICT_PLACEHOLDERS } from '@/utils/checkoutConfig'

export function useCheckoutForm() {
  const checkoutForm = ref({
    email: '',
    newsletter: false,
    country: 'PE',
    documentType: '',
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
    phone: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  const selectedShippingOption = ref<ShippingOption | null>(null)

  // Computed properties
  const availableCountries = computed(() => COUNTRIES)
  
  const availableProvinces = computed(() => PROVINCES[checkoutForm.value.country] || [])
  
  const isInternational = computed(() => checkoutForm.value.country !== 'PE')
  
  const availableShippingOptions = computed(() => {
    if (!checkoutForm.value.country || !checkoutForm.value.province) return []
    return getShippingOptions(
      checkoutForm.value.country,
      checkoutForm.value.province,
      checkoutForm.value.district
    )
  })

  const provinceLabel = computed(() => checkoutForm.value.country === 'PE' ? 'Provincia' : 'Estado/Provincia')
  
  const districtLabel = computed(() => DISTRICT_LABELS[checkoutForm.value.country] || 'Ciudad')
  
  const districtPlaceholder = computed(() => DISTRICT_PLACEHOLDERS[checkoutForm.value.country] || 'Ciudad')

  const hasErrors = computed(() => Object.values(errors.value).some(e => e !== ''))

  // ✅ CORREGIDO: Ahora retorna boolean
  const isFormValid = computed(() => {
    const basic = !!(
      checkoutForm.value.email && 
      checkoutForm.value.firstName && 
      checkoutForm.value.lastName &&
      checkoutForm.value.documentType && 
      checkoutForm.value.documentId && 
      checkoutForm.value.address &&
      checkoutForm.value.province && 
      checkoutForm.value.phone && 
      checkoutForm.value.country
    )
    
    if (checkoutForm.value.country === 'PE') {
      return basic && !!checkoutForm.value.district
    }
    
    if (isInternational.value) {
      return basic && !!checkoutForm.value.postalCode
    }
    
    return basic
  })

  // Methods
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

  return {
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
    hasErrors,
    isFormValid,
    onCountryChange,
    onProvinceChange,
    selectShippingOption
  }
}