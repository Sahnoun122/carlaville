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
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {React.cloneElement(icon as React.ReactElement<any>, {
                    size: iconSize,
                  })}
                </div>
              )}
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={cn(formStyles.input, icon && formStyles.inputWithIcon.split('px-4')[0], className)}
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
