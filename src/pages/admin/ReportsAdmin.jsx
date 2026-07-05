import { useState } from 'react';
import { useCollection } from '../../hooks/useCollection';
import { COLLECTIONS } from '../../lib/constants';
import { formatCurrency, isLowStock, isExpiringSoon } from '../../lib/utils';
import { Printer, Download, Calendar, DollarSign, Wallet, Package, Users, BarChart3, ChevronRight } from 'lucide-react';
import SEO from '../../components/SEO';
import Button from '../../components/ui/Button';

const ReportsAdmin = () => {
  const { data: appointments } = useCollection(COLLECTIONS.APPOINTMENTS);
  const { data: billing } = useCollection(COLLECTIONS.BILLING);
  const { data: dues } = useCollection(COLLECTIONS.DUES, 'updatedAt');
  const { data: inventory } = useCollection(COLLECTIONS.INVENTORY);
  const { data: patients } = useCollection(COLLECTIONS.PATIENTS);
  const { data: doctors } = useCollection(COLLECTIONS.DOCTORS);

  const [activeTab, setActiveTab] = useState('revenue');

  // CSV Exporter helper
  const handleExportCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Appointments Report calculations
  const totalAppts = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const pendingAppts = appointments.filter(a => a.status === 'pending').length;
  const cancelledAppts = appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length;

  const exportAppointments = () => {
    const headers = ['Patient Name', 'Phone', 'Doctor ID', 'Date', 'Time', 'Status', 'Notes'];
    const rows = appointments.map(a => [
      a.patientName,
      a.phone,
      doctors.find(d => d.id === a.doctorId)?.name || a.doctorId,
      a.date,
      a.time,
      a.status,
      a.notes
    ]);
    handleExportCSV('Appointments_Report.csv', headers, rows);
  };

  // 2. Revenue Report calculations
  const totalBilledVal = billing.reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);
  const totalPaidVal = billing.reduce((sum, b) => sum + (Number(b.paid) || 0), 0);
  const totalDueVal = billing.reduce((sum, b) => sum + (Number(b.due) || 0), 0);

  const paymentMethodsBreakdown = billing.reduce((acc, b) => {
    const method = b.paymentMethod || 'other';
    acc[method] = (acc[method] || 0) + (Number(b.paid) || 0);
    return acc;
  }, {});

  const exportRevenue = () => {
    const headers = ['Invoice No.', 'Patient Name', 'Date', 'Subtotal', 'Discount Amount', 'Tax Amount', 'Grand Total', 'Paid Amount', 'Due Balance', 'Payment Method'];
    const rows = billing.map(b => [
      b.invoiceNumber,
      b.patientName,
      new Date(b.createdAt).toLocaleDateString(),
      b.subtotal,
      b.discountAmount,
      b.taxAmount,
      b.grandTotal,
      b.paid,
      b.due,
      b.paymentMethod
    ]);
    handleExportCSV('Revenue_Report.csv', headers, rows);
  };

  // 3. Dues Report calculations
  const totalDuesOut = dues.reduce((sum, d) => sum + (Number(d.dueAmount) || 0), 0);
  const totalDebtors = dues.filter(d => d.dueAmount > 0).length;

  const exportDues = () => {
    const headers = ['Patient Name', 'Phone', 'Address', 'Total Bill', 'Paid Amount', 'Due Outstanding', 'Status'];
    const rows = dues.map(d => [
      d.patientName,
      d.phone,
      d.address,
      d.totalBill,
      d.paidAmount,
      d.dueAmount,
      d.status
    ]);
    handleExportCSV('Customer_Dues_Report.csv', headers, rows);
  };

  // 4. Inventory Report calculations
  const totalInvItems = inventory.length;
  const totalAssetVal = inventory.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.purchasePrice) || 0)), 0);
  const totalRetailVal = inventory.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.sellingPrice) || 0)), 0);
  const alertLowCount = inventory.filter(i => isLowStock(i.quantity, i.minStock)).length;
  const alertExpCount = inventory.filter(i => isExpiringSoon(i.expiryDate)).length;

  const exportInventory = () => {
    const headers = ['Item Name', 'Category', 'Quantity', 'Min Stock Level', 'Purchase Cost', 'Retail Price', 'Supplier', 'Expiry Date'];
    const rows = inventory.map(i => [
      i.name,
      i.category,
      i.quantity,
      i.minStock,
      i.purchasePrice,
      i.sellingPrice,
      i.supplier,
      i.expiryDate || 'N/A'
    ]);
    handleExportCSV('Inventory_Report.csv', headers, rows);
  };

  // 5. Patients Report calculations
  const totalPatientsCount = patients.length;
  const activePatientsCount = patients.filter(p => p.status === 'active').length;
  const femalePatientsCount = patients.filter(p => p.gender === 'female').length;
  const malePatientsCount = patients.filter(p => p.gender === 'male').length;
  const otherPatientsCount = patients.filter(p => p.gender === 'other').length;

  const exportPatients = () => {
    const headers = ['Patient ID', 'Name', 'Age', 'Gender', 'Phone', 'Address', 'Blood Group', 'Status', 'Registered Date'];
    const rows = patients.map(p => [
      p.patientId,
      p.name,
      p.age,
      p.gender,
      p.phone,
      p.address,
      p.bloodGroup,
      p.status,
      p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : 'N/A'
    ]);
    handleExportCSV('Patients_Demographics_Report.csv', headers, rows);
  };

  const tabs = [
    { id: 'revenue', label: 'Financial Revenue', icon: DollarSign },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'dues', label: 'Patient Dues Ledger', icon: Wallet },
    { id: 'inventory', label: 'Inventory Assets', icon: Package },
    { id: 'patients', label: 'Patient Demographics', icon: Users },
  ];

  return (
    <>
      <SEO title="Reports & Analytics" />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 no-print">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500">Generate, view and print practice metrics and summaries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Current Page
          </Button>
          {activeTab === 'revenue' && <Button onClick={exportRevenue} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</Button>}
          {activeTab === 'appointments' && <Button onClick={exportAppointments} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</Button>}
          {activeTab === 'dues' && <Button onClick={exportDues} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</Button>}
          {activeTab === 'inventory' && <Button onClick={exportInventory} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</Button>}
          {activeTab === 'patients' && <Button onClick={exportPatients} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</Button>}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 no-print">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                active
                  ? 'border-clinic-teal text-clinic-teal dark:border-primary-400 dark:text-primary-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Print-only heading */}
      <div className="hidden print:block text-slate-800 border-b pb-4 mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-center">Mechi Clinic Practice Reports</h2>
        <p className="text-center text-xs text-slate-500 mt-1">Generated date: {new Date().toLocaleDateString()} | Active Module: {activeTab.toUpperCase()}</p>
      </div>

      {/* 1. FINANCIAL REVENUE REPORT */}
      {activeTab === 'revenue' && (
        <div className="space-y-6 print:block">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Gross Billed Invoices</p>
              <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(totalBilledVal)}</p>
            </div>
            <div className="glass p-4 text-center border-l-2 border-green-500">
              <p className="text-xs text-slate-500">Net Payments Collected</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalPaidVal)}</p>
            </div>
            <div className="glass p-4 text-center border-l-2 border-red-500">
              <p className="text-xs text-slate-500">Outstanding Receivable Balance</p>
              <p className="text-lg sm:text-xl font-bold text-red-500 dark:text-red-400 mt-1">{formatCurrency(totalDueVal)}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass p-6">
              <h3 className="font-semibold text-sm mb-4 text-slate-500">Payments by Payment Method</h3>
              <div className="space-y-3">
                {Object.entries(paymentMethodsBreakdown).map(([method, val]) => (
                  <div key={method} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="capitalize text-sm font-medium">{method.replace('_', ' ')}</span>
                    <span className="font-semibold text-sm">{formatCurrency(val)}</span>
                  </div>
                ))}
                {Object.keys(paymentMethodsBreakdown).length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">No payments recorded</p>
                )}
              </div>
            </div>

            <div className="glass p-6">
              <h3 className="font-semibold text-sm mb-4 text-slate-500">Overall Billing Health</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span>Total Invoices Issued</span>
                  <span className="font-bold">{billing.length} Invoices</span>
                </div>
                <div className="flex justify-between">
                  <span>Collection Ratio</span>
                  <span className="font-bold text-green-600">
                    {totalBilledVal > 0 ? `${((totalPaidVal / totalBilledVal) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding Ratio</span>
                  <span className="font-bold text-red-500">
                    {totalBilledVal > 0 ? `${((totalDueVal / totalBilledVal) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-4 overflow-hidden">
            <h3 className="font-semibold text-sm text-slate-500 mb-3">Recent Transactions Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <th className="py-2">Date</th>
                    <th className="py-2">Invoice No</th>
                    <th className="py-2">Patient</th>
                    <th className="py-2 text-right">Invoice Total</th>
                    <th className="py-2 text-right">Received</th>
                    <th className="py-2 text-right">Due Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {billing.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 font-mono">{b.invoiceNumber}</td>
                      <td className="py-2.5">{b.patientName}</td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(b.grandTotal)}</td>
                      <td className="py-2.5 text-right text-green-600 font-semibold">{formatCurrency(b.paid)}</td>
                      <td className="py-2.5 text-right text-red-500">{formatCurrency(b.due)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. APPOINTMENTS REPORT */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Total Bookings</p>
              <p className="text-xl font-bold mt-1 text-slate-800 dark:text-white">{totalAppts}</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Completed Sessions</p>
              <p className="text-xl font-bold mt-1 text-green-600">{completedAppts}</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Pending Waiting</p>
              <p className="text-xl font-bold mt-1 text-yellow-600">{pendingAppts}</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Cancelled / Rejected</p>
              <p className="text-xl font-bold mt-1 text-slate-500">{cancelledAppts}</p>
            </div>
          </div>

          <div className="glass p-4">
            <h3 className="font-semibold text-sm text-slate-500 mb-3">Appointments Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <th className="py-2">Date</th>
                    <th className="py-2">Time</th>
                    <th className="py-2">Patient</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Doctor</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5">{a.date}</td>
                      <td className="py-2.5">{a.time}</td>
                      <td className="py-2.5">{a.patientName}</td>
                      <td className="py-2.5">{a.phone}</td>
                      <td className="py-2.5">{doctors.find(d => d.id === a.doctorId)?.name || 'Direct'}</td>
                      <td className="py-2.5 capitalize">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PATIENT DUES LEDGER REPORT */}
      {activeTab === 'dues' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 text-center border-l-2 border-red-500">
              <p className="text-xs text-slate-500">Total Outstanding Credit Receivable</p>
              <p className="text-xl font-bold mt-1 text-red-500">{formatCurrency(totalDuesOut)}</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Total Patients in Debt</p>
              <p className="text-xl font-bold mt-1 text-slate-800 dark:text-white">{totalDebtors}</p>
            </div>
          </div>

          <div className="glass p-4">
            <h3 className="font-semibold text-sm text-slate-500 mb-3">Receivables Account Statement</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <th className="py-2">Patient</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2 text-right">Total Billed</th>
                    <th className="py-2 text-right">Total Paid</th>
                    <th className="py-2 text-right">Balance Due</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dues.filter(d => d.dueAmount > 0).map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5 font-medium">{d.patientName}</td>
                      <td className="py-2.5">{d.phone}</td>
                      <td className="py-2.5 text-right">{formatCurrency(d.totalBill)}</td>
                      <td className="py-2.5 text-right text-green-600">{formatCurrency(d.paidAmount)}</td>
                      <td className="py-2.5 text-right text-red-500 font-semibold">{formatCurrency(d.dueAmount)}</td>
                      <td className="py-2.5 text-center capitalize">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.status === 'unpaid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. INVENTORY REPORT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Total Unique Items</p>
              <p className="text-xl font-bold mt-1">{totalInvItems}</p>
            </div>
            <div className="glass p-4 text-center border-l-2 border-blue-500">
              <p className="text-xs text-slate-500">Asset Value (Cost)</p>
              <p className="text-xl font-bold mt-1 text-blue-600">{formatCurrency(totalAssetVal)}</p>
            </div>
            <div className="glass p-4 text-center border-l-2 border-green-500">
              <p className="text-xs text-slate-500">Retail Value (Potential)</p>
              <p className="text-xl font-bold mt-1 text-green-600">{formatCurrency(totalRetailVal)}</p>
            </div>
            <div className="glass p-4 text-center border-l-2 border-red-500">
              <p className="text-xs text-slate-500">Low Stock Alerts</p>
              <p className="text-xl font-bold mt-1 text-red-500">{alertLowCount}</p>
            </div>
          </div>

          <div className="glass p-4">
            <h3 className="font-semibold text-sm text-slate-500 mb-3">Inventory Ledger Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <th className="py-2">Item Name</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">In Stock</th>
                    <th className="py-2 text-right">Cost Price</th>
                    <th className="py-2 text-right">Total Cost Asset</th>
                    <th className="py-2">Supplier</th>
                    <th className="py-2">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventory.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5 font-medium">{i.name}</td>
                      <td className="py-2.5 capitalize">{i.category}</td>
                      <td className="py-2.5 text-right">{i.quantity}</td>
                      <td className="py-2.5 text-right">{formatCurrency(i.purchasePrice)}</td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(i.quantity * i.purchasePrice)}</td>
                      <td className="py-2.5">{i.supplier}</td>
                      <td className={`py-2.5 ${isExpiringSoon(i.expiryDate) ? 'text-red-500 font-semibold' : ''}`}>
                        {i.expiryDate || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. PATIENT DEMOGRAPHICS */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Total Registered</p>
              <p className="text-xl font-bold mt-1 text-slate-800 dark:text-white">{totalPatientsCount}</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Active Patients</p>
              <p className="text-xl font-bold mt-1 text-green-600">{activePatientsCount}</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Female Patient ratio</p>
              <p className="text-xl font-bold mt-1 text-clinic-teal">{totalPatientsCount > 0 ? `${((femalePatientsCount / totalPatientsCount) * 100).toFixed(1)}%` : '0%'}</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-xs text-slate-500">Male Patient ratio</p>
              <p className="text-xl font-bold mt-1 text-clinic-cyan">{totalPatientsCount > 0 ? `${((malePatientsCount / totalPatientsCount) * 100).toFixed(1)}%` : '0%'}</p>
            </div>
          </div>

          <div className="glass p-4">
            <h3 className="font-semibold text-sm text-slate-500 mb-3">Registered Patients Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <th className="py-2">Patient ID</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Age</th>
                    <th className="py-2">Gender</th>
                    <th className="py-2">Blood Group</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5 font-mono">{p.patientId}</td>
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="py-2.5">{p.age}</td>
                      <td className="py-2.5 capitalize">{p.gender}</td>
                      <td className="py-2.5">{p.bloodGroup}</td>
                      <td className="py-2.5">{p.phone}</td>
                      <td className="py-2.5">{p.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportsAdmin;
