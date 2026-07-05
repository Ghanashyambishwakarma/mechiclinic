import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';
import { SkeletonCard } from '../../components/ui/Skeleton';

const GallerySection = () => {
  const { data: gallery, loading } = useCollection(COLLECTIONS.GALLERY, 'createdAt', 'desc');
  const [selected, setSelected] = useState(null);

  return (
    <section id="gallery" className="py-24 gradient-bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Gallery
          </span>
          <h2 className="section-title mt-2 mb-4">Clinic Gallery</h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ scale: 1.03 }}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setSelected(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 text-white font-medium text-sm">{item.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selected && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <img src={selected.imageUrl} alt={selected.title} className="max-w-4xl max-h-[90vh] rounded-2xl object-contain" />
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
