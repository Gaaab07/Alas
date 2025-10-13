<template>
  <div class="politica-container">
    <div class="politica-header">
      <div class="container">
        <h1 class="politica-title">Política de Privacidad</h1>
        <p class="politica-subtitle">Protección de datos personales – ALAS</p>
      </div>
    </div>

    <div class="container">
      <div class="politica-content">
        <p>
          En ALAS nos comprometemos a proteger tu información personal y garantizar tu privacidad. 
          Esta política explica cómo recopilamos, usamos y protegemos tus datos cuando visitas 
          nuestro sitio web o realizas una compra.
        </p>

        <h2>1. Información que recopilamos</h2>
        <p>Podemos recopilar la siguiente información cuando navegas o compras en nuestro sitio:</p>
        <ul>
          <li>Nombre completo</li>
          <li>Correo electrónico</li>
          <li>Número de teléfono</li>
          <li>Dirección de envío y facturación</li>
          <li>Información de pago (a través de plataformas seguras como Izipay)</li>
          <li>Historial de compras y navegación</li>
        </ul>

        <h2>2. Cómo usamos tu información</h2>
        <p>Utilizamos tu información para:</p>
        <ul>
          <li>Procesar y gestionar tus pedidos</li>
          <li>Enviar confirmaciones y actualizaciones de tu compra</li>
          <li>Contactarte ante consultas o soporte</li>
          <li>Enviarte promociones y novedades (solo si nos autorizas)</li>
          <li>Mejorar tu experiencia en el sitio web</li>
        </ul>

        <h2>3. Protección de datos</h2>
        <p>
          Tus datos personales están protegidos mediante medidas técnicas y organizativas para evitar 
          accesos no autorizados, pérdidas o alteraciones.
        </p>
        <div class="highlight-box">
          <p class="mb-0">
            <strong>Importante:</strong> No almacenamos directamente la información de tus tarjetas de 
            crédito o débito. Todos los pagos se procesan mediante Izipay, una pasarela de pagos segura y certificada.
          </p>
        </div>

        <h2>4. Compartir información con terceros</h2>
        <p>No vendemos, alquilamos ni compartimos tu información personal, salvo en los siguientes casos:</p>
        <ul>
          <li>Procesamiento de pagos (Izipay)</li>
          <li>Envíos y entregas (empresas de courier)</li>
          <li>Cumplimiento de obligaciones legales</li>
        </ul>
        <p>Estos terceros operan bajo estrictas políticas de confidencialidad.</p>

        <h2>5. Tus derechos</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a tus datos personales</li>
          <li>Solicitar la corrección o eliminación de tu información</li>
          <li>Retirar tu consentimiento en cualquier momento</li>
        </ul>

        <h2>6. Cookies</h2>
        <p>
          Este sitio utiliza cookies para ofrecer una mejor experiencia de navegación. 
          Puedes desactivarlas desde la configuración de tu navegador, aunque algunas funciones 
          podrían dejar de funcionar correctamente.
        </p>

        <h2>7. Cambios en la política</h2>
        <p>
          Nos reservamos el derecho de actualizar esta Política de Privacidad cuando sea necesario. 
          Te recomendamos revisarla periódicamente. Los cambios entrarán en vigencia al ser publicados en esta sección.
        </p>

        <div class="contact-box">
          <h3>8. Contacto</h3>
          <p class="mb-0">
            Si tienes alguna duda o consulta sobre nuestra política de privacidad, puedes escribirnos a:<br>
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