'use client';
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, description, children }: PageHeaderProps) => (
  <div className="mb-6 rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>}
        <div className="mt-2.5 h-1 w-16 rounded-full bg-primary" />
      </div>
      {children ? <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">{children}</div> : null}
    </div>
  </div>
);
