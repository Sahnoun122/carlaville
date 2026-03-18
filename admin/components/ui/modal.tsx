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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/55 p-4 backdrop-blur-sm">
      <div className={`w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl ${contentClassName ?? 'max-w-md'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
