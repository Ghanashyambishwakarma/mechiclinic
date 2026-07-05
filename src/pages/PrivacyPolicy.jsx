import SEO from '../components/SEO';
import { CLINIC_NAME } from '../lib/constants';

const PrivacyPolicy = () => (
  <>
    <SEO title="Privacy Policy" description={`Privacy Policy for ${CLINIC_NAME}`} />
    <div className="pt-32 pb-24 gradient-bg-soft min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-strong p-8 md:p-12">
          <h1 className="section-title mb-8">Privacy Policy</h1>
          <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">1. Information We Collect</h2>
              <p>{CLINIC_NAME} collects personal information you provide when booking appointments, including your name, phone number, email address, and medical notes. We also collect usage data when you visit our website.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2. How We Use Your Information</h2>
              <p>We use your information to schedule and manage appointments, provide medical services, communicate with you about your care, and improve our services.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal and medical information. All data is stored securely using industry-standard encryption through Firebase services.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">4. Data Sharing</h2>
              <p>We do not sell or share your personal information with third parties except as required by law or with your explicit consent for medical referrals.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information. Contact us at info@mechiclinic.com to exercise these rights.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6. Contact Us</h2>
              <p>For privacy-related inquiries, please contact {CLINIC_NAME} at info@mechiclinic.com or visit our clinic.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default PrivacyPolicy;
