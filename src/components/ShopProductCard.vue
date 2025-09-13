<template>
  <div class="col mb-5">
    <div class="card h-100">
      <div v-if="sale" class="badge bg-dark text-white position-absolute" style="top: 0.5rem; right: 0.5rem">Sale</div>
      <img class="card-img-top" :src="image" alt="Product image" />
      <div class="card-body p-4">
        <div class="text-center">
          <h5 class="fw-bolder">{{ name }}</h5>
          <div v-if="stars" class="d-flex justify-content-center small text-warning mb-2">
            <div v-for="n in stars" :key="n" class="bi-star-fill"></div>
          </div>
          <span v-if="oldPrice" class="text-muted text-decoration-line-through">{{ oldPrice }}</span>
          {{ price }}
        </div>
      </div>
      <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
        <div class="text-center">
          <a class="btn btn-outline-dark mt-auto" href="#">{{ buttonText }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang ="ts">
defineProps({
  name: String,
  price: String,
  oldPrice: String,
  image: String,
  sale: Boolean,
  stars: Number,
  buttonText: {
    type: String,
    default: "Add to cart"
  }
})
</script>
