'use client';
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => (
  <input className="w-full px-3 py-2 border rounded" {...props} />
);
