import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose, title }) => {
  const typeClasses = {
    info: 'bg-blue-900 text-blue-100 border-blue-700',
    success: 'bg-green-900 text-green-100 border-green-700',
    error: 'bg-red-900 text-red-100 border-red-700',
    warning: 'bg-yellow-900 text-yellow-100 border-yellow-700',
  };

  const iconClasses = {
    info: Info,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
  };

  const Icon = iconClasses[type];

  return (
    <div className={`border-l-4 p-4 mb-4 flex items-start gap-3 ${typeClasses[type]}`}>
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
