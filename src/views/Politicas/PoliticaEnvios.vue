<template>
  <div class="politica-container">
    <div class="politica-header">
      <div class="container">
        <h1 class="politica-title">Política de Envíos</h1>
        <p class="politica-subtitle">Envíos a todo el Perú y al extranjero – ALAS</p>
      </div>
    </div>

    <div class="container">
      <div class="politica-content">
        <p>
          En ALAS realizamos envíos a todo el Perú y al extranjero. 
          A continuación, te detallamos nuestras tarifas, tiempos y condiciones según el destino:
        </p>

        <h2>Envíos Express – Lima Metropolitana</h2>
        <ul>
          <li><strong>Cobertura:</strong> Todo Lima Metropolitana, excepto Puente Piedra, Ancón, Ventanilla, Cieneguilla y Carabayllo.</li>
          <li><strong>Costo:</strong> S/ 25</li>
          <li><strong>Tiempo de entrega:</strong> Dentro de las 24 horas posteriores a la confirmación del pago.</li>
        </ul>

        <h3>Horarios de entrega:</h3>
        <ul>
          <li>Lunes a viernes: 10:30 a.m. – 6:30 p.m.</li>
          <li>Sábados: 11:00 a.m. – 1:00 p.m.</li>
        </ul>

        <div class="highlight-box">
          <p class="mb-0">
            Los pedidos confirmados fuera del horario de atención serán procesados al siguiente día hábil.
          </p>
        </div>

        <h2>Envíos Regulares – Lima Metropolitana</h2>
        <ul>
          <li><strong>Cobertura:</strong> Todo Lima Metropolitana</li>
          <li><strong>Costo:</strong> S/ 12</li>
          <li><strong>Tiempo de entrega:</strong> Entre 3 y 5 días hábiles luego de confirmado el pago.</li>
        </ul>

        <h2>Envíos a Provincia (Perú)</h2>
        <ul>
          <li><strong>Costo:</strong> S/ 18</li>
          <li><strong>Tiempo de entrega:</strong> Entre 3 y 7 días hábiles.</li>
          <li>La empresa de envío puede variar según la zona y operatividad.</li>
        </ul>

        <h2>Envíos Internacionales</h2>
        <ul>
          <li><strong>Costo:</strong> $35 USD</li>
          <li><strong>Tiempo de entrega:</strong> Aproximadamente 15 días hábiles.</li>
          <li><strong>Courier:</strong> DHL</li>
        </ul>

        <div class="highlight-box">
          <p class="mb-0">
            <strong>Importante:</strong> El comprador es responsable de cualquier impuesto o 
            arancel aduanero adicional en el país de destino.
          </p>
        </div>

        <div class="contact-box">
          <h3>Consultas sobre tu envío</h3>
          <p class="mb-0">
            Correo: <a href="mailto:alasperu@gmail.com">alasperu@gmail.com</a><br>
            WhatsApp: <a href="https://wa.me/51914911135" target="_blank">+51 914 911 135</a>
          </p>
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