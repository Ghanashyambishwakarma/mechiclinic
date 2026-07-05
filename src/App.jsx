import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';
import { Loader2 } from 'lucide-react';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-clinic-teal dark:text-primary-400" />
      <p className="text-slate-500 font-medium">Loading Mechi Clinic...</p>
    </div>
  </div>
);

// Lazy pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ContentManagement = lazy(() => import('./pages/admin/ContentManagement'));
const ServicesAdmin = lazy(() => import('./pages/admin/ServicesAdmin'));
const DoctorsAdmin = lazy(() => import('./pages/admin/DoctorsAdmin'));
const DepartmentsAdmin = lazy(() => import('./pages/admin/DepartmentsAdmin'));
const TestimonialsAdmin = lazy(() => import('./pages/admin/TestimonialsAdmin'));
const GalleryAdmin = lazy(() => import('./pages/admin/GalleryAdmin'));
const FAQAdmin = lazy(() => import('./pages/admin/FAQAdmin'));
const NewsAdmin = lazy(() => import('./pages/admin/NewsAdmin'));
const AppointmentsAdmin = lazy(() => import('./pages/admin/AppointmentsAdmin'));

// New Admin Pages (To be created)
const PatientsAdmin = lazy(() => import('./pages/admin/PatientsAdmin'));
const InventoryAdmin = lazy(() => import('./pages/admin/InventoryAdmin'));
const BillingAdmin = lazy(() => import('./pages/admin/BillingAdmin'));
const DuesAdmin = lazy(() => import('./pages/admin/DuesAdmin'));
const StaffAdmin = lazy(() => import('./pages/admin/StaffAdmin'));
const ReportsAdmin = lazy(() => import('./pages/admin/ReportsAdmin'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'));

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Website */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="terms" element={<TermsConditions />} />
                  </Route>

                  {/* Admin Auth */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Admin Dashboard Pages */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="content" element={<ContentManagement />} />
                    <Route path="services" element={<ServicesAdmin />} />
                    <Route path="doctors" element={<DoctorsAdmin />} />
                    <Route path="departments" element={<DepartmentsAdmin />} />
                    <Route path="testimonials" element={<TestimonialsAdmin />} />
                    <Route path="gallery" element={<GalleryAdmin />} />
                    <Route path="faq" element={<FAQAdmin />} />
                    <Route path="news" element={<NewsAdmin />} />
                    <Route path="appointments" element={<AppointmentsAdmin />} />
                    <Route path="patients" element={<PatientsAdmin />} />
                    <Route path="inventory" element={<InventoryAdmin />} />
                    <Route path="billing" element={<BillingAdmin />} />
                    <Route path="dues" element={<DuesAdmin />} />
                    <Route path="staff" element={<StaffAdmin />} />
                    <Route path="reports" element={<ReportsAdmin />} />
                    <Route path="settings" element={<SettingsAdmin />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
