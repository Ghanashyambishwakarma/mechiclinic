import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';
import { SkeletonCard } from '../../components/ui/Skeleton';

const TestimonialsSection = () => {
  const { data: testimonials, loading } = useCollection(COLLECTIONS.TESTIMONIALS, 'createdAt', 'desc');

  return (
    <section className="py-24 gradient-bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="section-title mt-2 mb-4">What Our Patients Say</h2>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card relative"
              >
                <Quote className="w-10 h-10 text-primary-500/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 italic">&ldquo;{item.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {item.photoUrl && (
                    <img src={item.photoUrl} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
