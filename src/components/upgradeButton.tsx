import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

interface UpgradeButtonProps {
  variant?: 'default' | 'compact' | 'sidebar';
  showCredits?: boolean;
  className?: string;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({ 
  variant = 'default',
  showCredits = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const { subscription, usage } = useSubscription();

  const handleUpgrade = () => {
    navigate('/dashboard');
    setTimeout(() => {
      const billingTab = document.querySelector('[data-view="billing"]');
      if (billingTab) {
        (billingTab as HTMLElement).click();
      }
    }, 100);
  };

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        {showCredits && (
          <div className="text-center text-sm text-slate-600">
            <span className="font-semibold text-slate-900">
              {usage?.remaining || 10} Credits left
            </span>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpgrade}
          className={`w-full relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all ${className}`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles size={18} />
            Upgrade Plan
          </span>
        </motion.button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUpgrade}
        className={`relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2">
          <Crown size={18} />
          Upgrade
        </span>
      </motion.button>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg ${className}`}>
      {showCredits && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">
              {usage?.remaining || 10} Credits left
            </span>
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleUpgrade}
        className="w-full relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-xl" />
        <div className="relative z-10 flex items-center justify-center gap-2 px-6 py-4 text-white font-bold text-lg">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Crown size={22} />
          </motion.div>
          Upgrade Plan
          <Sparkles size={18} />
        </div>
      </motion.button>

      <p className="text-center text-xs text-slate-500 mt-3">
        Get unlimited migrations and premium features
      </p>
    </div>
  );
};
