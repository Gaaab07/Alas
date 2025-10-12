// supabase/functions/send-order-email-gmail/index.ts

// 
// Deno Edge Function - Los errores de TS son normales en el editor

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// ============================================
// TIPOS E INTERFACES
// ============================================

interface ShippingAddress {
  firstName: string
  lastName: string
  documentId: string
  email: string
  phone: string
  country: string
  address: string
  apartment?: string
  district: string
  province: string
  postalCode?: string
  shippingMethod?: string
  deliveryTime?: string
  shippingCost?: number
}

interface Order {
  id: string
  user_id: string
  user_email: string
  total: number
  status: string
  delivery_method: string
  shipping_address: ShippingAddress
  created_at: string
}

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  product_size?: string
  product_color?: string
  product_image_url?: string
  quantity: number
  subtotal: number
}

interface EmailPayload {
  order: Order
  items: OrderItem[]
}

// ============================================
// CONFIGURACIÓN CORS
// ============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getDeliveryLabel(method: string): string {
  const labels: Record<string, string> = {
    'pickup': 'Retiro en Tienda',
    'express-lima': 'Envío Express - Lima',
    'regular-lima': 'Envío Regular - Lima',
    'province': 'Envío a Provincia',
    'international': 'Envío Internacional',
    'shipping': 'Envío a Domicilio'
  }
  return labels[method] || 'Método no especificado'
}

function getDeliveryIcon(method: string): string {
  const icons: Record<string, string> = {
    'pickup': '🏪',
    'express-lima': '⚡',
    'regular-lima': '🚚',
    'province': '📦',
    'international': '✈️',
    'shipping': '🚚'
  }
  return icons[method] || '📦'
}

