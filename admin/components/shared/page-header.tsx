'use client';
import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, children }: PageHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    {children ? <div>{children}</div> : null}
  </div>
);
