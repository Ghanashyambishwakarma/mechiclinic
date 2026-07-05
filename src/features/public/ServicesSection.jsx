import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';

const ServicesSection = () => {
  const { data: services, loading } = useCollection(COLLECTIONS.SERVICES, 'order', 'asc');

  return (
    <section id="services" className="py-24 gradient-bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Our Services
          </span>
          <h2 className="section-title mt-2 mb-4">Medical Services</h2>
          <p className="section-subtitle mx-auto">
            Comprehensive healthcare services tailored to meet your family&apos;s needs.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter((s) => s.active !== false).map((service, idx) => {
              const Icon = LucideIcons[service.icon] || LucideIcons.Stethoscope;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="glass-card group"
                >
                  <div className="w-12 h-12 mb-4 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-clinic-teal" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{service.description}</p>
                  {service.price && (
                    <span className="text-clinic-teal font-semibold">{formatCurrency(service.price)}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
