import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Users, Calendar, Package, Receipt, Wallet, TrendingUp, AlertTriangle, Clock, Database, Loader2,
} from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS, APPOINTMENT_STATUS } from '../../lib/constants';
import { formatCurrency, isLowStock, isExpiringSoon } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { seedSampleData } from '../../lib/sampleSeeder';
import SEO from '../../components/SEO';
import Button from '../../components/ui/Button';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { data: patients } = useCollection(COLLECTIONS.PATIENTS);
  const { data: appointments } = useCollection(COLLECTIONS.APPOINTMENTS);
  const { data: inventory } = useCollection(COLLECTIONS.INVENTORY);
  const { data: billing } = useCollection(COLLECTIONS.BILLING);
  const { data: dues } = useCollection(COLLECTIONS.DUES, 'updatedAt');
  const { data: services } = useCollection(COLLECTIONS.SERVICES);
  const { data: doctors } = useCollection(COLLECTIONS.DOCTORS);
  const { user } = useAuth();
  const { settings } = useSettings();

  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedSampleData(user.email);
      toast.success('Sample data imported successfully!');
    } catch {
      toast.error('Failed to import sample data');
    } finally {
      setSeeding(false);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === APPOINTMENT_STATUS.PENDING).length;
  const lowStockItems = inventory.filter((i) => isLowStock(i.quantity, i.minStock)).length;
  const expiringItems = inventory.filter((i) => isExpiringSoon(i.expiryDate, settings.expiryAlertDays || 30)).length;
  const totalDue = dues.reduce((sum, d) => sum + (Number(d.dueAmount) || 0), 0);
  const totalRevenue = billing.reduce((sum, b) => sum + (Number(b.paid) || 0), 0);

  const showSeedBanner = services.length === 0 && doctors.length === 0;

  return (
    <>
      <SEO title="Dashboard" />
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500">Welcome to Mechi Clinic Management System</p>
      </div>

      {showSeedBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl glass border border-yellow-500/30 bg-yellow-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Empty Database Detected</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                It looks like your Mechi Clinic database is empty. Seed sample departments, doctors, services, news, FAQs, and testimonials to preview the site.
              </p>
            </div>
          </div>
          <Button onClick={handleSeed} loading={seeding} className="bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20 text-white font-semibold flex items-center gap-2">
            Import Sample Data
          </Button>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} label="Total Patients" value={patients.length} color="gradient-bg" delay={0} />
        <StatCard icon={Calendar} label="Pending Appointments" value={pendingAppointments} color="bg-yellow-500" delay={0.1} />
        <StatCard icon={TrendingUp} label="Total Revenue" value={formatCurrency(totalRevenue)} color="bg-green-500" delay={0.2} />
        <StatCard icon={Wallet} label="Outstanding Dues" value={formatCurrency(totalDue)} color="bg-red-500" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Inventory Alerts
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-yellow-500/10">
              <span className="text-sm">Low Stock Items</span>
              <span className="font-bold text-yellow-600">{lowStockItems}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-red-500/10">
              <span className="text-sm">Expiring Soon</span>
              <span className="font-bold text-red-600">{expiringItems}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-blue-500/10">
              <span className="text-sm">Total Inventory Items</span>
              <span className="font-bold text-blue-600">{inventory.length}</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-clinic-teal" />
            Recent Appointments
          </h2>
          <div className="space-y-3">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <p className="font-medium text-sm">{apt.patientName}</p>
                  <p className="text-xs text-slate-500">{apt.date} at {apt.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  apt.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No appointments yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
