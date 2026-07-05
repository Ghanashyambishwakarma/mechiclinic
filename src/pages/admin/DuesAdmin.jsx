import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Wallet, Printer, Search, DollarSign, Calendar, Landmark, CreditCard, ChevronRight, Plus } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { useDebounce } from '../../hooks/useDebounce';
import { setDocument, logActivity } from '../../lib/firestore';
import { COLLECTIONS, DUE_STATUS, PAYMENT_METHODS, CLINIC_NAME, CLINIC_TAGLINE } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import Input, { Select, Textarea, SearchInput } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const DuesAdmin = () => {
  const { data: dues, loading } = useCollection(COLLECTIONS.DUES, 'updatedAt');
  const { user } = useAuth();
  const [selectedDue, setSelectedDue] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [dueAdjustOpen, setDueAdjustOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search);

  // Print receipt state
  const [printReceipt, setPrintReceipt] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filtered = dues.filter((d) => {
    const matchSearch = !debouncedSearch ||
      d.patientName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.phone?.includes(debouncedSearch);
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetails = (dueItem) => {
    setSelectedDue(dueItem);
    setDetailOpen(true);
  };

  const openReceivePayment = (dueItem) => {
    setSelectedDue(dueItem);
    reset({
      amount: '',
      method: 'cash',
      notes: 'Due Payment'
    });
    setPaymentOpen(true);
  };

  const openAddDue = (dueItem) => {
    setSelectedDue(dueItem);
    reset({
      amount: '',
      notes: 'Due Balance Adjustment'
    });
    setDueAdjustOpen(true);
  };

  // Submit received payment
  const onReceivePaymentSubmit = async (data) => {
    if (!selectedDue) return;
    const payAmount = Number(data.amount) || 0;
    if (payAmount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    if (payAmount > selectedDue.dueAmount) {
      toast.error(`Amount exceeds outstanding due of ${formatCurrency(selectedDue.dueAmount)}`);
      return;
    }

    setSubmitting(true);
    try {
      const updatedTotal = Number(selectedDue.totalBill) || 0;
      const updatedPaid = (Number(selectedDue.paidAmount) || 0) + payAmount;
      const updatedDue = Math.max(0, updatedTotal - updatedPaid);

      let status = DUE_STATUS.UNPAID;
      if (updatedDue === 0) status = DUE_STATUS.PAID;
      else if (updatedPaid > 0) status = DUE_STATUS.PARTIAL;

      const paymentRecord = {
        id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        invoiceNumber: 'DIRECT',
        amount: payAmount,
        date: new Date().toISOString(),
        method: data.method,
        notes: data.notes
      };

      // Strip `id` so it's never stored as a field in Firestore
      const { id: _id, ...dueFields } = selectedDue;
      const updatedPayload = {
        ...dueFields,
        paidAmount: updatedPaid,
        dueAmount: updatedDue,
        status,
        payments: [...(selectedDue.payments || []), paymentRecord]
      };

      await setDocument(COLLECTIONS.DUES, selectedDue.id, updatedPayload);
      await logActivity('receive_due_payment', COLLECTIONS.DUES, selectedDue.id, user.email);

      // Instantly update current view context
      setSelectedDue(updatedPayload);

      toast.success('Payment received successfully');
      setPaymentOpen(false);

      // Offer printing immediately
      setPrintReceipt({
        ...paymentRecord,
        patientName: selectedDue.patientName,
        phone: selectedDue.phone,
        remainingDue: updatedDue
      });
    } catch {
      toast.error('Failed to post payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit direct due addition / adjustment
  const onAddDueSubmit = async (data) => {
    if (!selectedDue) return;
    const addAmount = Number(data.amount) || 0;
    if (addAmount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    setSubmitting(true);
    try {
      const updatedTotal = (Number(selectedDue.totalBill) || 0) + addAmount;
      const updatedPaid = Number(selectedDue.paidAmount) || 0;
      const updatedDue = updatedTotal - updatedPaid;

      let status = DUE_STATUS.UNPAID;
      if (updatedDue === 0) status = DUE_STATUS.PAID;
      else if (updatedPaid > 0) status = DUE_STATUS.PARTIAL;

      // Strip `id` so it's never stored as a field in Firestore
      const { id: _id2, ...dueFields2 } = selectedDue;
      const updatedPayload = {
        ...dueFields2,
        totalBill: updatedTotal,
        dueAmount: updatedDue,
        status,
        notes: data.notes || selectedDue.notes
      };

      await setDocument(COLLECTIONS.DUES, selectedDue.id, updatedPayload);
      await logActivity('adjust_due_balance', COLLECTIONS.DUES, selectedDue.id, user.email);

      setSelectedDue(updatedPayload);
      toast.success('Due balance updated');
      setDueAdjustOpen(false);
    } catch {
      toast.error('Failed to adjust due balance');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = (payment, dueItem) => {
    setPrintReceipt({
      ...payment,
      patientName: dueItem.patientName,
      phone: dueItem.phone,
      remainingDue: dueItem.dueAmount
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const columns = [
    { key: 'patientName', label: 'Patient Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'totalBill', label: 'Total Billed', render: (row) => formatCurrency(row.totalBill) },
    { key: 'paidAmount', label: 'Total Paid', render: (row) => formatCurrency(row.paidAmount) },
    {
      key: 'dueAmount',
      label: 'Outstanding Due',
      render: (row) => (
        <span className="font-semibold text-red-500">
          {formatCurrency(row.dueAmount)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        let cls = 'status-unpaid';
        if (row.status === 'paid') cls = 'status-paid';
        if (row.status === 'partial') cls = 'status-partial';
        return <span className={cls}>{row.status.toUpperCase()}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1.5">
          <button onClick={() => openDetails(row)} className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" title="History">Ledger</button>
          {row.dueAmount > 0 && (
            <button onClick={() => openReceivePayment(row)} className="px-2.5 py-1 text-xs rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20" title="Collect">Collect</button>
          )}
          <button onClick={() => openAddDue(row)} className="px-2.5 py-1 text-xs rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" title="Add Due"><Plus className="w-3.5 h-3.5 inline mr-0.5" /> Due</button>
        </div>
      )
    }
  ];

  return (
    <>
      <SEO title="Customer Dues" />

      <div className="mb-8 no-print">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Customer Dues</h1>
        <p className="text-slate-500">Monitor outstanding balances and post credit payments</p>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 no-print">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..." className="flex-1" />
        <Select
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'unpaid', label: 'Unpaid Dues' },
            { value: 'partial', label: 'Partially Paid' },
            { value: 'paid', label: 'Paid Clear' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <div className="no-print">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No dues records"
          emptyDescription="Outstanding credit balances from invoice billing appear here automatically."
        />
      </div>

      {/* Details Ledger timeline */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Patient Due Ledger">
        {selectedDue && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-slate-500 text-xs">Total Billed</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selectedDue.totalBill)}</p>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 text-xs">Total Paid</p>
                <p className="font-semibold text-green-600">{formatCurrency(selectedDue.paidAmount)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Due Outstanding</p>
                <p className="font-bold text-red-500">{formatCurrency(selectedDue.dueAmount)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">Transaction Payment History</h4>
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 sticky top-0">
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-4 py-2 text-left font-semibold text-slate-500">Date</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500">Invoice Ref</th>
                      <th className="px-4 py-2 text-center font-semibold text-slate-500">Method</th>
                      <th className="px-4 py-2 text-right font-semibold text-slate-500">Amount</th>
                      <th className="px-4 py-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedDue.payments?.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20">
                        <td className="px-4 py-3">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-mono">{payment.invoiceNumber}</td>
                        <td className="px-4 py-3 text-center capitalize">{payment.method}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handlePrintReceipt(payment, selectedDue)} className="text-slate-400 hover:text-slate-600" title="Print Receipt"><Printer className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                    {(!selectedDue.payments || selectedDue.payments.length === 0) && (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-slate-400">No payment records logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setDetailOpen(false)}>Close Ledger</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Collect / Receive Payment Modal */}
      <Modal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} title="Receive Due Payment">
        {selectedDue && (
          <form onSubmit={handleSubmit(onReceivePaymentSubmit)} className="space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex justify-between text-sm text-red-600 mb-2">
              <span>Patient: <strong>{selectedDue.patientName}</strong></span>
              <span>Balance Due: <strong>{formatCurrency(selectedDue.dueAmount)}</strong></span>
            </div>

            <Input
              label="Amount to Receive *"
              type="number"
              step="0.01"
              {...register('amount', { required: 'Required', min: 0.01 })}
              error={errors.amount?.message}
            />

            <Select
              label="Payment Method"
              options={PAYMENT_METHODS.map(m => ({ value: m, label: m.toUpperCase().replace('_', ' ') }))}
              {...register('method')}
            />

            <Textarea
              label="Notes"
              {...register('notes')}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" type="button" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Post Payment</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Direct Add Due / Adjust balance Modal */}
      <Modal isOpen={dueAdjustOpen} onClose={() => setDueAdjustOpen(false)} title="Adjust Patient Balance">
        {selectedDue && (
          <form onSubmit={handleSubmit(onAddDueSubmit)} className="space-y-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Patient: <strong>{selectedDue.patientName}</strong></span>
              <span>Current Due: <strong>{formatCurrency(selectedDue.dueAmount)}</strong></span>
            </div>

            <Input
              label="Adjust / Add Due Amount *"
              type="number"
              step="0.01"
              {...register('amount', { required: 'Required', min: 0.01 })}
              error={errors.amount?.message}
              placeholder="E.g. 500"
            />

            <Textarea
              label="Adjustment Reason / Note *"
              {...register('notes', { required: 'Required' })}
              error={errors.notes?.message}
              placeholder="E.g. Correction of typo, auxiliary clinical treatment added"
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" type="button" onClick={() => setDueAdjustOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Update Balance</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* HTML Printable Receipt Overlay */}
      {printReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setPrintReceipt(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 p-2 rounded-full"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            {/* Print Trigger */}
            <div className="flex justify-end gap-2 border-b border-slate-100 pb-4 mb-6">
              <Button variant="secondary" onClick={() => setPrintReceipt(null)}>Close</Button>
              <Button onClick={() => window.print()} className="flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print Receipt
              </Button>
            </div>

            {/* Receipt Sheet */}
            <div className="print-area font-sans text-left p-1 text-slate-800">
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl tracking-tight uppercase text-slate-900">{CLINIC_NAME}</h2>
                <p className="text-xxs text-slate-500 italic mt-0.5">{CLINIC_TAGLINE}</p>
                <p className="text-xxs text-slate-400 mt-1">Mechi Highway, Bhadrapur, Jhapa, Nepal</p>
                <div className="inline-block border border-double border-slate-300 px-3 py-0.5 rounded text-xxs font-semibold uppercase mt-3 bg-slate-50">
                  Payment Receipt
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Receipt Ref:</span>
                  <span className="font-mono font-semibold">{printReceipt.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Date:</span>
                  <span>{new Date(printReceipt.date).toLocaleDateString()} at {new Date(printReceipt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-semibold">{printReceipt.patientName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Contact:</span>
                  <span>{printReceipt.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Method:</span>
                  <span className="capitalize">{printReceipt.method.replace('_', ' ')}</span>
                </div>
                {printReceipt.notes && (
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400">Remarks:</span>
                    <span>{printReceipt.notes}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-200 py-3 text-sm font-bold text-slate-900 bg-slate-50 px-2 rounded">
                  <span>Amount Paid:</span>
                  <span className="text-green-600">{formatCurrency(printReceipt.amount)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dashed border-slate-200">
                  <span className="text-slate-400">Remaining Balance:</span>
                  <span className="font-semibold text-red-500">{formatCurrency(printReceipt.remainingDue)}</span>
                </div>
              </div>

              <div className="mt-12 text-center text-xxs text-slate-400">
                <p>Thank you for choosing Mechi Clinic.</p>
                <p className="mt-1">Computer Generated Document. No signature required.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DuesAdmin;
