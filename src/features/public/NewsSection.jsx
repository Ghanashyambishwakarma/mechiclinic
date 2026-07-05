import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';
import { formatDate } from '../../lib/utils';
import { SkeletonCard } from '../../components/ui/Skeleton';

const NewsSection = () => {
  const { data: news, loading } = useCollection(COLLECTIONS.NEWS, 'publishedAt', 'desc');

  return (
    <section id="news" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            News
          </span>
          <h2 className="section-title mt-2 mb-4">Latest News</h2>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card group overflow-hidden p-0"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.publishedAt)}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {item.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-clinic-teal text-sm font-medium group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
