/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Growing something beautiful...',
  size = 'md',
  fullPage = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-emerald-500',
    md: 'w-12 h-12 text-[#22C55E]',
    lg: 'w-16 h-16 text-[#16A34A]',
  };

  const containerStyle = fullPage 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md"
    : "flex flex-col items-center justify-center p-8 space-y-4";

  return (
    <div className={containerStyle}>
      <div className="relative">
        {/* Soft pulse background ring */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-emerald-100"
        />
        
        {/* Animated growing/spinning leaf */}
        <motion.div
          animate={{ rotate: 360, scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`relative z-10 flex items-center justify-center`}
        >
          <Leaf className={sizeClasses[size]} strokeWidth={1.5} />
        </motion.div>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-semibold tracking-wide uppercase text-emerald-800"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};
