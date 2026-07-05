import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { useDebounce } from '../../hooks/useDebounce';
import { createDocument, updateDocument, deleteDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input, { Select, SearchInput } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const ROLE_OPTIONS = [
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'assistant', label: 'Assistant' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const StaffAdmin = () => {
  const { data: staff, loading } = useCollection(COLLECTIONS.STAFF);
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const debouncedSearch = useDebounce(search);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filtered = staff.filter((member) => {
    const matchSearch = !debouncedSearch ||
      member.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      member.phone?.includes(debouncedSearch) ||
      member.email?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchRole = roleFilter === 'all' || member.role === roleFilter;

    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setEditItem(null);
    reset({
      name: '',
      role: 'receptionist',
      phone: '',
      email: '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    reset(item);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await updateDocument(COLLECTIONS.STAFF || 'staff', editItem.id, data);
        await logActivity('update_staff', COLLECTIONS.STAFF || 'staff', editItem.id, user.email);
        toast.success('Staff details updated');
      } else {
        const id = await createDocument(COLLECTIONS.STAFF || 'staff', data);
        await logActivity('create_staff', COLLECTIONS.STAFF || 'staff', id, user.email);
        toast.success('Staff registered successfully');
      }
      setModalOpen(false);
    } catch {
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(COLLECTIONS.STAFF || 'staff', deleteId);
      await logActivity('delete_staff', COLLECTIONS.STAFF || 'staff', deleteId, user.email);
      toast.success('Staff record deleted');
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const columns = [
    { key: 'name', label: 'Full Name' },
    { key: 'role', label: 'Role', render: (row) => <span className="capitalize">{row.role}</span> },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
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
        <div className="flex gap-1.5">
          <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO title="Staff Management" />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Staff Management</h1>
          <p className="text-slate-500">Manage nurses, receptionist and administrative assistants</p>
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto"><Plus className="w-4 h-4" /> Add Staff Member</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff name, email, phone..." className="flex-1" />
        <Select
          options={[
            { value: 'all', label: 'All Roles' },
            ...ROLE_OPTIONS,
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No staff members registered"
        emptyDescription="Add receptionists, nurses, or assistance staff members to manage roles."
      />

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Staff Details' : 'Register Staff Member'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name *" {...register('name', { required: 'Required' })} error={errors.name?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Role *" options={ROLE_OPTIONS} {...register('role')} />
            <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone Number *" {...register('phone', { required: 'Required' })} error={errors.phone?.message} />
            <Input label="Email Address *" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editItem ? 'Update details' : 'Register'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Delete this staff record permanently?" danger />
    </>
  );
};

export default StaffAdmin;
