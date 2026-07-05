import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import Logo from '../Logo';
import { useSettings } from '../../context/SettingsContext';
import { CLINIC_NAME } from '../../lib/constants';

const Footer = () => {
  const { settings } = useSettings();
  const { contact, social, footer, openingHours } = settings;

  const socialLinks = [
    { icon: Facebook, href: social?.facebook, label: 'Facebook' },
    { icon: Twitter, href: social?.twitter, label: 'Twitter' },
    { icon: Instagram, href: social?.instagram, label: 'Instagram' },
    { icon: Linkedin, href: social?.linkedin, label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Logo size="sm" light />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              {footer?.description || `${CLINIC_NAME} - Trusted Healthcare for Every Family.`}
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-clinic-teal transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ) : null
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {['About', 'Services', 'Doctors', 'Gallery', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="hover:text-primary-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/privacy-policy" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-sm">
              {(Array.isArray(openingHours) ? openingHours : Object.values(openingHours || {})).map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item?.day}</span>
                  <span className="text-slate-400">{item?.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>{contact?.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href={`tel:${contact?.phone}`} className="hover:text-primary-400">{contact?.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href={`mailto:${contact?.email}`} className="hover:text-primary-400">{contact?.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          {footer?.copyright || `© ${new Date().getFullYear()} ${CLINIC_NAME}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
