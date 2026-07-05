import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, User, Phone, MapPin, Calendar, HeartPulse, FileText } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { useDebounce } from '../../hooks/useDebounce';
import { createDocument, updateDocument, deleteDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input, { Textarea, Select, SearchInput } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const BLOOD_GROUP_OPTIONS = [
  { value: 'Unknown', label: 'Select Blood Group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const PatientsAdmin = () => {
  const { data: patients, loading } = useCollection(COLLECTIONS.PATIENTS);
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filtered = patients.filter((patient) => {
    const matchSearch = !debouncedSearch ||
      patient.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      patient.phone?.includes(debouncedSearch) ||
      patient.patientId?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditItem(null);
    reset({
      name: '',
      age: '',
      gender: 'male',
      phone: '',
      address: '',
      bloodGroup: 'Unknown',
      medicalHistory: '',
      notes: '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    reset(item);
    setModalOpen(true);
  };

  const openView = (item) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await updateDocument(COLLECTIONS.PATIENTS, editItem.id, data);
        await logActivity('update', COLLECTIONS.PATIENTS, editItem.id, user.email);
        toast.success('Patient updated successfully');
      } else {
        // Generate short patient ID: PT-XXXXX
        const patientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
        const payload = {
          ...data,
          patientId,
          registeredAt: new Date().toISOString(),
        };
        const id = await createDocument(COLLECTIONS.PATIENTS, payload);
        await logActivity('create', COLLECTIONS.PATIENTS, id, user.email);
        toast.success('Patient registered successfully');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(COLLECTIONS.PATIENTS, deleteId);
      await logActivity('delete', COLLECTIONS.PATIENTS, deleteId, user.email);
      toast.success('Patient record deleted');
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const columns = [
    { key: 'patientId', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age/Gender', render: (row) => `${row.age} yrs / ${row.gender}` },
    { key: 'bloodGroup', label: 'Blood Group' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          row.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <button onClick={() => openView(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="View Profile"><Eye className="w-4 h-4 text-clinic-teal" /></button>
          <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO title="Manage Patients" />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Patient Records</h1>
          <p className="text-slate-500">Add, edit and monitor patient health history</p>
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto"><Plus className="w-4 h-4" /> Register Patient</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or patient ID..." className="flex-1" />
        <Select
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active Only' },
            { value: 'inactive', label: 'Inactive Only' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No patient records found"
        emptyDescription="Register a patient to start managing their records."
      />

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Patient Profile' : 'Register New Patient'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name *" {...register('name', { required: 'Required' })} error={errors.name?.message} />
            <Input label="Phone Number *" {...register('phone', { required: 'Required' })} error={errors.phone?.message} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Age *" type="number" {...register('age', { required: 'Required', min: 0 })} error={errors.age?.message} />
            <Select label="Gender" options={GENDER_OPTIONS} {...register('gender')} />
            <Select label="Blood Group" options={BLOOD_GROUP_OPTIONS} {...register('bloodGroup')} />
          </div>
          <Input label="Address *" {...register('address', { required: 'Required' })} error={errors.address?.message} />
          <Textarea label="Medical History (Allergies, chronic conditions, past surgeries)" {...register('medicalHistory')} />
          <Textarea label="Administrative Notes" {...register('notes')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editItem ? 'Update Profile' : 'Register'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Patient Health Profile">
        {viewItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
              <div className="w-16 h-16 rounded-full bg-clinic-teal/15 flex items-center justify-center text-clinic-teal">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">{viewItem.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  {viewItem.patientId}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Phone Number</p>
                  <p className="font-medium">{viewItem.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Address</p>
                  <p className="font-medium">{viewItem.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Age & Gender</p>
                  <p className="font-medium capitalize">{viewItem.age} Years / {viewItem.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HeartPulse className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Blood Group</p>
                  <p className="font-medium">{viewItem.bloodGroup}</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-1"><HeartPulse className="w-3.5 h-3.5" /> Medical History</p>
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 min-h-[80px]">
                  <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                    {viewItem.medicalHistory || 'No recorded medical history.'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-1"><FileText className="w-3.5 h-3.5" /> Clinical Notes</p>
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 min-h-[80px]">
                  <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                    {viewItem.notes || 'No administrative/clinical notes.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Are you sure you want to delete this patient profile? All billing history and records will remain but the patient profile will be removed." danger />
    </>
  );
};

export default PatientsAdmin;
