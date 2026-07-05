import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <Icon className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
