import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const AboutSection = () => {
  const { settings } = useSettings();
  const { about } = settings;

  return (
    <section id="about" className="py-24 gradient-bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
              About Us
            </span>
            <h2 className="section-title mt-2 mb-6">
              {about?.title || 'About Mechi Clinic'}
            </h2>
            <p className="section-subtitle mb-8">
              {about?.description || 'Mechi Clinic has been serving families with trusted healthcare for over a decade. Our team of experienced doctors and modern facilities ensure you receive the best medical care.'}
            </p>

            <div className="space-y-4">
              {(about?.features || []).map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4"
                >
                  <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass-card p-2">
              <img
                src={about?.imageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop'}
                alt="Mechi Clinic facility"
                className="w-full h-[400px] object-cover rounded-xl"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop'; }}
              />
            </div>
            <div className="absolute -bottom-6 -left-6 glass-strong p-6 rounded-2xl">
              <div className="font-display text-3xl font-bold text-clinic-teal">10+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Years of Excellence</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
