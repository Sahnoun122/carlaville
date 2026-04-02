'use client';

import React from 'react';
import { Button } from './button';
import { formStyles } from './form-styles';

interface FormFooterAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface FormFooterProps {
  /**
   * Left side action (usually Cancel/Reset)
   */
  leftAction?: FormFooterAction;
  /**
   * Primary action buttons (right side)
   */
  actions: FormFooterAction[];
  /**
   * Show divider above footer
   */
  showDivider?: boolean;
}

/**
 * FormFooter - Reusable footer component for forms
 * Provides consistent layout for action buttons
 */
export const FormFooter = ({
  leftAction,
  actions,
  showDivider = true,
}: FormFooterProps) => {
  return (
    <div className={formStyles.formFooter}>
      {/* Left Action */}
      {leftAction && (
        <button
          onClick={leftAction.onClick}
          disabled={leftAction.disabled}
          className={formStyles.button.ghost}
        >
          {leftAction.label}
        </button>
      )}

      {/* Right Actions */}
      <div className="flex gap-4">
        {actions.map((action, index) => {
          const isLoading = action.loading;
          const buttonClass =
            action.variant === 'primary'
              ? formStyles.button.primary
              : action.variant === 'secondary'
                ? formStyles.button.secondary
                : formStyles.button.ghost;

          return (
            <Button
              key={index}
              type={action.label === 'Save' || action.label === 'Submit' ? 'submit' : 'button'}
              onClick={action.onClick}
              disabled={action.disabled || isLoading}
              className={buttonClass}
            >
              {isLoading && <span className="animate-spin mr-2">⏳</span>}
              <span className="flex items-center gap-2">
                {action.label}
                {action.icon && <span>{action.icon}</span>}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
