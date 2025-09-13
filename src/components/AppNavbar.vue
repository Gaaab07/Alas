<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light w-100">
    <!-- container-fluid para ancho completo -->
    <div class="container-fluid px-4 px-lg-5">
      <a class="navbar-brand" href="#">Alas</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
          <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Inicio</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Conocenos</a></li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              id="navbarDropdown"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >Tienda</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><a class="dropdown-item" href="#">Todos los productos</a></li>
              <li><hr class="dropdown-divider" /></li>
              <li><a class="dropdown-item" href="#">Popular Items</a></li>
              <li><a class="dropdown-item" href="#">New Arrivals</a></li>
            </ul>
          </li>
        </ul>
      <form class="d-flex align-items-center">
  <!-- Icono del carrito -->
  <router-link to="/cart" class="btn btn-outline-dark me-2 position-relative">
    <i class="fa-solid fa-cart-shopping"></i>
    <!-- Badge con cantidad de productos -->
    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
      0
    </span>
  </router-link>

  <!-- Icono de usuario que lleva a /signin -->
  <router-link to="/signin" class="btn btn-outline-primary">
    <i class="fa-solid fa-user"></i>
  </router-link>
</form>



      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script>
