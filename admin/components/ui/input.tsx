'use client';
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => (
  <input
    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
    {...props}
  />
);
