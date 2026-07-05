import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { createDocument, updateDocument, deleteDocument } from '../../lib/firestore';
import { COLLECTIONS } from '../../lib/constants';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const TestimonialsAdmin = () => {
  const { data, loading } = useCollection(COLLECTIONS.TESTIMONIALS);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openCreate = () => { setEditItem(null); reset({ name: '', role: '', text: '', rating: 5, photoUrl: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true); };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = { ...formData, rating: Number(formData.rating) || 5 };
      if (editItem) { await updateDocument(COLLECTIONS.TESTIMONIALS, editItem.id, payload); toast.success('Updated'); }
      else { await createDocument(COLLECTIONS.TESTIMONIALS, payload); toast.success('Created'); }
      setModalOpen(false);
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'rating', label: 'Rating', render: (row) => `${row.rating}/5` },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <SEO title="Manage Testimonials" />
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="font-display text-2xl font-bold">Testimonials</h1></div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add</Button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} emptyTitle="No testimonials" />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit' : 'Add Testimonial'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name', { required: true })} error={errors.name && 'Required'} />
          <Input label="Role" {...register('role')} />
          <Textarea label="Testimonial *" {...register('text', { required: true })} />
          <Input label="Rating (1-5)" type="number" min="1" max="5" {...register('rating')} />
          <Input label="Photo URL" {...register('photoUrl')} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={submitting}>Save</Button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { await deleteDocument(COLLECTIONS.TESTIMONIALS, deleteId); toast.success('Deleted'); setDeleteId(null); }} message="Delete?" danger />
    </>
  );
};

export default TestimonialsAdmin;
