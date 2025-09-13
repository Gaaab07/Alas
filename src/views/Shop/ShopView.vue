<template>
  <div>
    <!-- Hero video -->
    <HeroVideo />

    <!-- Sección de productos -->
    <section class="py-5">
      <div class="container-fluid px-4 px-lg-5 mt-5">
        <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
          <ProductCard
            v-for="(product, index) in products"
            :key="index"
            v-bind="product"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import HeroVideo from '@/components/HeroVideo.vue'
import ProductCard from '@/components/ShopProductCard.vue'

// Lista de productos de ejemplo
const products = [
  { name: "Fancy Product", price: "$40.00 - $80.00", image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
  { name: "Special Item", price: "$18.00", oldPrice: "$20.00", stars: 5, sale: true, image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
  { name: "Sale Item", price: "$25.00", oldPrice: "$50.00", sale: true, image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
  { name: "Popular Item", price: "$40.00", stars: 5, image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
  { name: "Fancy Product", price: "$120.00 - $280.00", image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
  { name: "Special Item", price: "$18.00", oldPrice: "$20.00", stars: 5, sale: true, image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
  { name: "Sale Item", price: "$25.00", oldPrice: "$50.00", sale: true, image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
  { name: "Popular Item", price: "$40.00", stars: 5, image: "https://dummyimage.com/450x300/dee2e6/6c757d.jpg" },
]
</script>
