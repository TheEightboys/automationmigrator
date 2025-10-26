import React, { useState } from 'react';
import { Check, Loader, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

export const Billing: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  const checkoutLinks = {
    lite: {
      monthly: import.meta.env.VITE_DODO_LITE_MONTHLY_LINK,
      yearly: import.meta.env.VITE_DODO_LITE_YEARLY_LINK,
    },
    pro: {
      monthly: import.meta.env.VITE_DODO_PRO_MONTHLY_LINK,
      yearly: import.meta.env.VITE_DODO_PRO_YEARLY_LINK,
    },
  };

  const plans = [
    {
      name: 'Lite',
      planKey: 'lite' as const,
      monthlyPrice: 9,
      yearlyPrice: 7,
      yearlyTotal: 84,
      description: 'For Freelancers and Solo Founders',
      features: [
        '50 Migrations per month',
        '100+ languages supported',
        'Custom watermark',
        'Email support'
      ],
      gradient: 'from-slate-700 via-slate-800 to-slate-900'
    },
    {
      name: 'Pro',
      planKey: 'pro' as const,
      monthlyPrice: 19,
      yearlyPrice: 17,
      yearlyTotal: 204,
      description: 'For Startups and Agencies',
      popular: true,
      features: [
        '250 Migrations/month',
        '100+ languages supported',
        'Custom watermark',
        'Add up to 5 users',
        'High-importance email assistance'
      ],
      gradient: 'from-blue-600 via-blue-700 to-blue-800'
    },
  ];

  const handleCheckout = (planKey: 'lite' | 'pro', planName: string) => {
    const checkoutLink = isYearly ? checkoutLinks[planKey].yearly : checkoutLinks[planKey].monthly;

    if (!checkoutLink || checkoutLink === 'undefined') {
      alert('Checkout link not configured.');
      return;
    }

    if (!user) {
      alert('Please sign in to purchase a plan.');
      return;
    }

    setLoading(planName);
    window.location.href = checkoutLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-20 px-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles size={16} />
            Simple & Transparent Pricing
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No surprises.
          </p>
        </motion.div>

        {/* Billing Toggle with Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <div className="relative inline-flex bg-white rounded-2xl border-2 border-slate-200 p-2 shadow-xl">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-10"
              animate={{ opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-8 py-3 rounded-xl font-semibold transition-all ${
                !isYearly
                  ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-8 py-3 rounded-xl font-semibold transition-all ${
                isYearly
                  ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg"
              >
                22% OFF
              </motion.span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards with Stagger Animation */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isLoading = loading === plan.name;
            const isCurrentPlan = subscription.plan === plan.planKey;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden ${
                  plan.popular ? 'ring-4 ring-blue-500 md:scale-105' : ''
                }`}
              >
                {/* Animated Gradient Header */}
                <motion.div
                  className={`relative bg-gradient-to-br ${plan.gradient} p-8 text-white overflow-hidden`}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  {/* Floating Particles */}
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-10 right-10 w-20 h-20 bg-white rounded-full blur-xl"
                  />
                  <motion.div
                    animate={{
                      y: [0, 20, 0],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"
                  />

                  <div className="relative z-10">
                    {plan.popular && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="absolute -top-4 -right-4"
                      >
                        <span className="bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1">
                          <Zap size={12} />
                          POPULAR
                        </span>
                      </motion.div>
                    )}

                    <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
                    <p className="text-white/80 text-sm mb-8">{plan.description}</p>

                    <div className="flex items-baseline gap-2 mb-2">
                      <motion.span
                        key={price}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-7xl font-black"
                      >
                        ${price}
                      </motion.span>
                      <span className="text-xl text-white/80">/month</span>
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/70 text-sm"
                    >
                      {isYearly ? `$${plan.yearlyTotal} billed annually` : 'Billed monthly'}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Features */}
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"
                        >
                          <Check className="text-green-600" size={14} />
                        </motion.div>
                        <span className="text-slate-700 font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCheckout(plan.planKey, plan.name)}
                    disabled={isLoading || isCurrentPlan}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                      isCurrentPlan
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl'
                        : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-black hover:shadow-2xl'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      '✓ Current Plan'
                    ) : (
                      <>
                        Get Started
                        <ArrowRight size={20} />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <motion.h2
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-4xl font-black mb-4"
            >
              Start Free Today 🚀
            </motion.h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
             Get free 5 credits 
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl"
            >
              Start Converting Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
