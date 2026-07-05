import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Ban, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { useDebounce } from '../../hooks/useDebounce';
import { updateDocument, deleteDocument } from '../../lib/firestore';
import { COLLECTIONS, APPOINTMENT_STATUS } from '../../lib/constants';
import { SearchInput, Select } from '../../components/ui/Input';
import { AppointmentBadge } from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const AppointmentsAdmin = () => {
  const { data: appointments, loading } = useCollection(COLLECTIONS.APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const filtered = appointments.filter((apt) => {
    const matchSearch = !debouncedSearch ||
      apt.patientName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      apt.phone?.includes(debouncedSearch);
    const matchStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status) => {
    try {
      await updateDocument(COLLECTIONS.APPOINTMENTS, id, { status });
      toast.success(`Appointment ${status}`);
    } catch {
      toast.error('Update failed');
    }
  };

  const columns = [
    { key: 'patientName', label: 'Patient' },
    { key: 'phone', label: 'Phone' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status', render: (row) => <AppointmentBadge status={row.status} /> },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        {row.status === 'pending' && (
          <>
            <button onClick={() => updateStatus(row.id, APPOINTMENT_STATUS.APPROVED)} className="p-1.5 rounded-lg bg-green-100 text-green-600" title="Approve"><Check className="w-4 h-4" /></button>
            <button onClick={() => updateStatus(row.id, APPOINTMENT_STATUS.REJECTED)} className="p-1.5 rounded-lg bg-red-100 text-red-600" title="Reject"><X className="w-4 h-4" /></button>
          </>
        )}
        {['approved', 'pending'].includes(row.status) && (
          <button onClick={() => updateStatus(row.id, APPOINTMENT_STATUS.CANCELLED)} className="p-1.5 rounded-lg bg-slate-100" title="Cancel"><Ban className="w-4 h-4" /></button>
        )}
        {row.status === 'approved' && (
          <button onClick={() => updateStatus(row.id, APPOINTMENT_STATUS.COMPLETED)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600" title="Complete"><CheckCircle className="w-4 h-4" /></button>
        )}
        <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-lg text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <SEO title="Manage Appointments" />
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Appointments</h1>
        <p className="text-slate-500">Manage patient appointments</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..." className="flex-1" />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48" />
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="No appointments" />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => { await deleteDocument(COLLECTIONS.APPOINTMENTS, deleteId); toast.success('Deleted'); setDeleteId(null); }}
        message="Delete this appointment?"
        danger
      />
    </>
  );
};

export default AppointmentsAdmin;
