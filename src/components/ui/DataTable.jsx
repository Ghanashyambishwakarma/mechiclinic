import { SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';

const DataTable = ({ columns, data, loading, emptyTitle, emptyDescription, onRowClick }) => {
  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <SkeletonTable rows={5} cols={columns.length} />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="glass-card">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
