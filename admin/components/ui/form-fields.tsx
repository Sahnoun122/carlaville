'use client';

import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { formStyles, iconSize } from './form-styles';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

interface FormInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /**
   * Form control instance from useForm
   */
  form: UseFormReturn<TFieldValues>;
  /**
   * Field name/path
   */
  name: TName;
  /**
   * Label text
   */
  label: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Icon to display on the left
   */
  icon?: React.ReactNode;
  /**
   * Input type (text, email, password, etc.)
   */
  type?: string;
  /**
   * Show required asterisk
   */
  required?: boolean;
  /**
   * Help text below field
   */
  help?: string;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Additional input props
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * FormInputField - Reusable form input field with icon support
 */
export const FormInputField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  name,
  label,
  placeholder,
  icon,
  type = 'text',
  required = false,
  help,
  className,
  inputProps,
}: FormInputFieldProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={required ? formStyles.labelRequired : formStyles.label}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {icon && (
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {React.cloneElement(icon as React.ReactElement<any>, {
                    size: iconSize,
                  })}
                </div>
              )}
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={cn(formStyles.input, icon && formStyles.inputWithIcon, className)}
                {...inputProps}
              />
            </div>
          </FormControl>
          {help && <p className={formStyles.help}>{help}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface FormTextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /**
   * Form control instance
   */
  form: UseFormReturn<TFieldValues>;
  /**
   * Field name/path
   */
  name: TName;
  /**
   * Label text
   */
  label: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Show required asterisk
   */
  required?: boolean;
  /**
   * Min height
   */
  minHeight?: string;
  /**
   * Help text
   */
  help?: string;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * FormTextareaField - Reusable textarea field
 */
export const FormTextareaField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  name,
  label,
  placeholder,
  required = false,
  minHeight = 'min-h-[120px]',
  help,
  className,
}: FormTextareaFieldProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={required ? formStyles.labelRequired : formStyles.label}>
            {label}
          </FormLabel>
          <FormControl>
            <textarea
              {...field}
              placeholder={placeholder}
              className={cn(formStyles.textarea, minHeight)}
            />
          </FormControl>
          {help && <p className={formStyles.help}>{help}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  help?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const FormSelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  name,
  label,
  options,
  placeholder = 'Sélectionner une option',
  required = false,
  help,
  className,
  icon,
}: FormSelectFieldProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={required ? formStyles.labelRequired : formStyles.label}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {icon && (
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {React.cloneElement(icon as React.ReactElement<any>, {
                    size: iconSize,
                  })}
                </div>
              )}
              <select
                {...field}
                className={cn(
                  formStyles.select,
                  'appearance-none', // Native select look removal
                  icon && formStyles.inputWithIcon,
                  field.value === '' && 'text-slate-500',
                  className
                )}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </FormControl>
          {help && <p className={formStyles.help}>{help}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
