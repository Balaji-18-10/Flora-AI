/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-xs font-semibold text-emerald-800 tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-emerald-600 flex items-center justify-center pointer-events-none">
            {leftIcon}
          </span>
        )}
        
        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          className={`
            w-full py-2.5 px-4 rounded-2xl border-2 border-emerald-100 bg-white/70 backdrop-blur-sm
            text-emerald-950 placeholder-emerald-400 text-sm transition-all duration-300
            focus:border-[#22C55E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none
            disabled:opacity-60 disabled:bg-emerald-50/50
            ${leftIcon ? 'pl-11' : ''}
            ${isPassword || rightIcon ? 'pr-11' : ''}
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : ''}
            ${className}
          `}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-emerald-600 hover:text-emerald-800 flex items-center justify-center focus:outline-none focus:text-[#22C55E]"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        ) : rightIcon ? (
          <span className="absolute right-3.5 text-emerald-600 flex items-center justify-center pointer-events-none">
            {rightIcon}
          </span>
        ) : null}
      </div>

      {error ? (
        <span className="text-xs font-medium text-rose-500 mt-0.5">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-emerald-600/70 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
