// supabase/functions/send-order-email-gmail/index.ts

/// <reference lib="deno.ns" />

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function cleanText(text: string | null | undefined): string {
  if (text === null || text === undefined) return ''
  return String(text).replace(/\s+/g, ' ').trim()
}

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

function getDeliveryTimeByMethod(method: string, providedTime?: string): string {
  const cleanedTime = cleanText(providedTime)
  if (cleanedTime !== '') return cleanedTime
  
  const defaultTimes: Record<string, string> = {
    'pickup': 'Disponible para retiro inmediato',
    'express-lima': 'Entrega en 24 horas',
    'regular-lima': '3-5 días hábiles',
    'province': '3-7 días hábiles',
    'international': '~15 días hábiles'
  }
  return defaultTimes[method] || 'Según método seleccionado'
}

function generateEmailHTML(order: Order, items: OrderItem[]): string {
  const shippingCost = (order.shipping_address.shippingCost !== undefined && order.shipping_address.shippingCost !== null) ? order.shipping_address.shippingCost : 0
  const showShippingCost = order.delivery_method !== 'pickup' && shippingCost > 0
  const shippingCostText = shippingCost > 0 ? `S/. ${shippingCost.toFixed(2)}` : 'Gratis'
  const deliveryTime = getDeliveryTimeByMethod(order.delivery_method, order.shipping_address.deliveryTime)
  const firstName = cleanText(order.shipping_address.firstName) || 'Cliente'
  const lastName = cleanText(order.shipping_address.lastName)
  const fullName = lastName !== '' ? `${firstName} ${lastName}` : firstName
  const address = cleanText(order.shipping_address.address) || 'Dirección no especificada'
  const apartment = cleanText(order.shipping_address.apartment)
  const district = cleanText(order.shipping_address.district) || 'Distrito'
  const province = cleanText(order.shipping_address.province) || 'Provincia'
  const postalCode = cleanText(order.shipping_address.postalCode)
  const phone = cleanText(order.shipping_address.phone) || 'No especificado'
  const documentId = cleanText(order.shipping_address.documentId) || 'No especificado'

  const productsHTML = items.map(item => {
    const colorText = cleanText(item.product_color)
    const colorDisplay = colorText !== '' ? colorText : 'Sin especificar'
    const sizeText = cleanText(item.product_size)
    const hasSize = sizeText !== ''
    const sizeRow = hasSize ? `<div style="color:#999;font-size:13px;margin:3px 0;">Talla: ${sizeText}</div>` : ''
    return `<div style="background:#2a2a2a;border:1px solid #3a3a3a;border-radius:8px;padding:15px;margin-bottom:12px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="width:80px;vertical-align:top;"><img src="${item.product_image_url || 'https://via.placeholder.com/80'}" alt="${item.product_name}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;display:block;"></td><td style="vertical-align:top;padding-left:15px;"><div style="color:#fff;font-size:16px;font-weight:600;margin-bottom:8px;">${item.product_name}</div>${sizeRow}<div style="color:#999;font-size:13px;margin:3px 0;">Color: ${colorDisplay}</div><div style="color:#999;font-size:13px;margin:3px 0;">Cantidad: ${item.quantity}</div></td><td style="text-align:right;vertical-align:top;white-space:nowrap;"><div style="color:#667eea;font-size:18px;font-weight:700;">S/. ${item.subtotal.toFixed(2)}</div><div style="color:#777;font-size:12px;margin-top:4px;">S/. ${item.product_price.toFixed(2)} c/u</div></td></tr></table></div>`
  }).join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;"><tr><td align="center" style="padding:20px 15px;"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:35px 30px;text-align:center;border-radius:12px 12px 0 0;"><h1 style="margin:0;color:white;font-size:28px;font-weight:700;">✅ ¡Pedido Confirmado!</h1><p style="margin:12px 0 0 0;color:white;font-size:16px;opacity:0.95;">Gracias por tu compra, ${fullName}</p></td></tr><tr><td style="background-color:#1e1e1e;padding:30px;border-radius:0 0 12px 12px;"><h2 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 20px 0;padding-bottom:10px;border-bottom:1px solid #333;">Resumen del Pedido</h2><table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:25px;"><tr><td style="color:#999;font-size:14px;font-weight:600;">Número de Pedido:</td><td style="color:#e0e0e0;font-size:14px;text-align:right;">#${order.id.substring(0, 8)}</td></tr><tr><td style="color:#999;font-size:14px;font-weight:600;">Fecha:</td><td style="color:#e0e0e0;font-size:14px;text-align:right;">${new Date(order.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr><tr><td style="color:#999;font-size:14px;font-weight:600;">Método de Entrega:</td><td style="color:#e0e0e0;font-size:14px;text-align:right;">${getDeliveryIcon(order.delivery_method)} ${getDeliveryLabel(order.delivery_method)}</td></tr><tr><td style="color:#999;font-size:14px;font-weight:600;">Tiempo estimado:</td><td style="color:#e0e0e0;font-size:14px;text-align:right;">${deliveryTime}</td></tr>${showShippingCost ? `<tr><td style="color:#999;font-size:14px;font-weight:600;">Costo de envío:</td><td style="color:#e0e0e0;font-size:14px;text-align:right;">${shippingCostText}</td></tr>` : ''}</table><h2 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 15px 0;">Productos</h2>${productsHTML}<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:25px;"><tr><td style="padding:20px;background-color:#2a2a2a;border-radius:8px;border-left:4px solid #667eea;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="color:#fff;font-size:18px;font-weight:600;">Total del Pedido</td><td style="color:#667eea;font-size:28px;font-weight:700;text-align:right;">S/. ${order.total.toFixed(2)}</td></tr></table></td></tr></table><h2 style="color:#fff;font-size:18px;font-weight:600;margin:30px 0 15px 0;">📍 Dirección de Entrega</h2><div style="background-color:#2a2a2a;padding:20px;border-radius:8px;border-left:4px solid #667eea;"><p style="margin:0 0 8px 0;color:#fff;font-size:16px;font-weight:600;">${fullName}</p><p style="margin:0 0 6px 0;color:#bbb;font-size:14px;">${address}${apartment !== '' ? ', ' + apartment : ''}</p><p style="margin:0 0 6px 0;color:#bbb;font-size:14px;">${district}, ${province}${postalCode !== '' ? ' - ' + postalCode : ''}</p><p style="margin:0 0 6px 0;color:#bbb;font-size:14px;">📱 ${phone}</p><p style="margin:0;color:#bbb;font-size:14px;">🆔 DNI: ${documentId}</p></div></td></tr><tr><td style="padding:25px;text-align:center;background-color:#0f0f0f;border-radius:0 0 12px 12px;margin-top:20px;"><p style="margin:0 0 10px 0;color:#999;font-size:14px;">¿Tienes alguna pregunta? Contáctanos</p><p style="margin:0 0 15px 0;"><a href="mailto:${Deno.env.get('GMAIL_USERNAME')}" style="color:#667eea;text-decoration:none;font-size:14px;">${Deno.env.get('GMAIL_USERNAME')}</a></p><p style="margin:0;color:#666;font-size:12px;">© ${new Date().getFullYear()} ALAS Store. Todos los derechos reservados.</p></td></tr></table></td></tr></table></body></html>`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order, items }: EmailPayload = await req.json()

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

    const emailHTML = generateEmailHTML(order, items)

    await client.send({
      from: `ALAS Store <${Deno.env.get('GMAIL_USERNAME')}>`,
      to: order.user_email,
      subject: `✅ Confirmación de Pedido #${order.id.substring(0, 8)} - ALAS Store`,
      html: emailHTML,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado correctamente' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
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