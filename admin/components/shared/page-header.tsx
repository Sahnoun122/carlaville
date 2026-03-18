'use client';
import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, children }: PageHeaderProps) => (
  <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
    <div>
      <h1 className="text-2xl font-black tracking-tight text-gray-900">{title}</h1>
      <div className="mt-2 h-1 w-20 rounded-full bg-primary" />
    </div>
    {children ? <div>{children}</div> : null}
  </div>
);
