'use client';

import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '@/lib/utils';
import { formStyles, iconSize } from './form-styles';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

interface FormSelectOption {
  label: string;
  value: string;
}

interface FormSelectFieldProps<
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
   * Select options
   */
  options: FormSelectOption[];
  /**
   * Icon to display on the left
   */
  icon?: React.ReactNode;
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
}

/**
 * FormSelectField - Reusable select field with icon support
 */
export const FormSelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  name,
  label,
  placeholder,
  options,
  icon,
  required = false,
  help,
  className,
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
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <div className="relative">
                {icon && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                    {React.cloneElement(icon as React.ReactElement<any>, {
                      size: iconSize,
                    })}
                  </div>
                )}
                <SelectTrigger
                  className={cn(
                    formStyles.selectTrigger,
                    icon && 'pl-12',
                    className
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </div>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {help && <p className={formStyles.help}>{help}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface FormNativeSelectFieldProps<
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
   * Select options
   */
  options: FormSelectOption[];
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
}

/**
 * FormNativeSelectField - Native select field (simpler alternative)
 */
export const FormNativeSelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  name,
  label,
  placeholder,
  options,
  required = false,
  help,
  className,
}: FormNativeSelectFieldProps<TFieldValues, TName>) => {
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
            <select
              {...field}
              value={field.value || ''}
              className={cn(formStyles.select, 'appearance-none', className)}
            >
              {placeholder && <option value="">{placeholder}</option>}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>
          {help && <p className={formStyles.help}>{help}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
