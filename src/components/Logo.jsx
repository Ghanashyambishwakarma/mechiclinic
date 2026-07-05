import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { CLINIC_NAME } from '../lib/constants';

const Logo = ({ size = 'md', showText = true, light = false }) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${s.icon} rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/25`}
      >
        <Plus className="w-1/2 h-1/2 text-white" strokeWidth={3} />
      </motion.div>
      {showText && (
        <div>
          <h1 className={`font-display font-bold ${s.text} ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            {CLINIC_NAME}
          </h1>
        </div>
      )}
    </div>
  );
};

export default Logo;
