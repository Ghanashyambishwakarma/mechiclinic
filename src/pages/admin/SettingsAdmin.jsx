import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Save, Settings2, Building2, Phone, Globe, DollarSign, Shield, Bell,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { setDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS, CLINIC_NAME } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SEO from '../../components/SEO';
import { motion } from 'framer-motion';

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50 mb-6">
    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 className="font-display font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

const SettingsAdmin = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clinic');

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      clinicName: settings.clinicName || CLINIC_NAME,
      tagline: settings.tagline || '',
      currency: settings.currency || 'NPR',
      defaultTaxPercent: settings.defaultTaxPercent || 0,
      invoicePrefix: settings.invoicePrefix || 'MC',
      lowStockThreshold: settings.lowStockThreshold || 10,
      expiryAlertDays: settings.expiryAlertDays || 30,
      appointmentReminderEmail: settings.appointmentReminderEmail || '',
    },
  });

  // Sync form when settings load from Firestore
  useEffect(() => {
    reset({
      clinicName: settings.clinicName || CLINIC_NAME,
      tagline: settings.tagline || '',
      currency: settings.currency || 'NPR',
      defaultTaxPercent: settings.defaultTaxPercent || 0,
      invoicePrefix: settings.invoicePrefix || 'MC',
      lowStockThreshold: settings.lowStockThreshold || 10,
      expiryAlertDays: settings.expiryAlertDays || 30,
      appointmentReminderEmail: settings.appointmentReminderEmail || '',
    });
  }, [settings, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await setDocument(COLLECTIONS.SETTINGS, 'clinic', {
        ...data,
        updatedBy: user.email,
      });
      await logActivity('update', COLLECTIONS.SETTINGS, 'clinic', user.email);
      toast.success('Settings saved successfully!');
      reset(data);
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'clinic', label: 'Clinic', icon: Building2 },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <>
      <SEO title="System Settings" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-clinic-teal" />
            System Settings
          </h1>
          <p className="text-slate-500 mt-1">Configure clinic-wide system preferences</p>
        </div>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Unsaved changes
          </motion.div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'gradient-bg text-white shadow-lg shadow-clinic-teal/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="glass-card space-y-6"
        >
          {/* Clinic Info Tab */}
          {activeTab === 'clinic' && (
            <>
              <SectionHeader
                icon={Building2}
                title="Clinic Information"
                description="Basic information about your clinic displayed across the system"
              />
              <div className="grid sm:grid-cols-2 gap-6">
                <Input
                  label="Clinic Name"
                  placeholder="e.g. Mechi Clinic"
                  {...register('clinicName', { required: true })}
                />
                <Input
                  label="Clinic Tagline"
                  placeholder="e.g. Trusted Healthcare for Every Family"
                  {...register('tagline')}
                />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">Note:</span> For website content (hero text, about section, contact info), use the{' '}
                  <span className="text-clinic-teal font-medium">Website Content</span> module in the sidebar.
                </p>
              </div>
            </>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <>
              <SectionHeader
                icon={DollarSign}
                title="Billing & Invoice Settings"
                description="Configure default billing preferences and invoice formatting"
              />
              <div className="grid sm:grid-cols-2 gap-6">
                <Input
                  label="Currency Code"
                  placeholder="e.g. NPR, USD, EUR"
                  {...register('currency')}
                />
                <Input
                  label="Default Tax Rate (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 13"
                  {...register('defaultTaxPercent', { min: 0, max: 100 })}
                />
                <div>
                  <Input
                    label="Invoice Number Prefix"
                    placeholder="e.g. MC, INV, MECH"
                    {...register('invoicePrefix')}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Invoice numbers will appear as: <strong>MC-00001</strong>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <>
              <SectionHeader
                icon={Bell}
                title="Alert Thresholds"
                description="Configure when the system should generate warnings for inventory and appointments"
              />
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Low Stock Alert Threshold"
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    {...register('lowStockThreshold', { min: 1 })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Items with quantity at or below this will show low-stock alerts
                  </p>
                </div>
                <div>
                  <Input
                    label="Expiry Alert (Days Before)"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="e.g. 30"
                    {...register('expiryAlertDays', { min: 1, max: 365 })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Show alerts for items expiring within this many days
                  </p>
                </div>
                <div>
                  <Input
                    label="Notification Email"
                    type="email"
                    placeholder="alerts@mechiclinic.com"
                    {...register('appointmentReminderEmail')}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email to receive appointment and alert notifications
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <SectionHeader
                icon={Shield}
                title="Access & Security"
                description="Admin access configuration and security information"
              />
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-700 dark:text-green-400 text-sm">Admin Account</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Currently logged in as: <strong>{user?.email}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">Firestore Security</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Firestore security rules are configured via the Firebase Console or{' '}
                        <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">firestore.rules</code>.
                        Admin access is verified server-side by matching the authenticated email.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 text-sm">Change Admin Email</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        To change the admin email, update the{' '}
                        <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">VITE_ADMIN_EMAIL</code>{' '}
                        environment variable and redeploy. Also update the email in{' '}
                        <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">firestore.rules</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save Button — shown for all except security tab */}
          {activeTab !== 'security' && (
            <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <Button type="submit" loading={loading}>
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </div>
          )}
        </motion.div>
      </form>
    </>
  );
};

export default SettingsAdmin;
