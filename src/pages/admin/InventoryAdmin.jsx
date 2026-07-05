import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, AlertCircle, Calendar, ShieldAlert,
  Package, DollarSign, Activity, ShoppingCart
} from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { useDebounce } from '../../hooks/useDebounce';
import { createDocument, updateDocument, deleteDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS, INVENTORY_CATEGORIES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, isLowStock, isExpiringSoon } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input, { Textarea, Select, SearchInput } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const CATEGORY_OPTIONS = INVENTORY_CATEGORIES.map(cat => ({
  value: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1)
}));

const InventoryAdmin = () => {
  const { data: inventory, loading } = useCollection(COLLECTIONS.INVENTORY);
  const { user } = useAuth();
  const { settings } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');
  const debouncedSearch = useDebounce(search);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Statistics calculations
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(item => isLowStock(item.quantity, item.minStock)).length;
  const expiringCount = inventory.filter(item => isExpiringSoon(item.expiryDate, settings.expiryAlertDays || 30)).length;
  const totalValue = inventory.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0)), 0);

  const filtered = inventory.filter((item) => {
    const matchSearch = !debouncedSearch ||
      item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;

    let matchAlert = true;
    if (alertFilter === 'low-stock') {
      matchAlert = isLowStock(item.quantity, item.minStock);
    } else if (alertFilter === 'expiring') {
      matchAlert = isExpiringSoon(item.expiryDate, settings.expiryAlertDays || 30);
    }

    return matchSearch && matchCategory && matchAlert;
  });

  const openCreate = () => {
    setEditItem(null);
    reset({
      name: '',
      category: 'medicine',
      quantity: 0,
      minStock: 5,
      purchasePrice: 0,
      sellingPrice: 0,
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      notes: ''
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
      const payload = {
        ...data,
        quantity: Number(data.quantity) || 0,
        minStock: Number(data.minStock) || 0,
        purchasePrice: Number(data.purchasePrice) || 0,
        sellingPrice: Number(data.sellingPrice) || 0,
      };

      if (editItem) {
        await updateDocument(COLLECTIONS.INVENTORY, editItem.id, payload);
        await logActivity('update', COLLECTIONS.INVENTORY, editItem.id, user.email);
        toast.success('Inventory item updated');
      } else {
        const id = await createDocument(COLLECTIONS.INVENTORY, payload);
        await logActivity('create', COLLECTIONS.INVENTORY, id, user.email);
        toast.success('Inventory item added');
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
      await deleteDocument(COLLECTIONS.INVENTORY, deleteId);
      await logActivity('delete', COLLECTIONS.INVENTORY, deleteId, user.email);
      toast.success('Item deleted successfully');
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const columns = [
    { key: 'name', label: 'Item Name' },
    { key: 'category', label: 'Category', render: (row) => <span className="capitalize">{row.category}</span> },
    {
      key: 'quantity',
      label: 'Stock Level',
      render: (row) => {
        const low = isLowStock(row.quantity, row.minStock);
        return (
          <span className={`font-semibold ${low ? 'text-red-500 flex items-center gap-1' : 'text-slate-700 dark:text-slate-300'}`}>
            {row.quantity} {low && <AlertCircle className="w-3.5 h-3.5" title="Low stock alert" />}
          </span>
        );
      }
    },
    { key: 'purchasePrice', label: 'Purchase Price', render: (row) => formatCurrency(row.purchasePrice) },
    { key: 'sellingPrice', label: 'Selling Price', render: (row) => formatCurrency(row.sellingPrice) },
    {
      key: 'expiryDate',
      label: 'Expiry',
      render: (row) => {
        if (!row.expiryDate) return '-';
        const expiring = isExpiringSoon(row.expiryDate);
        return (
          <span className={`text-xs ${expiring ? 'text-red-500 font-semibold flex items-center gap-1' : 'text-slate-500'}`}>
            {row.expiryDate} {expiring && <Calendar className="w-3.5 h-3.5 animate-pulse" title="Expiring soon" />}
          </span>
        );
      }
    },
    { key: 'supplier', label: 'Supplier' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(row.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <>
      <SEO title="Inventory Management" />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-slate-500">Track and manage clinic medicines, equipment and supplies</p>
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto"><Plus className="w-4 h-4" /> Add Stock Item</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-clinic-teal/10 flex items-center justify-center text-clinic-teal">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Items</p>
            <p className="font-bold text-lg">{totalItems}</p>
          </div>
        </div>

        <div className="glass p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Low Stock</p>
            <p className="font-bold text-lg text-red-600 dark:text-red-400">{lowStockCount}</p>
          </div>
        </div>

        <div className="glass p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Expiring Soon</p>
            <p className="font-bold text-lg text-yellow-600 dark:text-yellow-400">{expiringCount}</p>
          </div>
        </div>

        <div className="glass p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Stock Valuation</p>
            <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item name or supplier..." className="flex-1" />
        <Select
          options={[
            { value: 'all', label: 'All Categories' },
            ...CATEGORY_OPTIONS
          ]}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="sm:w-48"
        />
        <Select
          options={[
            { value: 'all', label: 'All Stock Levels' },
            { value: 'low-stock', label: 'Low Stock Alerts' },
            { value: 'expiring', label: 'Expiring Alerts' }
          ]}
          value={alertFilter}
          onChange={(e) => setAlertFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No inventory items"
        emptyDescription="Add medical equipment, medicine stock, or items to manage clinic inventory."
      />

      {/* Add / Edit Item Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Stock Item' : 'Add New Inventory Item'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Item Name *" {...register('name', { required: 'Required' })} error={errors.name?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" options={CATEGORY_OPTIONS} {...register('category')} />
            <Input label="Supplier" {...register('supplier')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Current Stock Quantity *" type="number" {...register('quantity', { required: 'Required', min: 0 })} error={errors.quantity?.message} />
            <Input label="Minimum Stock Level (Alert threshold) *" type="number" {...register('minStock', { required: 'Required', min: 0 })} error={errors.minStock?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Price (Cost) *" type="number" step="0.01" {...register('purchasePrice', { required: 'Required', min: 0 })} error={errors.purchasePrice?.message} />
            <Input label="Selling Price (Retail) *" type="number" step="0.01" {...register('sellingPrice', { required: 'Required', min: 0 })} error={errors.sellingPrice?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Date" type="date" {...register('purchaseDate')} />
            <Input label="Expiry Date (Optional)" type="date" {...register('expiryDate')} />
          </div>

          <Textarea label="Notes & Location" {...register('notes')} />

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editItem ? 'Update Stock' : 'Add Item'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Are you sure you want to delete this inventory item? This action will remove the item permanently from stock registers." danger />
    </>
  );
};

export default InventoryAdmin;