function generateEmailHTML(order: Order, items: OrderItem[]): string {
  const productsHTML = items.map((item: OrderItem) => `
    <div class="product-item">
      <img src="${item.product_image_url || 'https://via.placeholder.com/80'}" 
           alt="${item.product_name}" 
           class="product-image">
      <div class="product-details">
        <div class="product-name">${item.product_name}</div>
        ${item.product_size ? `<div class="product-meta">Talla: ${item.product_size}</div>` : ''}
        ${item.product_color ? `<div class="product-meta">Color: ${item.product_color}</div>` : ''}
        <div class="product-meta">Cantidad: ${item.quantity}</div>
      </div>
      <div style="text-align: right;">
        <div class="product-price">S/. ${item.subtotal.toFixed(2)}</div>
        <div class="product-unit-price">S/. ${item.product_price.toFixed(2)} c/u</div>
      </div>
    </div>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
          line-height: 1.6; 
          color: #e0e0e0;
          background-color: #1a1a1a;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #2a2a2a;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
        }
        .header p {
          margin: 15px 0 0 0;
          font-size: 18px;
          opacity: 0.95;
        }
        .content { 
          background: #2a2a2a; 
          padding: 30px;
          color: #e0e0e0;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 30px 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #3a3a3a;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #3a3a3a;
        }
        .info-label {
          color: #999;
          font-weight: 600;
        }
        .info-value {
          color: #e0e0e0;
          text-align: right;
        }
        .product-item {
          display: flex;
          align-items: center;
          padding: 20px;
          background: #333;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 20px;
          background: #444;
        }
        .product-details {
          flex: 1;
        }
        .product-name {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px 0;
        }
        .product-meta {
          color: #999;
          font-size: 14px;
          margin: 3px 0;
        }
        .product-price {
          text-align: right;
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }
        .product-unit-price {
          text-align: right;
          color: #999;
          font-size: 13px;
          margin-top: 5px;
        }
        .total-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          text-align: center;
          border-radius: 12px;
          margin: 30px 0;
        }
        .total-label {
          font-size: 18px;
          margin: 0 0 10px 0;
          opacity: 0.9;
        }
        .total-amount {
          font-size: 42px;
          font-weight: 700;
          margin: 0;
        }
        .address-box {
          background: #333;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .address-line {
          color: #e0e0e0;
          margin: 8px 0;
          font-size: 15px;
        }
        .address-name {
          font-weight: 700;
          color: #fff;
          font-size: 16px;
        }
        .footer {
          background: #1a1a1a;
          padding: 30px;
          text-align: center;
          color: #999;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>✅ ¡Pedido Confirmado!</h1>
          <p>Gracias por tu compra, ${order.shipping_address.firstName} ${order.shipping_address.lastName}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Resumen del Pedido -->
          <h2 class="section-title">Resumen del Pedido</h2>
          
          <div class="info-row">
            <span class="info-label">Número de Pedido:</span>
            <span class="info-value">#${order.id.substring(0, 8)}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${new Date(order.created_at).toLocaleDateString('es-PE', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Método de Entrega:</span>
            <span class="info-value">${getDeliveryIcon(order.delivery_method)} ${getDeliveryLabel(order.delivery_method)}</span>
          </div>
          
          ${order.shipping_address.deliveryTime ? `
          <div class="info-row">
            <span class="info-label">Tiempo estimado:</span>
            <span class="info-value">${order.shipping_address.deliveryTime}</span>
          </div>
          ` : ''}
          
          ${order.shipping_address.shippingCost !== undefined && order.shipping_address.shippingCost > 0 ? `
          <div class="info-row">
            <span class="info-label">Costo de envío:</span>
            <span class="info-value">S/. ${order.shipping_address.shippingCost.toFixed(2)}</span>
          </div>
          ` : ''}

          <!-- Productos -->
          <h2 class="section-title">Productos</h2>
          ${productsHTML}

          <!-- Total -->
          <div class="total-box">
            <p class="total-label">Total del Pedido</p>
            <h2 class="total-amount">S/. ${order.total.toFixed(2)}</h2>
          </div>

          <!-- Dirección de Entrega -->
          <h2 class="section-title">📍 Dirección de Entrega</h2>
          <div class="address-box">
            <div class="address-line address-name">${order.shipping_address.firstName} ${order.shipping_address.lastName}</div>
            <div class="address-line">${order.shipping_address.address}${order.shipping_address.apartment ? ', ' + order.shipping_address.apartment : ''}</div>
            <div class="address-line">${order.shipping_address.district}, ${order.shipping_address.province}${order.shipping_address.postalCode ? ' - ' + order.shipping_address.postalCode : ''}</div>
            <div class="address-line">📱 ${order.shipping_address.phone}</div>
            <div class="address-line">🆔 DNI: ${order.shipping_address.documentId}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>¿Tienes preguntas? Contáctanos a <a href="mailto:${Deno.env.get('GMAIL_USERNAME')}">${Deno.env.get('GMAIL_USERNAME')}</a></p>
          <p style="font-size: 12px; margin-top: 15px;">Este es un email automático, por favor no respondas a este mensaje.</p>
          <p style="font-size: 12px; margin-top: 10px; color: #666;">© ${new Date().getFullYear()} ALAS Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

Deno.serve(async (req: Request) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order, items }: EmailPayload = await req.json()

    console.log('📧 Enviando email para pedido:', order.id)

    // Configurar cliente SMTP de Gmail
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get('GMAIL_USERNAME')!,
          password: Deno.env.get('GMAIL_APP_PASSWORD')!,
        },
      },
    })

    // Generar HTML del email
    const emailHTML = generateEmailHTML(order, items)

    // Enviar email
    await client.send({
      from: `ALAS Store <${Deno.env.get('GMAIL_USERNAME')}>`,
      to: order.user_email,
      subject: `✅ Confirmación de Pedido #${order.id.substring(0, 8)} - ALAS Store`,
      html: emailHTML,
    })

    await client.close()

    console.log('✅ Email enviado exitosamente a:', order.user_email)

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado correctamente' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error al enviar email:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})