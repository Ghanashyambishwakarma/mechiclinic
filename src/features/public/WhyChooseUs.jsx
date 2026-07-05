import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const WhyChooseUs = () => {
  const { settings } = useSettings();
  const { whyChooseUs } = settings;

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="section-title mt-2 mb-4">
            {whyChooseUs?.title || 'Why Choose Mechi Clinic'}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(whyChooseUs?.items || []).map((item, idx) => {
            const Icon = LucideIcons[item.icon] || LucideIcons.Star;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card text-center group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
