import { motion } from 'framer-motion';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';
import { SkeletonCard } from '../../components/ui/Skeleton';

const DoctorsSection = () => {
  const { data: doctors, loading } = useCollection(COLLECTIONS.DOCTORS, 'name', 'asc');

  return (
    <section id="doctors" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Our Team
          </span>
          <h2 className="section-title mt-2 mb-4">Expert Doctors</h2>
          <p className="section-subtitle mx-auto">
            Meet our team of experienced and compassionate healthcare professionals.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.filter((d) => d.active !== false).map((doctor, idx) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass-card text-center group overflow-hidden p-0"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={doctor.photoUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'}
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6 -mt-8 relative">
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                    {doctor.name}
                  </h3>
                  <p className="text-clinic-teal text-sm font-medium">{doctor.qualification}</p>
                  <p className="text-slate-500 text-xs mt-1">{doctor.department} • {doctor.experience} yrs</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorsSection;
