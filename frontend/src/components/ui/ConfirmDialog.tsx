'use client';

import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export type ConfirmDialogVariant = 'destructive' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  destructive: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={onCancel}
    >
      <div
        className={`
          ${styles.bg} ${styles.border}
          border rounded-lg shadow-xl p-6 max-w-md w-full mx-4
          animate-in fade-in zoom-in-95
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <Icon className={`${styles.iconColor} flex-shrink-0 w-6 h-6 mt-0.5`} />
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="text-sm text-gray-700 mb-4"
            >
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label={cancelText}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`${styles.button} px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
                aria-label={confirmText}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

