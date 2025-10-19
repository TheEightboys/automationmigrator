import React from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Billing: React.FC = () => {
  const { profile } = useAuth();

  const plans = [
    {
      name: 'Free',
      icon: Zap,
      price: '$0',
      period: 'forever',
      current: profile?.subscription_tier === 'free',
      features: [
        '5 migrations per month',
        'Basic conversion engine',
        'Community support',
        'Standard processing speed',
      ],
    },
    {
      name: 'Pro',
      icon: Crown,
      price: '$29',
      period: 'per month',
      popular: true,
      current: profile?.subscription_tier === 'pro',
      features: [
        'Unlimited migrations',
        'Advanced AI conversion',
        'Priority support',
        'Fast processing',
        'Custom agents',
        'API access',
      ],
    },
    {
      name: 'Enterprise',
      icon: Rocket,
      price: '$99',
      period: 'per month',
      current: profile?.subscription_tier === 'enterprise',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'Team collaboration',
        'Advanced analytics',
        'White-label option',
      ],
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-600 mt-1">Choose the plan that works best for you</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Current Plan</h3>
            <p className="text-blue-800 text-lg font-bold capitalize">
              {profile?.subscription_tier || 'Free'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-700">Next billing date</p>
            <p className="text-blue-900 font-semibold">N/A</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 relative ${
                plan.popular
                  ? 'border-blue-500 shadow-lg'
                  : plan.current
                  ? 'border-green-500'
                  : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6 mt-2">
                <div
                  className={`inline-flex p-3 rounded-xl mb-4 ${
                    plan.popular
                      ? 'bg-blue-100'
                      : plan.current
                      ? 'bg-green-100'
                      : 'bg-slate-100'
                  }`}
                >
                  <Icon
                    className={
                      plan.popular
                        ? 'text-blue-600'
                        : plan.current
                        ? 'text-green-600'
                        : 'text-slate-600'
                    }
                    size={32}
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600 text-sm ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.current}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl p-8 text-white">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Ready to integrate payments?</h2>
          <p className="text-slate-200 mb-6">
            To enable payment processing with Stripe, you'll need to configure your Stripe
            account and add your API keys. The payment system is ready to be integrated.
          </p>
          <a
            href="https://bolt.new/setup/stripe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Setup Stripe Integration
          </a>
        </div>
      </div>
    </div>
  );
};
