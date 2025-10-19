import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, CheckCircle, Workflow, BarChart3, Sparkles, RefreshCw, Check } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
              onClick={() => navigate('/dashboard')}
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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm font-semibold text-orange-600 mb-8">
            <Sparkles size={16} />
            AI-Powered Workflow Migration
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Convert Workflows Between<br />
            <span className="text-orange-500">Any Platform</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Seamlessly migrate your automation workflows between Zapier, n8n, and Make.
            Save hours of manual work with intelligent conversion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="group px-8 py-4 bg-orange-500 text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              Start Converting Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-xl border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-1"
            >
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '3', label: 'Platforms' },
              { value: '95%', label: 'Accuracy' },
              { value: '10x', label: 'Faster' }
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-2xl transform hover:scale-105 transition-all"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${0.2 + index * 0.1}s both` 
                }}
              >
                <div className="text-4xl font-black text-orange-500 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Animation */}
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

      {/* Supported Platforms */}
      <section className="py-20">
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
      <section className="bg-gray-50 py-20">
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-500 rounded-3xl p-12 md:p-16 text-center shadow-2xl transform hover:scale-105 transition-all">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to Start Converting?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join developers and automation experts saving hours on workflow migrations
            </p>
            <button
              onClick={() => navigate('/dashboard')}
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
