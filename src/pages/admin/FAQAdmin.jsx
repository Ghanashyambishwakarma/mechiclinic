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

const FAQAdmin = () => {
  const { data, loading } = useCollection(COLLECTIONS.FAQ, 'order', 'asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = { ...formData, order: Number(formData.order) || 0 };
      if (editItem) { await updateDocument(COLLECTIONS.FAQ, editItem.id, payload); toast.success('Updated'); }
      else { await createDocument(COLLECTIONS.FAQ, payload); toast.success('Created'); }
      setModalOpen(false);
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'question', label: 'Question', render: (row) => <span className="line-clamp-1">{row.question}</span> },
    { key: 'order', label: 'Order' },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => { setEditItem(row); reset(row); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <SEO title="Manage FAQ" />
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="font-display text-2xl font-bold">FAQ</h1></div>
        <Button onClick={() => { setEditItem(null); reset({ question: '', answer: '', order: 0 }); setModalOpen(true); }}><Plus className="w-4 h-4" /> Add FAQ</Button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} emptyTitle="No FAQs" />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Question *" {...register('question', { required: true })} error={errors.question && 'Required'} />
          <Textarea label="Answer *" {...register('answer', { required: true })} />
          <Input label="Display Order" type="number" {...register('order')} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={submitting}>Save</Button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { await deleteDocument(COLLECTIONS.FAQ, deleteId); toast.success('Deleted'); setDeleteId(null); }} message="Delete?" danger />
    </>
  );
};

export default FAQAdmin;
