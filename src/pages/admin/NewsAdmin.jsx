import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { createDocument, updateDocument, deleteDocument, serverTimestamp } from '../../lib/firestore';
import { COLLECTIONS } from '../../lib/constants';
import { formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const NewsAdmin = () => {
  const { data, loading } = useCollection(COLLECTIONS.NEWS, 'publishedAt', 'desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = { ...formData, publishedAt: editItem?.publishedAt || serverTimestamp() };
      if (editItem) { await updateDocument(COLLECTIONS.NEWS, editItem.id, payload); toast.success('Updated'); }
      else { await createDocument(COLLECTIONS.NEWS, payload); toast.success('Published'); }
      setModalOpen(false);
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'publishedAt', label: 'Date', render: (row) => formatDate(row.publishedAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => { setEditItem(row); reset(row); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <SEO title="Manage News" />
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="font-display text-2xl font-bold">News</h1></div>
        <Button onClick={() => { setEditItem(null); reset({ title: '', excerpt: '', content: '', imageUrl: '' }); setModalOpen(true); }}><Plus className="w-4 h-4" /> Add News</Button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} emptyTitle="No news" />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit News' : 'Add News'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title *" {...register('title', { required: true })} error={errors.title && 'Required'} />
          <Input label="Image URL" {...register('imageUrl')} />
          <Textarea label="Excerpt" {...register('excerpt')} />
          <Textarea label="Content *" rows={6} {...register('content', { required: true })} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={submitting}>Save</Button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { await deleteDocument(COLLECTIONS.NEWS, deleteId); toast.success('Deleted'); setDeleteId(null); }} message="Delete?" danger />
    </>
  );
};

export default NewsAdmin;
