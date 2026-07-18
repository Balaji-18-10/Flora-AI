/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Leaf, Menu, X, LogOut, User, LayoutDashboard, History, Settings, Home, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user, logout, isMock } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, public: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, public: false },
    { name: 'Companion AI', path: '/companion', icon: Sparkles, public: false },
    { name: 'History', path: '/history', icon: History, public: false },
    { name: 'Settings', path: '/settings', icon: Settings, public: false },
  ];

  const filteredItems = navItems.filter(item => item.public || !!user);

  const activeStyle = "flex items-center space-x-2 px-4 py-2 rounded-full text-white bg-[#16A34A] font-bold shadow-md shadow-[#22C55E]/10";
  const inactiveStyle = "flex items-center space-x-2 px-4 py-2 rounded-full text-emerald-950 hover:text-[#16A34A] hover:bg-emerald-50/50 font-bold transition-all duration-300";

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-[rgba(34,197,94,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#22C55E] flex items-center justify-center text-white font-black text-xs">
                F
              </div>
              <span className="font-sans font-extrabold text-lg tracking-tight text-emerald-950">
                Flora <span className="text-[#22C55E]">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {filteredItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Desktop CTA / Profile Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isMock && user && (
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                Mock Mode
              </span>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 group p-1 pr-3 rounded-full hover:bg-emerald-50 transition-colors duration-300">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-[#22C55E] object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-semibold text-emerald-900 group-hover:text-[#16A34A]">{user.displayName}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-emerald-800 hover:bg-emerald-50 focus:outline-none"
              aria-expanded="false"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-emerald-50 bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {isMock && user && (
                <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
                    Local Mock State Active
                  </span>
                </div>
              )}
              
              {filteredItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold
                    ${isActive 
                      ? 'bg-[#16A34A] text-white' 
                      : 'text-emerald-800 hover:bg-emerald-50/50 hover:text-[#16A34A]'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}

              <hr className="border-emerald-50 my-2" />

              {user ? (
                <div className="space-y-2 pt-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-emerald-50 text-sm font-semibold text-emerald-900"
                  >
                    <User className="w-5 h-5 text-emerald-700" />
                    <span>My Profile</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Log Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-1">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">Log In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full justify-center">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
