import { getDueStatusClass, capitalize } from '../../lib/utils';

export const StatusBadge = ({ status }) => (
  <span className={getDueStatusClass(status)}>
    {capitalize(status)}
  </span>
);

export const AppointmentBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.pending}`}>
      {capitalize(status)}
    </span>
  );
};

export default StatusBadge;
