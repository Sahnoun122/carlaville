'use client';
import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, children }: PageHeaderProps) => (
  <div className="flex items-center justify-between mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    {children ? <div>{children}</div> : null}
  </div>
);
