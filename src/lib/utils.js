let globalCurrency = 'NPR';

export const setGlobalCurrency = (currency) => {
  if (currency) {
    globalCurrency = currency;
  }
};

export const formatCurrency = (amount, currency = null) => {
  const activeCurrency = currency || globalCurrency || 'NPR';
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: activeCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  const d = date?.toDate ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
};

export const formatDateTime = (date) => {
  return formatDate(date, { hour: '2-digit', minute: '2-digit' });
};

export const getDueStatus = (totalBill, paidAmount) => {
  const total = Number(totalBill) || 0;
  const paid = Number(paidAmount) || 0;
  const due = total - paid;

  if (due <= 0 || paid >= total) return 'paid';
  if (paid > 0) return 'partial';
  return 'unpaid';
};

export const getDueStatusClass = (status) => {
  const map = {
    paid: 'status-paid',
    partial: 'status-partial',
    unpaid: 'status-unpaid',
  };
  return map[status] || 'status-unpaid';
};

export const getAppointmentStatusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  };
  return map[status] || map.pending;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const calculateInvoiceTotals = (items, discountPercent = 0, taxPercent = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.rate) || 0), 0);
  const discount = (subtotal * (Number(discountPercent) || 0)) / 100;
  const afterDiscount = subtotal - discount;
  const tax = (afterDiscount * (Number(taxPercent) || 0)) / 100;
  const grandTotal = afterDiscount + tax;

  return {
    subtotal,
    discount,
    afterDiscount,
    tax,
    grandTotal,
  };
};

export const isLowStock = (quantity, minStock) => {
  return Number(quantity) <= Number(minStock);
};

export const isExpiringSoon = (expiryDate, daysThreshold = 30) => {
  if (!expiryDate) return false;
  const expiry = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
  const now = new Date();
  const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= daysThreshold;
};

export const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const expiry = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
  return expiry < new Date();
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const scrollToSection = (href) => {
  const id = href.replace('#', '');
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export const printElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  window.print();
};
