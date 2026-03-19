'use client';
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, description, children }: PageHeaderProps) => (
  <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
    <div>
      <h1 className="text-2xl font-black tracking-tight text-gray-900">{title}</h1>
      {description && <p className="mt-1 text-sm font-medium text-gray-500">{description}</p>}
      <div className="mt-2.5 h-1 w-16 rounded-full bg-primary" />
    </div>
    {children ? <div>{children}</div> : null}
  </div>
);
