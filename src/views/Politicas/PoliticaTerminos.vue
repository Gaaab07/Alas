<template>
  <div class="politica-container">
    <div class="politica-header">
      <div class="container">
        <h1 class="politica-title">Condiciones de Servicio</h1>
        <p class="politica-subtitle">Términos del Servicio – ALAS</p>
      </div>
    </div>

    <div class="container">
      <div class="politica-content">
        <p>
          Al acceder y utilizar nuestro sitio web y/o realizar una compra, 
          aceptas los siguientes términos y condiciones:
        </p>

        <h2>1. Uso del sitio web</h2>
        <p>
          El contenido del sitio web es propiedad de ALAS. No está permitido copiar, 
          reproducir o utilizar nuestro contenido sin autorización previa y por escrito.
        </p>

        <h2>2. Productos</h2>
        <ul>
          <li>Todos los productos están sujetos a disponibilidad.</li>
          <li>Nos reservamos el derecho de limitar las cantidades de cualquier producto o servicio ofrecido.</li>
          <li>Nos esforzamos por mostrar con precisión los colores y detalles de cada prenda, 
              pero no podemos garantizar que la visualización en tu pantalla sea exacta.</li>
        </ul>

        <h2>3. Precios y pagos</h2>
        <ul>
          <li>Todos los precios están en soles peruanos (PEN), excepto para envíos internacionales (USD).</li>
          <li>ALAS se reserva el derecho de modificar los precios en cualquier momento sin previo aviso.</li>
          <li>Aceptamos pagos mediante Yape, Plin, transferencia bancaria e Izipay (tarjetas de débito y crédito).</li>
        </ul>

        <h2>4. Envíos</h2>
        <p>
          Consulta nuestra <router-link to="/politicas/envios">Política de Envíos</router-link> para conocer 
          los costos, tiempos y condiciones según tu ubicación.
        </p>
        <div class="highlight-box">
          <p class="mb-0">
            No nos hacemos responsables por retrasos ocasionados por causas ajenas a ALAS, 
            como eventos logísticos o climáticos.
          </p>
        </div>

        <h2>5. Cambios y devoluciones</h2>
        <ul>
          <li>Los cambios por talla se aceptan dentro de los 7 días hábiles después de recibir el pedido, 
              sujeto a disponibilidad de stock.</li>
          <li>Las devoluciones solo aplican en caso de fallas de fábrica.</li>
          <li>Revisa nuestra <router-link to="/politicas/reembolso">Política de Cambios y Devoluciones</router-link> 
              para más información.</li>
        </ul>

        <h2>6. Propiedad intelectual</h2>
        <p>
          Todos los diseños, imágenes, logotipo y contenido son propiedad exclusiva de ALAS. 
          El uso no autorizado está estrictamente prohibido.
        </p>

        <h2>7. Modificaciones al servicio</h2>
        <p>
          Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del 
          sitio o servicio sin previo aviso.
        </p>

        <div class="contact-box">
          <h3>8. Contacto</h3>
          <p class="mb-0">
            Si tienes dudas sobre estos términos, puedes comunicarte con nosotros a:<br>
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
import '@/assets/Styles/politicas.css'
</script>