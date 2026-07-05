import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { setDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SEO from '../../components/SEO';

const ContentManagement = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [formData, setFormData] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'hours', label: 'Hours' },
    { id: 'social', label: 'Social' },
    { id: 'footer', label: 'Footer' },
  ];

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleStatChange = (index, field, value) => {
    const stats = [...(formData.hero?.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, stats },
    }));
  };

  const handleHoursChange = (index, field, value) => {
    const currentHours = Array.isArray(formData.openingHours)
      ? formData.openingHours
      : Object.values(formData.openingHours || {});
    const hours = [...currentHours];
    hours[index] = { ...hours[index], [field]: value };
    setFormData((prev) => ({ ...prev, openingHours: hours }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDocument(COLLECTIONS.SETTINGS, 'website', formData);
      await logActivity('update', COLLECTIONS.SETTINGS, 'website', user.email);
      toast.success('Website content updated successfully!');
    } catch (error) {
      toast.error('Failed to update content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Website Content" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Website Content</h1>
          <p className="text-slate-500">Manage your public website content</p>
        </div>
        <Button onClick={handleSave} loading={loading}>
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-clinic-teal text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card space-y-6">
        {activeTab === 'hero' && (
          <>
            <Input label="Hero Title" value={formData.hero?.title || ''} onChange={(e) => handleChange('hero', 'title', e.target.value)} />
            <Textarea label="Hero Subtitle" value={formData.hero?.subtitle || ''} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} />
            <Input label="Hero Image URL" value={formData.hero?.imageUrl || ''} onChange={(e) => handleChange('hero', 'imageUrl', e.target.value)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Primary CTA" value={formData.hero?.ctaPrimary || ''} onChange={(e) => handleChange('hero', 'ctaPrimary', e.target.value)} />
              <Input label="Secondary CTA" value={formData.hero?.ctaSecondary || ''} onChange={(e) => handleChange('hero', 'ctaSecondary', e.target.value)} />
            </div>
            <h3 className="font-semibold mt-4">Statistics</h3>
            {(formData.hero?.stats || []).map((stat, idx) => (
              <div key={idx} className="grid sm:grid-cols-2 gap-4">
                <Input label={`Stat ${idx + 1} Label`} value={stat.label} onChange={(e) => handleStatChange(idx, 'label', e.target.value)} />
                <Input label={`Stat ${idx + 1} Value`} value={stat.value} onChange={(e) => handleStatChange(idx, 'value', e.target.value)} />
              </div>
            ))}
          </>
        )}

        {activeTab === 'about' && (
          <>
            <Input label="About Title" value={formData.about?.title || ''} onChange={(e) => handleChange('about', 'title', e.target.value)} />
            <Textarea label="About Description" value={formData.about?.description || ''} onChange={(e) => handleChange('about', 'description', e.target.value)} />
            <Input label="About Image URL" value={formData.about?.imageUrl || ''} onChange={(e) => handleChange('about', 'imageUrl', e.target.value)} />
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <Input label="Phone" value={formData.contact?.phone || ''} onChange={(e) => handleChange('contact', 'phone', e.target.value)} />
            <Input label="Email" value={formData.contact?.email || ''} onChange={(e) => handleChange('contact', 'email', e.target.value)} />
            <Textarea label="Address" value={formData.contact?.address || ''} onChange={(e) => handleChange('contact', 'address', e.target.value)} />
            <Input label="Emergency Contact" value={formData.contact?.emergency || ''} onChange={(e) => handleChange('contact', 'emergency', e.target.value)} />
            <Input label="Google Map Embed URL" value={formData.contact?.mapEmbedUrl || ''} onChange={(e) => handleChange('contact', 'mapEmbedUrl', e.target.value)} />
          </>
        )}

        {activeTab === 'hours' && (
          (Array.isArray(formData.openingHours) ? formData.openingHours : Object.values(formData.openingHours || {})).map((item, idx) => (
            <div key={idx} className="grid sm:grid-cols-2 gap-4">
              <Input label="Day" value={item?.day || ''} onChange={(e) => handleHoursChange(idx, 'day', e.target.value)} />
              <Input label="Hours" value={item?.hours || ''} onChange={(e) => handleHoursChange(idx, 'hours', e.target.value)} />
            </div>
          ))
        )}

        {activeTab === 'social' && (
          <>
            <Input label="Facebook URL" value={formData.social?.facebook || ''} onChange={(e) => handleChange('social', 'facebook', e.target.value)} />
            <Input label="Twitter URL" value={formData.social?.twitter || ''} onChange={(e) => handleChange('social', 'twitter', e.target.value)} />
            <Input label="Instagram URL" value={formData.social?.instagram || ''} onChange={(e) => handleChange('social', 'instagram', e.target.value)} />
            <Input label="LinkedIn URL" value={formData.social?.linkedin || ''} onChange={(e) => handleChange('social', 'linkedin', e.target.value)} />
          </>
        )}

        {activeTab === 'footer' && (
          <>
            <Textarea label="Footer Description" value={formData.footer?.description || ''} onChange={(e) => handleChange('footer', 'description', e.target.value)} />
            <Input label="Copyright Text" value={formData.footer?.copyright || ''} onChange={(e) => handleChange('footer', 'copyright', e.target.value)} />
          </>
        )}
      </div>
    </>
  );
};

export default ContentManagement;
