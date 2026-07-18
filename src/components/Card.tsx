/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'outline' | 'gradient';
  isHoverable?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  isHoverable = false,
  onClick,
  className = '',
  id,
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-300 overflow-hidden';
  
  const variants = {
    glass: 'bg-white/85 backdrop-blur-md border border-[rgba(34,197,94,0.12)] shadow-xl shadow-emerald-950/5',
    solid: 'bg-white border border-[rgba(34,197,94,0.12)] shadow-sm shadow-emerald-950/2',
    outline: 'border-2 border-dashed border-[rgba(34,197,94,0.12)] bg-[#F9FBF9]/30 shadow-none',
    gradient: 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/20 to-white border border-[rgba(34,197,94,0.12)] shadow-lg'
  };

  const interactiveStyles = onClick || isHoverable 
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/10' 
    : '';

  const Component = isHoverable || onClick ? motion.div : 'div';
  const motionProps = isHoverable || onClick 
    ? { whileTap: { scale: 0.99 }, transition: { duration: 0.2 } } 
    : {};

  return (
    <Component
      id={id}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  );
};
