import React, { useState } from 'react';
import { Check, Zap, Crown, Infinity, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

export const Billing: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  // Get checkout links from environment variables
  const checkoutLinks = {
    basic: {
      monthly: import.meta.env.VITE_DODO_BASIC_MONTHLY_LINK,
      yearly: import.meta.env.VITE_DODO_BASIC_YEARLY_LINK,
    },
    pro: {
      monthly: import.meta.env.VITE_DODO_PRO_MONTHLY_LINK,
      yearly: import.meta.env.VITE_DODO_PRO_YEARLY_LINK,
    },
  };

  const plans = [
    {
      name: 'Basic',
      planKey: 'basic' as const,
      icon: Zap,
      monthlyPrice: 9.99,
      yearlyPrice: 6.49,
      yearlyTotal: 77.88,
      discount: 35,
      description: 'Perfect for individuals and small projects',
      features: [
        '20 Migrations / Month',
        'All platform support',
        'No Watermark',
        'Fast Conversion Speed',
        'Email Support',
        'Validation Reports'
      ],
    },
    {
      name: 'Pro',
      planKey: 'pro' as const,
      icon: Crown,
      monthlyPrice: 33.33,
      yearlyPrice: 19.99,
      yearlyTotal: 239.88,
      discount: 40,
      popular: true,
      description: 'For teams and power users',
      features: [
        'Unlimited Migrations',
        'All platform support',
        'Priority Conversion',
        'Advanced Analytics',
        'Priority Support',
        'API Access',
        'Team Collaboration',
        'Custom Integrations'
      ],
    },
  ];

  const handleCheckout = (planKey: 'basic' | 'pro', planName: string) => {
  const checkoutLink = isYearly ? checkoutLinks[planKey].yearly : checkoutLinks[planKey].monthly;

  if (!checkoutLink || checkoutLink === 'undefined') {
    alert('Checkout link not configured. Please add it to environment variables.');
    return;
  }

  if (!user) {
    alert('Please sign in to purchase a plan.');
    return;
  }

  setLoading(planName);

  // Add redirect URLs as query parameters
  const url = new URL(checkoutLink);
  url.searchParams.append('success_url', `${window.location.origin}/payment-success`);
  url.searchParams.append('cancel_url', `${window.location.origin}/billing`);
  url.searchParams.append('customer_email', user.email || '');
  
  // Optional: Add metadata for tracking
  url.searchParams.append('metadata[user_id]', user.id);
  url.searchParams.append('metadata[plan]', planName);
  url.searchParams.append('metadata[billing_period]', isYearly ? 'yearly' : 'monthly');

  window.location.href = url.toString();
};
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Pricing tailored to your needs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The first 10 credits are on us. If you love it, then help us run the company with a paid plan.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex bg-white rounded-lg border-2 border-gray-300 p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                !isYearly
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                isYearly
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              {isYearly && '✓ '}Yearly billing
            </button>
          </div>
          
          {isYearly && (
            <div className="mt-4 flex items-center gap-2 text-gray-700">
              <div className="text-2xl">↑</div>
              <p className="font-medium">Get 2 months free when paying yearly.</p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isLoading = loading === plan.name;
            const isCurrentPlan = subscription.plan === plan.planKey;
            
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${
                  isCurrentPlan
                    ? 'border-green-500 shadow-2xl'
                    : plan.popular
                    ? 'border-blue-500 shadow-2xl'
                    : 'border-gray-300 shadow-lg'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                {!isCurrentPlan && plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    isCurrentPlan ? 'bg-green-100' : plan.popular ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    <Icon
                      className={isCurrentPlan ? 'text-green-600' : plan.popular ? 'text-blue-600' : 'text-orange-600'}
                      size={32}
                    />
                  </div>

                  <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="text-3xl font-black text-gray-900">{plan.name}</h3>
                    {isYearly && (
                      <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        save {plan.discount}%
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-5xl font-black text-gray-900">${price}</span>
                    <span className="text-xl text-gray-600 ml-2">/month</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4">
                    {isYearly ? '(*billed yearly)' : '(*billed monthly)'}
                  </p>
                  
                  <p className="text-gray-600 font-medium">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.planKey, plan.name)}
                  disabled={isLoading || isCurrentPlan}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg disabled:bg-blue-400'
                      : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Redirecting...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Get Started'
                  )}
                </button>

                {isYearly && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    ${plan.yearlyTotal} billed yearly
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Plan Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 text-gray-900 font-bold">Feature</th>
                  <th className="text-center py-3 px-4 text-gray-900 font-bold">Basic</th>
                  <th className="text-center py-3 px-4 text-gray-900 font-bold">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">Migrations per month</td>
                  <td className="text-center py-3 px-4">20</td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Infinity size={20} className="text-blue-500" />
                      Unlimited
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">Platform support</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">Conversion speed</td>
                  <td className="text-center py-3 px-4">Fast</td>
                  <td className="text-center py-3 px-4 text-blue-600 font-semibold">Priority</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">Support</td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4 text-blue-600 font-semibold">Priority</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">API Access</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Free Trial Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">
            Start with 10 free migrations
          </h2>
          <p className="text-blue-100 text-lg mb-6">
            No credit card required. Start converting workflows right now.
          </p>
        </div>
      </div>
    </div>
  );
};
