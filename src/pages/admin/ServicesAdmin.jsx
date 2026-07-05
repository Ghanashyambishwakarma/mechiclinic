import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { createDocument, updateDocument, deleteDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const ICON_OPTIONS = [
  { value: 'Stethoscope', label: 'Stethoscope' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Brain', label: 'Brain' },
  { value: 'Bone', label: 'Bone' },
  { value: 'Eye', label: 'Eye' },
  { value: 'Baby', label: 'Baby' },
  { value: 'Pill', label: 'Pill' },
  { value: 'Syringe', label: 'Syringe' },
];

const ServicesAdmin = () => {
  const { data: services, loading } = useCollection(COLLECTIONS.SERVICES, 'order', 'asc');
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', description: '', icon: 'Stethoscope', price: '', order: 0, active: true });
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
      const payload = { ...data, price: Number(data.price) || 0, order: Number(data.order) || 0, active: data.active !== false };
      if (editItem) {
        await updateDocument(COLLECTIONS.SERVICES, editItem.id, payload);
        await logActivity('update', COLLECTIONS.SERVICES, editItem.id, user.email);
        toast.success('Service updated');
      } else {
        const id = await createDocument(COLLECTIONS.SERVICES, payload);
        await logActivity('create', COLLECTIONS.SERVICES, id, user.email);
        toast.success('Service created');
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
      await deleteDocument(COLLECTIONS.SERVICES, deleteId);
      await logActivity('delete', COLLECTIONS.SERVICES, deleteId, user.email);
      toast.success('Service deleted');
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (row) => <span className="line-clamp-1">{row.description}</span> },
    { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <SEO title="Manage Services" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Services</h1>
          <p className="text-slate-500">Manage medical services</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      <DataTable columns={columns} data={services} loading={loading} emptyTitle="No services" emptyDescription="Add your first medical service" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name', { required: 'Required' })} error={errors.name?.message} />
          <Textarea label="Description" {...register('description')} />
          <Select label="Icon" options={ICON_OPTIONS} {...register('icon')} />
          <Input label="Price" type="number" {...register('price')} />
          <Input label="Display Order" type="number" {...register('order')} />
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Delete this service?" danger />
    </>
  );
};

export default ServicesAdmin;
