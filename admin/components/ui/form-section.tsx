'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formStyles } from './form-styles';

interface FormSectionProps {
  /**
   * Title of the section (optional)
   */
  title?: string;
  /**
   * Description text (optional)
   */
  description?: string;
  /**
   * Layout type for child form fields
   */
  layout?: 'single' | 'double' | 'triple' | 'quad';
  /**
   * Add border-top separator (typically for visual grouping)
   */
  separator?: boolean;
  /**
   * Custom className to merge
   */
  className?: string;
  /**
   * Form fields or content
   */
  children: React.ReactNode;
}

/**
 * FormSection - A reusable container for grouping related form fields
 * Provides consistent spacing and layout options
 */
export const FormSection = ({
  title,
  description,
  layout = 'double',
  separator = false,
  className,
  children,
}: FormSectionProps) => {
  const layoutClass = formStyles.fieldGrid[layout] || formStyles.fieldGrid.double;

  return (
    <div className={cn(separator && formStyles.sectionBorder, className)}>
      {(title || description) && (
        <div className="mb-6 space-y-1">
          {title && <h3 className="text-lg font-bold text-[#1E293B]">{title}</h3>}
          {description && <p className="text-slate-500 text-sm">{description}</p>}
        </div>
      )}
      <div className={layoutClass}>{children}</div>
    </div>
  );
};

/**
 * FormContent - Main scrollable container for form content
 */
interface FormContentProps {
  /**
   * Title at the top of the form
   */
  title: string;
  /**
   * Description text under title
   */
  description?: string;
  /**
   * Icon or visual element to display with title
   */
  icon?: React.ReactNode;
  /**
   * Form fields and sections
   */
  children: React.ReactNode;
}

export const FormContent = ({
  title,
  description,
  icon,
  children,
}: FormContentProps) => {
  return (
    <div className={formStyles.formContent}>
      <div className={formStyles.formHeader}>
        {icon && <div className="mb-4">{icon}</div>}
        <h1 className={formStyles.formTitle}>{title}</h1>
        {description && <p className={formStyles.formDescription}>{description}</p>}
      </div>

      <div className={formStyles.section}>{children}</div>
    </div>
  );
};
