/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`
              relative w-full ${sizes[size]} bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-50/50
              flex flex-col overflow-hidden z-10 max-h-[90vh]
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-50">
              <h3 className="text-lg font-bold text-emerald-900">{title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 hover:bg-emerald-100 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-emerald-700" />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 px-6 py-5 overflow-y-auto text-emerald-800 text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer (Optional) */}
            {footer && (
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-emerald-50 bg-emerald-50/20">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
