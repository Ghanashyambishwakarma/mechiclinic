import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';

const FAQSection = () => {
  const { data: faqs } = useCollection(COLLECTIONS.FAQ, 'order', 'asc');
  const [openId, setOpenId] = useState(null);

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="section-title mt-2 mb-4">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card cursor-pointer"
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white pr-4">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
