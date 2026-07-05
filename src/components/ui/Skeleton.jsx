import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="glass-card space-y-4">
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="flex gap-4">
        {Array.from({ length: cols }).map((_, col) => (
          <Skeleton key={col} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const LoadingScreen = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center gradient-bg">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30"
      >
        <Plus className="w-10 h-10 text-white" />
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Mechi Clinic</h2>
      <p className="text-white/70">Loading...</p>
    </motion.div>
  </div>
);

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full"
    />
  </div>
);

export default Skeleton;
