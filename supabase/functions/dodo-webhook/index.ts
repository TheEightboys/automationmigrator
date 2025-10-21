import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    
    console.log('Received webhook:', payload)

    // Handle payment success
    if (payload.event_type === 'payment.succeeded' || payload.type === 'payment.succeeded') {
      const email = payload.data?.customer_email
      const productId = payload.data?.product_id
      
      // Determine plan from product ID
      let plan = 'basic'
      if (productId?.includes('WugctHqkg1QC7hUlL2CBb') || productId?.includes('4C7LioXBf7sEYVrwxiIt5')) {
        plan = 'pro'
      }

      // Update user subscription
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          subscription_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          migrations_used: 0,
          migrations_reset_date: new Date().toISOString()
        })
        .eq('email', email)

      if (error) {
        console.error('Error updating subscription:', error)
        throw error
      }

      console.log(`Subscription activated for ${email}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
