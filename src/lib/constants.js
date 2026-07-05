export const CLINIC_NAME = 'Mechi Clinic';
export const CLINIC_TAGLINE = 'Trusted Healthcare for Every Family';
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@gmail.com';

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const DUE_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  UNPAID: 'unpaid',
};

export const INVENTORY_CATEGORIES = ['medicine', 'equipment', 'supplies'];

export const PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'other'];

export const COLLECTIONS = {
  SETTINGS: 'settings',
  SERVICES: 'services',
  DOCTORS: 'doctors',
  DEPARTMENTS: 'departments',
  APPOINTMENTS: 'appointments',
  PATIENTS: 'patients',
  INVENTORY: 'inventory',
  BILLING: 'billing',
  DUES: 'dues',
  STAFF: 'staff',
  TESTIMONIALS: 'testimonials',
  GALLERY: 'gallery',
  NEWS: 'news',
  FAQ: 'faq',
  USERS: 'users',
  ACTIVITY_LOGS: 'activityLogs',
};

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Departments', href: '#departments' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'News', href: '#news' },
  { label: 'Contact', href: '#contact' },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Website Content', path: '/admin/content', icon: 'Globe' },
  { label: 'Services', path: '/admin/services', icon: 'Stethoscope' },
  { label: 'Doctors', path: '/admin/doctors', icon: 'UserRound' },
  { label: 'Departments', path: '/admin/departments', icon: 'Building2' },
  { label: 'Testimonials', path: '/admin/testimonials', icon: 'MessageSquare' },
  { label: 'Gallery', path: '/admin/gallery', icon: 'Images' },
  { label: 'FAQ', path: '/admin/faq', icon: 'HelpCircle' },
  { label: 'News', path: '/admin/news', icon: 'Newspaper' },
  { label: 'Appointments', path: '/admin/appointments', icon: 'Calendar' },
  { label: 'Patients', path: '/admin/patients', icon: 'Users' },
  { label: 'Inventory', path: '/admin/inventory', icon: 'Package' },
  { label: 'Billing', path: '/admin/billing', icon: 'Receipt' },
  { label: 'Customer Dues', path: '/admin/dues', icon: 'Wallet' },
  { label: 'Staff Management', path: '/admin/staff', icon: 'Shield' },
  { label: 'Reports & Analytics', path: '/admin/reports', icon: 'BarChart3' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings2' },
];

export const DEFAULT_SETTINGS = {
  clinicName: CLINIC_NAME,
  tagline: CLINIC_TAGLINE,
  hero: {
    title: 'Your Health, Our Priority',
    subtitle: 'Comprehensive healthcare services for you and your family with compassion and excellence.',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e37737a7fe?w=800&auto=format&fit=crop',
    ctaPrimary: 'Book Appointment',
    ctaSecondary: 'Learn More',
    stats: [
      { label: 'Happy Patients', value: '5000+' },
      { label: 'Experienced Doctors', value: '15+' },
      { label: 'Medical Services', value: '50+' },
      { label: 'Years of Experience', value: '10+' },
    ],
  },
  about: {
    title: 'About Mechi Clinic',
    description: 'Mechi Clinic has been serving families with trusted healthcare for over a decade. Our team of experienced doctors and modern facilities ensure you receive the best medical care.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
    features: [
      { title: 'Expert Doctors', description: 'Highly qualified specialists across multiple departments.' },
      { title: 'Modern Equipment', description: 'State-of-the-art diagnostic and treatment facilities.' },
      { title: 'Patient First', description: 'Compassionate care tailored to every patient.' },
    ],
  },
  whyChooseUs: {
    title: 'Why Choose Mechi Clinic',
    items: [
      { title: '24/7 Emergency Care', description: 'Round-the-clock emergency services for critical situations.', icon: 'HeartPulse' },
      { title: 'Affordable Pricing', description: 'Quality healthcare at transparent and fair prices.', icon: 'BadgeDollarSign' },
      { title: 'Advanced Technology', description: 'Latest medical equipment for accurate diagnosis.', icon: 'Microscope' },
      { title: 'Experienced Team', description: 'Board-certified doctors with years of experience.', icon: 'Award' },
    ],
  },
  facilities: {
    title: 'Our Facilities',
    items: [
      { title: 'ICU & Emergency', description: 'Fully equipped intensive care unit.', icon: 'Activity' },
      { title: 'Laboratory', description: 'Complete diagnostic lab services.', icon: 'FlaskConical' },
      { title: 'Pharmacy', description: 'In-house pharmacy with all medicines.', icon: 'Pill' },
      { title: 'Ambulance', description: '24/7 ambulance service available.', icon: 'Ambulance' },
    ],
  },
  contact: {
    phone: '+977-9800000000',
    email: 'info@mechiclinic.com',
    address: 'Mechi Highway, Bhadrapur, Jhapa, Nepal',
    emergency: '+977-9800000001',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.0!2d88.0!3d26.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDMwJzAwLjAiTiA4OMKwMDAnMDAuMCJF!5e0!3m2!1sen!2snp!4v1234567890',
  },
  openingHours: [
    { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 2:00 PM' },
    { day: 'Sunday', hours: 'Emergency Only' },
  ],
  social: {
    facebook: 'https://facebook.com/mechiclinic',
    twitter: 'https://twitter.com/mechiclinic',
    instagram: 'https://instagram.com/mechiclinic',
    linkedin: 'https://linkedin.com/company/mechiclinic',
  },
  footer: {
    description: 'Mechi Clinic is committed to providing trusted healthcare for every family in our community.',
    copyright: `© ${new Date().getFullYear()} Mechi Clinic. All rights reserved.`,
  },
};
