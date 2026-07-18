/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-md shadow-[#22C55E]/20 hover:shadow-[#16A34A]/30 focus:ring-[#22C55E]',
    secondary: 'bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] hover:text-[#115E2E] focus:ring-emerald-300',
    outline: 'border-2 border-emerald-200 hover:border-[#22C55E] text-emerald-700 hover:bg-emerald-50 focus:ring-[#22C55E]',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 focus:ring-rose-500',
    ghost: 'text-emerald-700 hover:bg-emerald-50 focus:ring-[#22C55E]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-full',
    md: 'px-5 py-2.5 text-sm rounded-full',
    lg: 'px-6 py-3.5 text-base rounded-full'
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      whileHover={{ y: disabled || isLoading ? 0 : -1 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};
