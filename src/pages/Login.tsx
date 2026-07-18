/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Leaf, Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Toast message is handled in AuthContext, we just reset loading state here
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      // Handled in Context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-[#F0FDF4] via-emerald-50/20 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card variant="glass" className="p-8 md:p-10 border-emerald-100/50 shadow-2xl relative overflow-hidden">
          {/* Subtle background plant aesthetics */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-6">
            {/* Logo and Greeting */}
            <div className="flex flex-col items-center space-y-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#22C55E]/20">
                  <Leaf className="w-5 h-5 text-white transform -rotate-12" />
                </div>
              </Link>
              <h2 className="text-2xl font-extrabold text-emerald-950 mt-2">Welcome Back</h2>
              <p className="text-xs text-emerald-700 font-medium">Log in to check on your smart garden</p>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                leftIcon={<Lock className="w-4 h-4" />}
                disabled={loading}
              />

              <div className="flex justify-end text-xs">
                <span className="font-semibold text-[#16A34A] hover:text-[#22C55E] cursor-pointer transition-colors duration-200">
                  Forgot password?
                </span>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full justify-center"
                isLoading={loading}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Log In
              </Button>
            </form>

            <div className="relative w-full flex py-2 items-center">
              <div className="flex-grow border-t border-emerald-100"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-emerald-600/60 uppercase tracking-wide">
                Or continue with
              </span>
              <div className="flex-grow border-t border-emerald-100"></div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="
                w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-full border-2 border-emerald-100/80 bg-white/50 hover:bg-emerald-50/50
                text-emerald-900 font-semibold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.12.57 4.29 1.69l3.21-3.21C17.55 1.76 14.99 1 12 1 7.37 1 3.4 3.66 1.48 7.55l3.83 2.97C6.26 7.42 8.9 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.44c-.28 1.47-1.11 2.72-2.35 3.56l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.31 14.48c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.48 6.95C.53 8.87 0 11.02 0 13.25c0 2.23.53 4.38 1.48 6.3l3.83-2.97c-.24-.72-.38-1.49-.38-2.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.8 1.09-3.1 0-5.74-2.38-6.69-5.48L1.48 15.8C3.4 19.69 7.37 23 12 23z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            {/* Link to Signup */}
            <p className="text-xs font-semibold text-emerald-800">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#16A34A] hover:text-[#22C55E] transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
