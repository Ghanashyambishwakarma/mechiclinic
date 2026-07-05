import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { createDocument, updateDocument, deleteDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const DoctorsAdmin = () => {
  const { data: doctors, loading } = useCollection(COLLECTIONS.DOCTORS, 'name', 'asc');
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', qualification: '', experience: '', department: '', workingDays: '', availableTime: '', photoUrl: '', description: '', active: true });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    reset({ ...item, workingDays: item.workingDays?.join(', ') || item.workingDays || '' });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        experience: Number(data.experience) || 0,
        workingDays: data.workingDays ? data.workingDays.split(',').map((d) => d.trim()) : [],
        active: data.active !== false,
      };
      if (editItem) {
        await updateDocument(COLLECTIONS.DOCTORS, editItem.id, payload);
        await logActivity('update', COLLECTIONS.DOCTORS, editItem.id, user.email);
        toast.success('Doctor updated');
      } else {
        const id = await createDocument(COLLECTIONS.DOCTORS, payload);
        await logActivity('create', COLLECTIONS.DOCTORS, id, user.email);
        toast.success('Doctor added');
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
      await deleteDocument(COLLECTIONS.DOCTORS, deleteId);
      await logActivity('delete', COLLECTIONS.DOCTORS, deleteId, user.email);
      toast.success('Doctor deleted');
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <div className="flex items-center gap-3">
        {row.photoUrl && <img src={row.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />}
        <span>{row.name}</span>
      </div>
    )},
    { key: 'department', label: 'Department' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'experience', label: 'Experience', render: (row) => `${row.experience} yrs` },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <SEO title="Manage Doctors" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Doctors</h1>
          <p className="text-slate-500">Manage doctor profiles</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Doctor</Button>
      </div>

      <DataTable columns={columns} data={doctors} loading={loading} emptyTitle="No doctors" emptyDescription="Add your first doctor" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name *" {...register('name', { required: 'Required' })} error={errors.name?.message} />
            <Input label="Department" {...register('department')} />
            <Input label="Qualification" {...register('qualification')} />
            <Input label="Experience (years)" type="number" {...register('experience')} />
            <Input label="Working Days (comma separated)" {...register('workingDays')} />
            <Input label="Available Time" {...register('availableTime')} placeholder="9:00 AM - 5:00 PM" />
          </div>
          <Input label="Photo URL" {...register('photoUrl')} />
          <Textarea label="Description" {...register('description')} />
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Delete this doctor?" danger />
    </>
  );
};

export default DoctorsAdmin;
