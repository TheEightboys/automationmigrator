import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, CheckCircle, Workflow, BarChart3, Sparkles, RefreshCw, Check, Crown, Menu, X, Code, Rocket, Infinity, Zap as Lightning, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'how-it-works', label: 'How It Works' },
  ];

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
        'Python Code Generation',
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
        'Unlimited Python Generation',
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <Zap className="text-white" size={24} />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900">migromat</span>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-slate-700 hover:text-orange-500 font-medium transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            <button
              onClick={handleGetStarted}
              className="hidden lg:flex px-6 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Launch App
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <nav className="px-4 py-4 border-t border-gray-200 bg-white space-y-1">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-4 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-all"
              >
                {item.label}
              </button>
            ))}
            <button onClick={handleGetStarted} className="w-full mt-2 px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold">
              Launch App
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm font-semibold text-orange-600 mb-8">
            <Sparkles size={16} />
            Workflow Migration + Python Automation
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
           Learn one &<br />
            <span className="text-orange-500">Automate everwhere</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            Migrate workflows between Zapier, n8n, Make <span className="font-bold">AND</span> generate production-ready Python code when platforms can't handle complexity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4">
            <button
              onClick={handleGetStarted}
              className="group w-full sm:w-auto px-8 py-4 bg-orange-500 text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Converting Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-xl border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-1"
            >
              View Pricing
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto px-4">
            {[
              { value: '3', label: 'Platforms', icon: Workflow },
              { value: '∞', label: 'Python Scale', icon: Infinity },
              { value: '95%', label: 'Accuracy', icon: CheckCircle },
              { value: '10x', label: 'Faster', icon: Lightning }
            ].map((stat, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 bg-gray-50 rounded-2xl transform hover:scale-105 transition-all"
              >
                <stat.icon className="mx-auto text-orange-500 mb-2" size={32} />
                <div className="text-3xl sm:text-4xl font-black text-orange-500 mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Icons */}
        <div className="mt-20">
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap px-4">
            {[
              { name: 'Zapier', letter: 'Z', color: 'bg-orange-500', delay: '0s' },
              { name: 'n8n', letter: 'n8n', color: 'bg-pink-500', delay: '0.2s' },
              { name: 'Make', letter: 'M', color: 'bg-purple-500', delay: '0.4s' },
              { name: 'Python', letter: 'Py', color: 'bg-blue-600', delay: '0.6s' }
            ].map((platform, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center gap-3" style={{ animation: `float 3s ease-in-out ${platform.delay} infinite` }}>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 ${platform.color} rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-6 transition-all`}>
                    <span className="text-2xl sm:text-3xl font-bold text-white">{platform.letter}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600">{platform.name}</span>
                </div>
                {index < 3 && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="text-orange-500 animate-spin-slow" size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Updated with Python */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Two Powerful Tools, One Platform
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Everything you need for workflow automation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Workflow Migration */}
            <div className="bg-white p-8 rounded-2xl border-2 border-orange-500 shadow-xl">
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Workflow className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Workflow Migration</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Convert workflows between Zapier, n8n, and Make with intelligent mapping. Perfect for platform migrations and multi-platform deployments.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="text-green-500" size={18} />
                  <span className="text-sm">Bidirectional conversion (any to any)</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="text-green-500" size={18} />
                  <span className="text-sm">70+ app mappings included</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="text-green-500" size={18} />
                  <span className="text-sm">95% accurate conversion</span>
                </li>
              </ul>
            </div>

            {/* Python Code Generation */}
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 shadow-xl">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Code className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Python Code Generator</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                When n8n/Zapier/Make hit their limits, generate production-ready Python code that scales infinitely. No more workflow restrictions!
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="text-green-500" size={18} />
                  <span className="text-sm">Async/await for 10x speed</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="text-green-500" size={18} />
                  <span className="text-sm">Handle 100+ nodes (unlimited)</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="text-green-500" size={18} />
                  <span className="text-sm">Production-grade with auto-retry</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: 'No Platform Limits',
                description: 'Break free from n8n node limits. Python handles unlimited complexity with async processing and custom logic.',
                color: 'bg-blue-500'
              },
              {
                icon: Database,
                title: 'Smart Mapping',
                description: 'AI-powered conversion automatically maps Gmail, Slack, Trello, and 70+ apps between platforms with validation.',
                color: 'bg-green-500'
              },
              {
                icon: BarChart3,
                title: 'Production Ready',
                description: 'Generated Python includes error handling, retry logic, rate limiting, and detailed logging for enterprise use.',
                color: 'bg-purple-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl transition-all transform hover:-translate-y-2"
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get both workflow migration AND Python generation in one plan
            </p>

            {/* Billing Toggle */}
            <div className="flex flex-col items-center mb-8">
              <div className="inline-flex bg-white rounded-lg border-2 border-gray-300 p-1">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    !isYearly ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Monthly billing
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    isYearly ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {isYearly && '✓ '}Yearly billing
                </button>
              </div>
              {isYearly && (
                <div className="mt-4 flex items-center gap-2 text-gray-700">
                  <div className="text-2xl">↑</div>
                  <p className="font-medium text-sm sm:text-base">Get 2 months free when paying yearly.</p>
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
                  className={`relative bg-white rounded-2xl p-6 sm:p-8 border-2 transition-all transform hover:-translate-y-2 hover:shadow-2xl ${
                    plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-300 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`inline-flex p-3 rounded-xl mb-4 ${plan.popular ? 'bg-blue-100' : 'bg-orange-100'}`}>
                      <Icon className={plan.popular ? 'text-blue-600' : 'text-orange-600'} size={32} />
                    </div>

                    <div className="flex items-baseline gap-3 mb-4">
                      <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{plan.name}</h3>
                      {isYearly && (
                        <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          save {plan.discount}%
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-4xl sm:text-5xl font-black text-gray-900">${price}</span>
                      <span className="text-lg sm:text-xl text-gray-600 ml-2">/month</span>
                    </div>
                    
                    <p className="text-gray-500 text-xs sm:text-sm mb-4">
                      {isYearly ? '(*billed yearly)' : '(*billed monthly)'}
                    </p>
                    
                    <p className="text-gray-600 font-medium text-sm sm:text-base">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleGetStarted}
                    className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all ${
                      plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Get Started
                  </button>

                  {isYearly && (
                    <p className="text-center text-xs sm:text-sm text-gray-500 mt-3">
                      ${plan.yearlyTotal} billed yearly
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Updated */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Choose your path: Migrate workflows OR generate Python code
            </p>
          </div>

          {/* Workflow Migration Path */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              <Workflow className="inline-block mr-2 text-orange-500" size={28} />
              Workflow Migration
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Upload JSON', desc: 'Export workflow from Zapier, n8n, or Make' },
                { step: '2', title: 'Select Target', desc: 'Choose destination platform(s)' },
                { step: '3', title: 'Download & Import', desc: 'Get converted workflow ready to use' }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-orange-500 transition-all">
                    <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
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

          {/* Python Generation Path */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              <Code className="inline-block mr-2 text-blue-600" size={28} />
              Python Code Generation
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Upload Workflow', desc: 'Upload your complex n8n/Zapier workflow' },
                { step: '2', title: 'Generate Code', desc: 'Get production-ready async Python code' },
                { step: '3', title: 'Run Anywhere', desc: 'Deploy on servers, cloud, or local - unlimited scale' }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-600 transition-all">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="text-blue-600" size={32} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-500 rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-2xl transform hover:scale-105 transition-all">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Ready to Scale Your Automation?
            </h2>
            <p className="text-lg sm:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Migrate workflows between platforms AND generate unlimited Python code
            </p>
            <button
              onClick={handleGetStarted}
              className="group px-8 sm:px-10 py-4 sm:py-5 bg-white text-orange-500 text-lg sm:text-xl font-black rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-2xl inline-flex items-center gap-2"
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
            <p className="text-gray-600 text-sm sm:text-base text-center">
              © 2025 migromat. Workflow migration + Python automation.
            </p>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
