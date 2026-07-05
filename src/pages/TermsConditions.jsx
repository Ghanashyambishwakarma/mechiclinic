import SEO from '../components/SEO';
import { CLINIC_NAME } from '../lib/constants';

const TermsConditions = () => (
  <>
    <SEO title="Terms & Conditions" description={`Terms and Conditions for ${CLINIC_NAME}`} />
    <div className="pt-32 pb-24 gradient-bg-soft min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-strong p-8 md:p-12">
          <h1 className="section-title mb-8">Terms & Conditions</h1>
          <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using the {CLINIC_NAME} website and services, you agree to be bound by these Terms and Conditions.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2. Medical Services</h2>
              <p>Our website provides information about our medical services and allows appointment booking. Online information does not constitute medical advice. Always consult with a qualified healthcare professional.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3. Appointments</h2>
              <p>Appointment bookings are subject to confirmation by our staff. We reserve the right to reschedule or cancel appointments due to unforeseen circumstances. Please arrive 15 minutes before your scheduled time.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">4. Payment Terms</h2>
              <p>Payment for services is due at the time of service unless other arrangements have been made. We accept cash, card, and other payment methods as displayed at our clinic.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5. Cancellation Policy</h2>
              <p>Please notify us at least 24 hours in advance if you need to cancel or reschedule your appointment. Repeated no-shows may result in restrictions on future bookings.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6. Limitation of Liability</h2>
              <p>{CLINIC_NAME} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">7. Contact</h2>
              <p>For questions about these terms, contact us at info@mechiclinic.com.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default TermsConditions;
