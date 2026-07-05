import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Printer, Receipt, DollarSign, Calendar, User } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import { createDocument, setDocument, logActivity, generateInvoiceNumber, getDocument, getDocRef, batchWrite, serverTimestamp } from '../../lib/firestore';
import { COLLECTIONS, PAYMENT_METHODS, CLINIC_NAME, CLINIC_TAGLINE } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SEO from '../../components/SEO';

const BillingAdmin = () => {
  const { data: patients, loading: loadingPatients } = useCollection(COLLECTIONS.PATIENTS);
  const { data: services, loading: loadingServices } = useCollection(COLLECTIONS.SERVICES);
  const { data: inventory, loading: loadingInventory } = useCollection(COLLECTIONS.INVENTORY);
  const { data: invoices, loading: loadingInvoices } = useCollection(COLLECTIONS.BILLING);

  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [items, setItems] = useState([]); // Array of { type: 'service'|'medicine', id, name, qty, rate, total }
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Print invoice state
  const [printInvoice, setPrintInvoice] = useState(null);

  // Current selector inputs
  const [itemType, setItemType] = useState('service');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQty, setItemQty] = useState(1);

  // Math helper
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountVal = subtotal * (Number(discountPercent) / 100);
  const taxVal = (subtotal - discountVal) * (Number(taxPercent) / 100);
  const grandTotal = subtotal - discountVal + taxVal;
  const dueAmount = Math.max(0, grandTotal - Number(paidAmount));

  const handleAddItem = () => {
    if (!selectedItemId) {
      toast.error('Select an item first');
      return;
    }

    let selectedItem = null;
    if (itemType === 'service') {
      selectedItem = services.find(s => s.id === selectedItemId);
    } else {
      selectedItem = inventory.find(i => i.id === selectedItemId);
    }

    if (!selectedItem) return;

    // For medicine, verify stock
    if (itemType === 'medicine' && selectedItem.quantity < itemQty) {
      toast.error(`Insufficient stock! Available: ${selectedItem.quantity}`);
      return;
    }

    // Check if item already in invoice
    const existingIndex = items.findIndex(item => item.id === selectedItemId && item.type === itemType);

    if (existingIndex > -1) {
      const updated = [...items];
      const newQty = updated[existingIndex].qty + Number(itemQty);
      if (itemType === 'medicine' && selectedItem.quantity < newQty) {
        toast.error(`Insufficient stock! Cannot add more. Available: ${selectedItem.quantity}`);
        return;
      }
      updated[existingIndex].qty = newQty;
      updated[existingIndex].total = newQty * updated[existingIndex].rate;
      setItems(updated);
    } else {
      const newItem = {
        type: itemType,
        id: selectedItemId,
        name: selectedItem.name,
        qty: Number(itemQty),
        rate: itemType === 'service' ? selectedItem.price : selectedItem.sellingPrice,
        total: Number(itemQty) * (itemType === 'service' ? selectedItem.price : selectedItem.sellingPrice)
      };
      setItems([...items, newItem]);
    }

    // Reset inputs
    setSelectedItemId('');
    setItemQty(1);
  };

  const handleRemoveItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one service or medicine');
      return;
    }

    setSubmitting(true);
    try {
      const patientObj = patients.find(p => p.id === selectedPatientId);
      if (!patientObj) throw new Error('Patient not found');

      // 1. Generate unique invoice number transactional
      const invoiceNumber = await generateInvoiceNumber();

      const invoicePayload = {
        invoiceNumber,
        patientId: selectedPatientId,
        patientName: patientObj.name,
        patientPhone: patientObj.phone,
        items,
        subtotal,
        discountPercent: Number(discountPercent),
        discountAmount: discountVal,
        taxPercent: Number(taxPercent),
        taxAmount: taxVal,
        grandTotal,
        paid: Number(paidAmount),
        due: dueAmount,
        paymentMethod,
        notes,
        createdAt: new Date().toISOString()
      };

      // 2. Create the invoice document in Firestore
      const invoiceId = await createDocument(COLLECTIONS.BILLING, invoicePayload);

      // 3. Update Patient Dues system (Credit ledger)
      const dueDocId = selectedPatientId; // Use patient ID as doc ID to keep unified outstanding due per patient
      const dueSnap = await getDocument(COLLECTIONS.DUES, dueDocId);

      const paymentRecord = {
        id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        invoiceId,
        invoiceNumber,
        amount: Number(paidAmount),
        date: new Date().toISOString(),
        method: paymentMethod,
        notes: notes || 'Invoice Payment'
      };

      if (dueSnap) {
        // Update existing due balances
        const currentTotal = (Number(dueSnap.totalBill) || 0) + grandTotal;
        const currentPaid = (Number(dueSnap.paidAmount) || 0) + Number(paidAmount);
        const currentDue = Math.max(0, currentTotal - currentPaid);
        let status = 'unpaid';
        if (currentDue === 0) status = 'paid';
        else if (currentPaid > 0) status = 'partial';

        await setDocument(COLLECTIONS.DUES, dueDocId, {
          totalBill: currentTotal,
          paidAmount: currentPaid,
          dueAmount: currentDue,
          status,
          payments: [...(dueSnap.payments || []), paymentRecord]
        });
      } else {
        // Create new due ledger
        let status = 'unpaid';
        if (dueAmount === 0) status = 'paid';
        else if (Number(paidAmount) > 0) status = 'partial';

        await setDocument(COLLECTIONS.DUES, dueDocId, {
          patientId: selectedPatientId,
          patientName: patientObj.name,
          phone: patientObj.phone,
          address: patientObj.address || '',
          totalBill: grandTotal,
          paidAmount: Number(paidAmount),
          dueAmount: dueAmount,
          status,
          createdAt: serverTimestamp(),
          payments: [paymentRecord]
        });
      }

      // 4. Batch decrement stock levels for sold medicines
      const batch = batchWrite();
      const medicineItems = items.filter(item => item.type === 'medicine');
      for (const med of medicineItems) {
        const invItem = inventory.find(i => i.id === med.id);
        if (invItem) {
          const newQty = Math.max(0, invItem.quantity - med.qty);
          const itemRef = getDocRef(COLLECTIONS.INVENTORY, med.id);
          batch.update(itemRef, { quantity: newQty });
        }
      }
      await batch.commit();

      // Log action
      await logActivity('create_invoice', COLLECTIONS.BILLING, invoiceId, user.email);
      toast.success(`Invoice ${invoiceNumber} created successfully!`);

      // Set print model to trigger immediate modal preview
      setPrintInvoice({ ...invoicePayload, id: invoiceId });

      // Reset Form
      setSelectedPatientId('');
      setItems([]);
      setDiscountPercent(0);
      setTaxPercent(0);
      setPaidAmount(0);
      setNotes('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate billing invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (invoice) => {
    setPrintInvoice(invoice);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const invoiceColumns = [
    { key: 'invoiceNumber', label: 'Invoice No.' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'grandTotal', label: 'Total Amount', render: (row) => formatCurrency(row.grandTotal) },
    { key: 'paid', label: 'Paid', render: (row) => formatCurrency(row.paid) },
    {
      key: 'due',
      label: 'Balance Due',
      render: (row) => (
        <span className={row.due > 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>
          {formatCurrency(row.due)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Print',
      render: (row) => (
        <button onClick={() => handlePrint(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-clinic-teal" title="Print Invoice">
          <Printer className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <>
      <SEO title="Billing & Invoicing" />

      {/* Main Billing screen grid */}
      <div className="mb-8 no-print">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Billing & Invoices</h1>
        <p className="text-slate-500">Create invoices, register payments, and monitor due credits</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8 no-print">
        {/* Create Invoice Panel */}
        <div className="lg:col-span-2 glass p-6 space-y-6">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <Receipt className="w-5 h-5 text-clinic-teal" /> New Bill Generator
          </h2>

          {/* Select Patient */}
          <div>
            <label className="label-text">Select Patient *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Choose Registered Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone}) [{p.patientId}]
                </option>
              ))}
            </select>
            {patients.length === 0 && !loadingPatients && (
              <p className="text-xs text-yellow-600 mt-1">No registered patients found. Please add a patient first in Patients tab.</p>
            )}
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Add Billable Item</h3>

            <div className="grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Item Type</label>
                <select
                  value={itemType}
                  onChange={(e) => { setItemType(e.target.value); setSelectedItemId(''); }}
                  className="input-field py-2 text-sm"
                >
                  <option value="service">Service/Consultation</option>
                  <option value="medicine">Medicine/Supplies</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 block mb-1">Select Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="input-field py-2 text-sm"
                >
                  <option value="">-- Choose Item --</option>
                  {itemType === 'service'
                    ? services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)
                    : inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({formatCurrency(i.sellingPrice)}) [Stock: {i.quantity}]</option>)
                  }
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                    className="input-field py-2 text-sm text-center w-16"
                  />
                  <Button onClick={handleAddItem} className="py-2.5 px-3.5"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Itemized List */}
          <div className="space-y-2">
            <label className="label-text">Billing Items</label>
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-2 text-left font-semibold text-xs text-slate-500 uppercase">Item Name</th>
                    <th className="px-4 py-2 text-center font-semibold text-xs text-slate-500 uppercase w-20">Rate</th>
                    <th className="px-4 py-2 text-center font-semibold text-xs text-slate-500 uppercase w-16">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold text-xs text-slate-500 uppercase w-24">Total</th>
                    <th className="px-4 py-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                        <span className="text-xxs px-1.5 py-0.5 rounded capitalize bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-3 text-center">{item.qty}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No items added to invoice yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="glass p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-semibold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-slate-900 dark:text-white">
              Invoice Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Discount %"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                />
                <Input
                  label="Tax %"
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-4 pt-4 flex justify-between items-center">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Grand Total</span>
                <span className="font-display font-bold text-xl text-clinic-teal dark:text-primary-400">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Paid Amount *"
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value)))}
                />
                <div>
                  <label className="label-text">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method.toUpperCase().replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {dueAmount > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex justify-between">
                  <span>Remaining Due (Patient Credit):</span>
                  <span className="font-bold">{formatCurrency(dueAmount)}</span>
                </div>
              )}

              <Input label="Invoice Remarks / Private Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="E.g. Follow-up clinic fee waived" />
            </div>
          </div>

          <Button
            onClick={handleGenerateInvoice}
            loading={submitting}
            className="w-full py-3.5 mt-6 flex justify-center items-center gap-2"
          >
            <Receipt className="w-5 h-5" /> Generate Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Registry List */}
      <div className="no-print">
        <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">Invoice Registry</h2>
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          loading={loadingInvoices}
          emptyTitle="No invoices created"
          emptyDescription="Invoices you generate will appear here in reverse chronological order."
        />
      </div>

      {/* HTML Printable Invoice template overlay */}
      {printInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-3xl w-full shadow-2xl relative">
            <button
              onClick={() => setPrintInvoice(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 p-2 rounded-full"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            {/* Print trigger button on preview modal */}
            <div className="flex justify-end gap-2 border-b border-slate-100 pb-4 mb-6">
              <Button variant="secondary" onClick={() => setPrintInvoice(null)}>Close</Button>
              <Button onClick={() => window.print()} className="flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print Document
              </Button>
            </div>

            {/* Invoice sheet itself */}
            <div className="print-area font-sans p-2 select-text text-left">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="font-semibold text-2xl text-slate-800 tracking-tight">{CLINIC_NAME}</h1>
                  <p className="text-xs text-slate-500 italic mt-0.5">{CLINIC_TAGLINE}</p>
                  <p className="text-xs text-slate-400 mt-2">Mechi Highway, Bhadrapur, Jhapa, Nepal</p>
                  <p className="text-xs text-slate-400">Emergency: +977-9800000001 | Office: info@mechiclinic.com</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded text-xs font-mono font-semibold uppercase mb-2">
                    Invoice Invoice
                  </div>
                  <p className="text-xs text-slate-500">Invoice Number: <span className="font-semibold font-mono text-slate-800">{printInvoice.invoiceNumber}</span></p>
                  <p className="text-xs text-slate-500">Date: <span className="font-semibold">{new Date(printInvoice.createdAt).toLocaleDateString()}</span></p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl mb-8">
                <div>
                  <h3 className="text-xxs uppercase tracking-wider font-semibold text-slate-400 mb-1">Patient Details</h3>
                  <p className="font-semibold text-sm text-slate-800">{printInvoice.patientName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Phone: {printInvoice.patientPhone}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xxs uppercase tracking-wider font-semibold text-slate-400 mb-1">Payment summary</h3>
                  <p className="text-xs text-slate-600">Payment Status: <span className={`font-semibold capitalize text-xs ${printInvoice.due > 0 ? 'text-red-500' : 'text-green-600'}`}>{printInvoice.due > 0 ? 'Partial / Unpaid' : 'Paid'}</span></p>
                  <p className="text-xs text-slate-500">Method: <span className="capitalize">{printInvoice.paymentMethod.replace('_', ' ')}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 text-xs uppercase text-left">
                    <th className="py-2">Item / Service Details</th>
                    <th className="py-2 text-center w-20">Unit Rate</th>
                    <th className="py-2 text-center w-16">Qty</th>
                    <th className="py-2 text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printInvoice.items?.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="text-slate-700">
                      <td className="py-3">
                        <p className="font-medium">{item.name}</p>
                        <span className="text-xxs text-slate-400 font-mono capitalize">{item.type}</span>
                      </td>
                      <td className="py-3 text-center">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-center">{item.qty}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals block */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(printInvoice.subtotal)}</span>
                  </div>
                  {printInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Discount ({printInvoice.discountPercent}%):</span>
                      <span className="text-green-600">-{formatCurrency(printInvoice.discountAmount)}</span>
                    </div>
                  )}
                  {printInvoice.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Tax ({printInvoice.taxPercent}%):</span>
                      <span>+{formatCurrency(printInvoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2 text-base">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(printInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Paid Amount:</span>
                    <span>{formatCurrency(printInvoice.paid)}</span>
                  </div>
                  {printInvoice.due > 0 && (
                    <div className="flex justify-between font-semibold text-red-500 border-t border-dashed border-slate-200 pt-2">
                      <span>Outstanding Balance:</span>
                      <span>{formatCurrency(printInvoice.due)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks & Signatures */}
              {printInvoice.notes && (
                <div className="mt-8 border border-slate-100 p-3 bg-slate-50 rounded text-xs text-slate-500">
                  <p className="font-semibold mb-0.5">Remarks:</p>
                  <p>{printInvoice.notes}</p>
                </div>
              )}

              <div className="mt-16 flex justify-between items-end text-xs text-slate-400">
                <div>
                  <p className="border-t border-slate-200 pt-1 w-48 text-center">Patient Signature</p>
                </div>
                <div className="text-right">
                  <p className="border-t border-slate-200 pt-1 w-48 text-center">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BillingAdmin;
