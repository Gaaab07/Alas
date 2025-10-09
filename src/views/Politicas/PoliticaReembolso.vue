<template>
  <div class="politica-container">
    <div class="politica-header">
      <div class="container">
        <h1 class="politica-title">Política de Reembolso</h1>
        <p class="politica-subtitle">Cambios y Devoluciones – ALAS</p>
      </div>
    </div>

    <div class="container">
      <div class="politica-content">
        <p>
          En ALAS queremos que tengas una buena experiencia con tu compra. 
          Por eso te detallamos nuestra política de cambios y devoluciones:
        </p>

        <h2>Devoluciones</h2>
        <p>Solo aceptamos devoluciones si el producto presenta una falla de fábrica.</p>

        <h3>Requisitos para aceptar una devolución:</h3>
        <ul>
          <li>El producto debe estar sin uso, sin lavar y en su empaque original.</li>
          <li>Todas las etiquetas deben estar adheridas.</li>
          <li>El reclamo debe hacerse dentro de los 7 días hábiles desde la fecha de entrega.</li>
          <li>Debes adjuntar una foto clara del defecto y el comprobante de compra.</li>
        </ul>

        <div class="highlight-box">
          <p class="mb-0">
            <strong>Para iniciar el proceso de devolución:</strong><br>
            Contáctanos al correo <a href="mailto:alasperu@gmail.com">alasperu@gmail.com</a> 
            o al WhatsApp <a href="https://wa.me/51914911135" target="_blank">+51 914 911 135</a>.
          </p>
        </div>

        <h2>Cambios por Talla</h2>
        <p>Aceptamos cambios de talla, sujeto a disponibilidad de stock.</p>

        <h3>Condiciones:</h3>
        <ul>
          <li>El cambio debe solicitarse dentro de los 7 días hábiles desde la entrega.</li>
          <li>El producto debe estar en perfecto estado: sin uso, sin lavar, con etiquetas y en su empaque original.</li>
          <li>La talla deseada debe estar disponible.</li>
        </ul>

        <h3>Pasos para solicitar el cambio:</h3>
        <ul>
          <li>Contáctanos a alasperu@gmail.com o al WhatsApp +51 914 911 135.</li>
          <li>Indica tu número de pedido y la nueva talla que deseas.</li>
          <li>Coordinaremos contigo la disponibilidad y el envío.</li>
        </ul>

        <p>
          <strong>Importante:</strong> El cliente asume los costos de envío por cambios 
          (tanto de ida como de vuelta), salvo que se trate de un error o defecto confirmado por ALAS.
        </p>

        <h2>No se aceptan devoluciones ni cambios en:</h2>
        <ul>
          <li>Productos en oferta o con descuento.</li>
          <li>Ropa interior o calcetines (por razones de higiene).</li>
          <li>Productos lavados, usados o sin etiquetas.</li>
        </ul>

        <div class="contact-box">
          <h3>¿Tienes alguna duda?</h3>
          <p class="mb-0">
            Escríbenos a <a href="mailto:alasperu@gmail.com">alasperu@gmail.com</a> o 
            envíanos un mensaje por WhatsApp al <a href="https://wa.me/51914911135" target="_blank">+51 914 911 135</a>.
          </p>
          <p class="mt-3 mb-0"><strong>Gracias por confiar en ALAS.</strong></p>
        </div>

        <div class="text-center mt-4">
          <router-link to="/" class="btn-back">
            <i class="fa-solid fa-arrow-left"></i>
            Volver al inicio
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/assets/styles/politicas.css'
</script>