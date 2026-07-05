import { setDocument, createDocument, logActivity, getCollectionRef } from './firestore';
import { COLLECTIONS, DEFAULT_SETTINGS } from './constants';

const MOCK_DEPARTMENTS = [
  { name: 'General Medicine', description: 'Comprehensive primary care services for all age groups.', icon: 'Building2' },
  { name: 'Cardiology', description: 'Expert heart health diagnostics, therapies, and consultations.', icon: 'Heart' },
  { name: 'Pediatrics', description: 'Caring medical treatment for newborns, children, and teens.', icon: 'Baby' },
  { name: 'Orthopedics', description: 'Specialized bone, joint, and muscular-skeletal care.', icon: 'Bone' }
];

const MOCK_DOCTORS = [
  {
    name: 'Dr. Ramesh Thapa',
    qualification: 'MD - Internal Medicine, MBBS',
    experience: '12 Years',
    departmentId: 'General Medicine', // Will map or display directly
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    times: ['09:00 AM - 01:00 PM', '04:00 PM - 07:00 PM'],
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop',
    bio: 'Dr. Ramesh Thapa is a senior general physician specializing in chronic disease management and family health care at Mechi Clinic.'
  },
  {
    name: 'Dr. Sita Koirala',
    qualification: 'MD - Pediatrics, MBBS',
    experience: '9 Years',
    departmentId: 'Pediatrics',
    days: ['Mon', 'Wed', 'Fri'],
    times: ['10:00 AM - 02:00 PM'],
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=400&auto=format&fit=crop',
    bio: 'Dr. Sita is passionate about pediatric care, providing compassionate medical support for infants and developmental growth monitoring.'
  },
  {
    name: 'Dr. Anil Sharma',
    qualification: 'DM - Cardiology, MD',
    experience: '15 Years',
    departmentId: 'Cardiology',
    days: ['Tue', 'Thu', 'Sat'],
    times: ['11:00 AM - 04:00 PM'],
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop',
    bio: 'Dr. Anil Sharma is a board-certified cardiologist specializing in preventive cardiology and cardiovascular scan interpretations.'
  }
];

const MOCK_SERVICES = [
  { name: 'General Consultation', description: 'Routine checkups, physical examinations, and general health prescription.', icon: 'Stethoscope', price: 500, order: 1, active: true },
  { name: 'Pediatric Care & Vaccination', description: 'Infant health diagnostics, developmental growth track, and immunizations.', icon: 'Baby', price: 800, order: 2, active: true },
  { name: 'ECG & Cardiology Diagnostics', description: 'Electrocardiogram testing and heart health scans with specialist evaluation.', icon: 'Heart', price: 1200, order: 3, active: true },
  { name: 'Orthopedic Consultation', description: 'Bone and joint care, arthritis management, and fracture rehabilitation planning.', icon: 'Bone', price: 600, order: 4, active: true }
];

const MOCK_TESTIMONIALS = [
  { name: 'Hari Prasad', role: 'Patient', comment: 'Mechi Clinic has become our family doctor. Dr. Ramesh is extremely knowledgeable and the clinic is clean and modern.', rating: 5, photoUrl: '' },
  { name: 'Saraswati Adhikari', role: 'Mother', comment: 'I brought my toddler to Dr. Sita for vaccination. She made the process so easy and stress-free. Highly recommend Pediatrics!', rating: 5, photoUrl: '' }
];

const MOCK_FAQS = [
  { question: 'What are Mechi Clinic opening hours?', answer: 'We are open Monday to Friday from 8:00 AM to 8:00 PM, Saturday from 9:00 AM to 2:00 PM. Emergency services are operational 24/7.', order: 1 },
  { question: 'How can I book an appointment?', answer: 'You can book an appointment online via our website home page using the "Book Appointment" form, or call us directly at +977-9800000000.', order: 2 },
  { question: 'Do you offer lab services?', answer: 'Yes, we have an in-house laboratory providing blood tests, urine tests, ECG, and other diagnostic checkups with fast report deliveries.', order: 3 }
];

