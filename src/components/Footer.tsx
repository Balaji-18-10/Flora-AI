/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Heart, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-emerald-950 border-t border-[rgba(34,197,94,0.12)]">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#22C55E] flex items-center justify-center text-white font-black text-sm">
                F
              </div>
              <span className="font-sans font-extrabold text-lg text-emerald-950 tracking-tight">Flora AI</span>
            </div>
            <p className="text-sm text-emerald-900/75 max-w-sm leading-relaxed">
              Empowering plant parents worldwide with intelligent diagnostics, personalized care plans, and detailed scheduling for every species.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase text-emerald-950 tracking-wider mb-4">Application</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-emerald-800 hover:text-[#22C55E] transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-emerald-800 hover:text-[#22C55E] transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-emerald-800 hover:text-[#22C55E] transition-colors duration-200">
                  Care History
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase text-emerald-950 tracking-wider mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <a href="mailto:support@floraai.example" className="hover:text-emerald-950 transition-colors">
                  support@floraai.example
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-emerald-500" />
                <span className="hover:text-emerald-950 transition-colors cursor-pointer">github.com/flora-ai</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(34,197,94,0.08)] flex flex-col sm:flex-row justify-between items-center text-xs text-emerald-700/60 font-medium">
          <p>© {new Date().getFullYear()} Flora AI Technologies Inc. All rights reserved.</p>
          <p className="flex items-center mt-4 sm:mt-0">
            Nurtured with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" /> for plant life.
          </p>
        </div>
      </div>
    </footer>
  );
};
