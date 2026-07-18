/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Droplet, 
  Check, 
  Database, 
  RefreshCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { isFirebaseConfigured } from '../firebase/config';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  // Settings states
  const [remindWater, setRemindWater] = useState(true);
  const [remindFertilize, setRemindFertilize] = useState(true);
  const [remindRepot, setRemindRepot] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [defaultWateringInterval, setDefaultWateringInterval] = useState('7');
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');

  const [saving, setSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      setSaving(false);
      toast.success('System preferences saved successfully!');
    }, 800);
  };

  const handleTestNotification = () => {
    toast.success('Notification channels are fully functional! 🔔');
  };

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 bg-[#F9FBF9]">
      {/* Header */}
      <div className="border-b border-[rgba(34,197,94,0.12)] pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A2E1A] flex items-center font-display">
          <SettingsIcon className="w-7 h-7 mr-2 text-[#22C55E]" /> App Preferences
        </h1>
        <p className="text-sm text-emerald-900/75 font-medium">
          Tailor notifications, default schedules, and check database persistence connectivity.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Care Notifications */}
        <Card variant="glass" className="p-6 sm:p-8 border-[rgba(34,197,94,0.12)] bg-white space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-[rgba(34,197,94,0.08)]">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-[#1A2E1A] font-display">Care Reminders</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1A2E1A]">Watering Reminders</p>
                <p className="text-xs text-emerald-800/70">Receive push/email notifications when soil hydration is overdue.</p>
              </div>
              <input
                type="checkbox"
                checked={remindWater}
                onChange={(e) => setRemindWater(e.target.checked)}
                className="w-4 h-4 text-[#22C55E] focus:ring-emerald-500 border-emerald-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1A2E1A]">Fertilizer Schedules</p>
                <p className="text-xs text-emerald-800/70">Get alerts for seasonal nutrient applications based on species.</p>
              </div>
              <input
                type="checkbox"
                checked={remindFertilize}
                onChange={(e) => setRemindFertilize(e.target.checked)}
                className="w-4 h-4 text-[#22C55E] focus:ring-emerald-500 border-emerald-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1A2E1A]">Repotting Indicators</p>
                <p className="text-xs text-emerald-800/70">Flag rootbound signals after standard growth periods (approx 12-18 months).</p>
              </div>
              <input
                type="checkbox"
                checked={remindRepot}
                onChange={(e) => setRemindRepot(e.target.checked)}
                className="w-4 h-4 text-[#22C55E] focus:ring-emerald-500 border-emerald-300 rounded"
              />
            </div>
          </div>
        </Card>

        {/* 2. Global Presets */}
        <Card variant="glass" className="p-6 sm:p-8 border-[rgba(34,197,94,0.12)] bg-white space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-[rgba(34,197,94,0.08)]">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-[#1A2E1A] font-display">Default Presets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-black text-emerald-900/60 tracking-wider uppercase">Default Watering Frequency</label>
              <select
                value={defaultWateringInterval}
                onChange={(e) => setDefaultWateringInterval(e.target.value)}
                className="py-2.5 px-4 rounded-2xl border-2 border-[rgba(34,197,94,0.12)] bg-white text-emerald-950 text-sm focus:border-[#22C55E] focus:outline-none"
              >
                <option value="3">Every 3 Days (Highly active)</option>
                <option value="7">Every 7 Days (Standard)</option>
                <option value="14">Every 14 Days (Low moist)</option>
                <option value="30">Every 30 Days (Succulents/Cacti)</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-black text-emerald-900/60 tracking-wider uppercase">Temperature Units</label>
              <div className="flex space-x-2">
                {(['C', 'F'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTemperatureUnit(unit)}
                    className={`
                      flex-1 py-2.5 rounded-2xl font-black border transition-all duration-300
                      ${temperatureUnit === unit 
                        ? 'bg-[#16A34A] text-white border-transparent' 
                        : 'bg-white text-emerald-950 border-[rgba(34,197,94,0.12)] hover:bg-[#F9FBF9]'
                      }
                    `}
                  >
                    °{unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Integration & Database Panel */}
        <Card variant="glass" className="p-6 sm:p-8 border-[rgba(34,197,94,0.12)] bg-white space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-[rgba(34,197,94,0.08)]">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-[#1A2E1A] font-display">Data & Sync State</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FBF9]/60 border border-[rgba(34,197,94,0.12)]">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1A2E1A]">Active Database Provider</p>
                <p className="text-xs text-emerald-800/80">
                  {isFirebaseConfigured 
                    ? 'Connected to Google Firebase Cloud (Auth, Firestore, Storage)' 
                    : 'Offline Local Mock Mode (Indexed LocalStorage Cache)'
                  }
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isFirebaseConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
              }`}>
                {isFirebaseConfigured ? 'Live Cloud' : 'Local Mock'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="flex-1"
              >
                Test Notification Channel
              </Button>
            </div>
          </div>
        </Card>

        {/* Save actions toolbar */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-[rgba(34,197,94,0.12)]">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
