import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const ContactSection = () => {
  const { settings } = useSettings();
  const { contact, openingHours } = settings;

  return (
    <section id="contact" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Contact
          </span>
          <h2 className="section-title mt-2 mb-4">Get In Touch</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="glass-card flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Address</h3>
                <p className="text-slate-600 dark:text-slate-400">{contact?.address}</p>
              </div>
            </div>

            <div className="glass-card flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Phone</h3>
                <a href={`tel:${contact?.phone}`} className="text-clinic-teal hover:underline">{contact?.phone}</a>
              </div>
            </div>

            <div className="glass-card flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
                <a href={`mailto:${contact?.email}`} className="text-clinic-teal hover:underline">{contact?.email}</a>
              </div>
            </div>

            <div className="glass-card flex items-start gap-4 border-red-500/20 bg-red-500/5">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">Emergency Contact</h3>
                <a href={`tel:${contact?.emergency}`} className="text-red-600 dark:text-red-400 font-bold text-lg">
                  {contact?.emergency}
                </a>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-clinic-teal" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Opening Hours</h3>
              </div>
              <ul className="space-y-2">
                {(Array.isArray(openingHours) ? openingHours : Object.values(openingHours || {})).map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{item?.day}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{item?.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-0 overflow-hidden h-[500px]"
          >
            <iframe
              title="Mechi Clinic Location"
              src={contact?.mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