const MOCK_NEWS = [
  { title: 'Free Health Camp in Bhadrapur', excerpt: 'Mechi Clinic is organizing a free family wellness camp this Saturday.', content: 'Mechi Clinic is proud to announce a free wellness medical camp in Bhadrapur, Jhapa. Free general physician checkups, blood sugar checkups, and pediatric counseling will be available.', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop', publishedAt: new Date().toISOString() },
  { title: 'Flu Vaccination Drive Started', excerpt: 'Protect your family from seasonal flu. Flu shots now available.', content: 'Seasonal flu cases are rising. Protect children and seniors by booking a vaccination appointment. We provide WHO-approved seasonal influenza vaccines at subsidised rates.', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop', publishedAt: new Date().toISOString() }
];

const MOCK_GALLERY = [
  { title: 'Modern Consultation Room', imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop', category: 'facilities' },
  { title: 'Reception & Waiting Area', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop', category: 'facilities' },
  { title: 'Diagnostic Laboratory', imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351167?w=600&auto=format&fit=crop', category: 'equipment' }
];

export const seedSampleData = async (userEmail) => {
  try {
    // 1. Seed Website & Clinic Settings
    await setDocument(COLLECTIONS.SETTINGS, 'website', DEFAULT_SETTINGS);
    await logActivity('seed_settings', COLLECTIONS.SETTINGS, 'website', userEmail);

    const defaultClinicSettings = {
      clinicName: DEFAULT_SETTINGS.clinicName || 'Mechi Clinic',
      tagline: DEFAULT_SETTINGS.tagline || 'Trusted Healthcare for Every Family',
      currency: 'NPR',
      defaultTaxPercent: 0,
      invoicePrefix: 'MC',
      lowStockThreshold: 10,
      expiryAlertDays: 30,
      appointmentReminderEmail: userEmail || 'admin@gmail.com',
    };
    await setDocument(COLLECTIONS.SETTINGS, 'clinic', defaultClinicSettings);
    await logActivity('seed_settings', COLLECTIONS.SETTINGS, 'clinic', userEmail);

    // 2. Seed Departments
    for (const dep of MOCK_DEPARTMENTS) {
      // Use name as docId for simpler mapping
      const id = dep.name;
      await setDocument(COLLECTIONS.DEPARTMENTS, id, dep);
    }
    await logActivity('seed_departments', COLLECTIONS.DEPARTMENTS, 'bulk', userEmail);

    // 3. Seed Doctors
    for (const doc of MOCK_DOCTORS) {
      await createDocument(COLLECTIONS.DOCTORS, doc);
    }
    await logActivity('seed_doctors', COLLECTIONS.DOCTORS, 'bulk', userEmail);

    // 4. Seed Services
    for (const ser of MOCK_SERVICES) {
      await createDocument(COLLECTIONS.SERVICES, ser);
    }
    await logActivity('seed_services', COLLECTIONS.SERVICES, 'bulk', userEmail);

    // 5. Seed Testimonials
    for (const tes of MOCK_TESTIMONIALS) {
      await createDocument(COLLECTIONS.TESTIMONIALS, tes);
    }
    await logActivity('seed_testimonials', COLLECTIONS.TESTIMONIALS, 'bulk', userEmail);

    // 6. Seed FAQs
    for (const faq of MOCK_FAQS) {
      await createDocument(COLLECTIONS.FAQ, faq);
    }
    await logActivity('seed_faqs', COLLECTIONS.FAQ, 'bulk', userEmail);

    // 7. Seed News
    for (const n of MOCK_NEWS) {
      await createDocument(COLLECTIONS.NEWS, n);
    }
    await logActivity('seed_news', COLLECTIONS.NEWS, 'bulk', userEmail);

    // 8. Seed Gallery
    for (const g of MOCK_GALLERY) {
      await createDocument(COLLECTIONS.GALLERY, g);
    }
    await logActivity('seed_gallery', COLLECTIONS.GALLERY, 'bulk', userEmail);

    return true;
  } catch (error) {
    console.error('Failed to seed sample data:', error);
    throw error;
  }
};
