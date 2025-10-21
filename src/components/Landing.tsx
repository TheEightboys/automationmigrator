import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, CheckCircle, Workflow, BarChart3, Sparkles, RefreshCw, Check, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isYearly, setIsYearly] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const plans = [
    {
      name: 'Basic',
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
      popular: false,
      color: 'orange'
    },
    {
      name: 'Pro',
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
      color: 'blue'
    },
  ];

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto text-orange-500 animate-spin mb-4" size={48} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <Zap className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">migromat</span>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm font-semibold text-orange-600 mb-8">
            <Sparkles size={16} />
            AI-Powered Workflow Migration
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Convert Workflows Between<br />
            <span className="text-orange-500">Any Platform</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Seamlessly migrate your automation workflows between Zapier, n8n, and Make.
            Save hours of manual work with intelligent conversion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-orange-500 text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              Start Converting Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-xl border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-1"
            >
              View Pricing
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '3', label: 'Platforms' },
              { value: '95%', label: 'Accuracy' },
              { value: '10x', label: 'Faster' }
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-2xl transform hover:scale-105 transition-all"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.2 + index * 0.1}s both` }}
              >
                <div className="text-4xl font-black text-orange-500 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { name: 'Zapier', letter: 'Z', color: 'bg-orange-500', delay: '0s' },
              { name: 'n8n', letter: 'n8n', color: 'bg-pink-500', delay: '0.2s' },
              { name: 'Make', letter: 'M', color: 'bg-purple-500', delay: '0.4s' }
            ].map((platform, index) => (
              <React.Fragment key={index}>
                <div
                  className="flex flex-col items-center gap-3"
                  style={{ animation: `float 3s ease-in-out ${platform.delay} infinite` }}
                >
                  <div className={`w-20 h-20 ${platform.color} rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-6 transition-all`}>
                    <span className="text-3xl font-bold text-white">{platform.letter}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{platform.name}</span>
                </div>
                {index < 2 && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="text-orange-500 animate-spin-slow" size={24} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Choose migromat?
            </h2>
            <p className="text-xl text-gray-600">
              The smartest way to migrate automation workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Smart Conversion',
                description: 'AI-powered mapping automatically converts nodes, triggers, and actions between platforms with 95% accuracy',
                color: 'bg-blue-500'
              },
              {
                icon: Workflow,
                title: 'Multi-Platform',
                description: 'Convert between Zapier, n8n, and Make in any direction. Upload once, export to multiple platforms',
                color: 'bg-green-500'
              },
              {
                icon: BarChart3,
                title: 'Validation Reports',
                description: 'Get detailed reports showing mapped and unmapped steps with actionable warnings and suggestions',
                color: 'bg-purple-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl transition-all transform hover:-translate-y-2"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.2 + index * 0.1}s both` }}
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Pricing tailored to your needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              The first 10 migrations are on us. If you love it, upgrade to unlock more.
            </p>

            {/* Billing Toggle */}
            <div className="flex flex-col items-center mb-8">
              <div className="inline-flex bg-white rounded-lg border-2 border-gray-300 p-1">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    !isYearly ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Monthly billing
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isYearly ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
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
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-8 border-2 transition-all transform hover:-translate-y-2 hover:shadow-2xl ${
                    plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-300 shadow-lg'
                  }`}
                  style={{ animation: `fadeInUp 0.6s ease-out ${0.2 + index * 0.1}s both` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`inline-flex p-3 rounded-xl mb-4 ${
                      plan.popular ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      <Icon className={plan.popular ? 'text-blue-600' : 'text-orange-600'} size={32} />
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
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleGetStarted}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                      plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Get Started
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

          {/* Free Trial Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto mt-12">
            <h2 className="text-3xl font-bold mb-3">
              Start with 10 free migrations
            </h2>
            <p className="text-blue-100 text-lg">
              No credit card required. Start converting workflows right now.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-3xl p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-4">
              Supported Platforms
            </h2>
            <p className="text-center text-gray-300 mb-12 text-lg">
              Convert workflows seamlessly between these automation platforms
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Zapier', letter: 'Z', color: 'bg-orange-500', desc: 'Popular no-code automation' },
                { name: 'n8n', letter: 'n8n', color: 'bg-pink-500', desc: 'Open-source workflow automation' },
                { name: 'Make', letter: 'M', color: 'bg-purple-500', desc: 'Visual automation platform' }
              ].map((platform, index) => (
                <div
                  key={index}
                  className="text-center group"
                  style={{ animation: `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both` }}
                >
                  <div className={`w-32 h-32 mx-auto ${platform.color} rounded-3xl flex items-center justify-center mb-4 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <span className="text-5xl font-bold text-white">{platform.letter}</span>
                  </div>
                  <h3 className="font-bold text-2xl text-white mb-2">{platform.name}</h3>
                  <p className="text-gray-400">{platform.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to convert your workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload Workflow', desc: 'Export your workflow as JSON from your current platform' },
              { step: '2', title: 'Select Target', desc: 'Choose which platform(s) you want to convert to' },
              { step: '3', title: 'Download & Import', desc: 'Get converted workflows ready to import' }
            ].map((item, index) => (
              <div
                key={index}
                className="relative"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.2 + index * 0.1}s both` }}
              >
                <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-orange-500 transition-all transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-orange-500" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-500 rounded-3xl p-12 md:p-16 text-center shadow-2xl transform hover:scale-105 transition-all">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to Start Converting?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join developers and automation experts saving hours on workflow migrations
            </p>
            <button
              onClick={handleGetStarted}
              className="group px-10 py-5 bg-white text-orange-500 text-xl font-black rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-2xl flex items-center gap-2 mx-auto"
            >
              Get Started Now
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">migromat</span>
            </div>
            <p className="text-gray-600">
              © 2025 migromat. Convert workflows with confidence.
            </p>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
