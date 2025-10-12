// supabase/functions/send-order-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

interface OrderData {
  orderId: string
  customerEmail: string
  customerName: string
  orderTotal: number
  orderItems: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
    image_url?: string
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    district: string
    province: string
    phone: string
  }
  deliveryMethod: string
  createdAt: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const orderData: OrderData = await req.json()

    const emailHtml = generateOrderEmailHTML(orderData)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ALAS Store <onboarding@resend.dev>',
        to: [orderData.customerEmail],
        subject: `✅ Confirmación de Pedido #${orderData.orderId.substring(0, 8)}`,
        html: emailHtml,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Error al enviar email')
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function generateOrderEmailHTML(data: OrderData): string {
  const itemsHTML = data.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">` : ''}
          <div>
            <strong style="display: block; margin-bottom: 5px;">${item.name}</strong>
            <span style="color: #666; font-size: 14px;">Cantidad: ${item.quantity}</span>
          </div>
        </div>
      </td>
      <td style="padding: 15px; text-align: right; border-bottom: 1px solid #eee;">
        <strong>S/. ${item.subtotal.toFixed(2)}</strong>
        <br>
        <span style="color: #666; font-size: 14px;">S/. ${item.price.toFixed(2)} c/u</span>
      </td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ✅ ¡Pedido Confirmado!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Gracias por tu compra, ${data.customerName}
              </p>
            </td>
          </tr>

          <!-- Resumen del pedido -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #333;">
                      Resumen del Pedido
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong>Número de Pedido:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          #${data.orderId.substring(0, 8)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong>Fecha:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          ${new Date(data.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong>Método de Entrega:</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          ${data.deliveryMethod === 'shipping' ? '🚚 Envío a domicilio' : '🏪 Retiro en tienda'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Productos -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">
                Productos
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
                ${itemsHTML}
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 20px; border-radius: 6px;">
                <tr>
                  <td>
                    <h3 style="margin: 0; font-size: 20px; color: #333;">Total del Pedido</h3>
                  </td>
                  <td style="text-align: right;">
                    <h3 style="margin: 0; font-size: 24px; color: #667eea;">S/. ${data.orderTotal.toFixed(2)}</h3>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dirección de envío -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">
                📍 Dirección de Entrega
              </h3>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea;">
                <p style="margin: 0 0 8px 0;"><strong>${data.shippingAddress.firstName} ${data.shippingAddress.lastName}</strong></p>
                <p style="margin: 0 0 5px 0; color: #666;">${data.shippingAddress.address}</p>
                <p style="margin: 0 0 5px 0; color: #666;">${data.shippingAddress.district}, ${data.shippingAddress.province}</p>
                <p style="margin: 0; color: #666;">📞 ${data.shippingAddress.phone}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                ¿Tienes alguna pregunta? Contáctanos
              </p>
              <p style="margin: 0; color: #667eea; font-size: 14px;">
                <a href="mailto:soporte@alasstore.com" style="color: #667eea; text-decoration: none;">soporte@alasstore.com</a>
              </p>
              <p style="margin: 20px 0 0 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} ALAS Store. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}