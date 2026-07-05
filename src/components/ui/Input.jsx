import { Search } from 'lucide-react';

const Input = ({ label, error, icon: Icon, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="label-text">{label}</label>}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      )}
      <input
        className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500/50' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field pl-10"
    />
  </div>
);

export const Textarea = ({ label, error, rows = 4, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="label-text">{label}</label>}
    <textarea
      rows={rows}
      className={`input-field resize-none ${error ? 'border-red-500' : ''}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export const Select = ({ label, error, options = [], className = '', ...props }) => (
  <div className={className}>
    {label && <label className="label-text">{label}</label>}
    <select
      className={`input-field ${error ? 'border-red-500' : ''}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default Input;
