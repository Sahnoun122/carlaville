'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  contentClassName?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  contentClassName,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xl p-6 w-full ${contentClassName ?? 'max-w-md'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-700 transition-colors">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
