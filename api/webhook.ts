import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const payload = req.body;
    console.log('Webhook received:', payload);

    // Check if payment succeeded
    if (payload.type === 'payment.succeeded' || payload.event_type === 'payment.succeeded') {
      const email = payload.data?.customer?.email || payload.data?.customer_email;
      const productId = payload.data?.product_id;

      // Determine plan from product ID
      let plan = 'basic';
      if (productId?.includes('WugctHqkg1QC7hUlL2CBb') || productId?.includes('4C7LioXBf7sEYVrwxiIt5')) {
        plan = 'pro';
      }

      console.log(`Activating ${plan} for ${email}`);

      // Update user subscription
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          subscription_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          migrations_used: 0,
          migrations_reset_date: new Date().toISOString(),
        })
        .eq('email', email);

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      console.log(`Subscription activated for ${email}`);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
}
