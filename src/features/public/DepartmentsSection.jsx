import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';
import { SkeletonCard } from '../../components/ui/Skeleton';

const DepartmentsSection = () => {
  const { data: departments, loading } = useCollection(COLLECTIONS.DEPARTMENTS, 'name', 'asc');

  return (
    <section id="departments" className="py-24 gradient-bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Departments
          </span>
          <h2 className="section-title mt-2 mb-4">Our Departments</h2>
          <p className="section-subtitle mx-auto">
            Specialized medical departments for comprehensive healthcare.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => {
              const Icon = LucideIcons[dept.icon] || LucideIcons.Building2;
              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">
                      {dept.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{dept.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default DepartmentsSection;
