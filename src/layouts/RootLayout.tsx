/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      {/* Dynamic Main Content with routing */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
