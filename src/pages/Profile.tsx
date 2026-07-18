/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  User, 
  Mail, 
  MapPin, 
  Award, 
  Calendar, 
  ShieldAlert, 
  PenTool,
  CheckCircle,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateUserProfile, isMock } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || 'Flora Enthusiast');
  const [location, setLocation] = useState(user?.location || 'Garden City');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(displayName, bio, location);
      setIsEditing(false);
    } catch {
      // Toast message is handled inside Context
    } finally {
      setLoading(false);
    }
  };

  const badges = [
    { id: 'b1', name: 'Seed Sower', description: 'Added first plant companion', unlocked: true, icon: '🌱' },
    { id: 'b2', name: 'Water Bearer', description: 'Watered a plant 5 times', unlocked: true, icon: '💧' },
    { id: 'b3', name: 'Master Botanist', description: 'Maintain a 100% healthy garden for 30 days', unlocked: false, icon: '👑' },
    { id: 'b4', name: 'Plant Surgeon', description: 'Diagnosed and solved a disease', unlocked: false, icon: '🔬' }
  ];

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 bg-[#F9FBF9]">
      <div className="border-b border-[rgba(34,197,94,0.12)] pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A2E1A] font-display">Botanist Profile</h1>
        <p className="text-sm text-emerald-900/75 font-medium">Manage your profile details, bio, and review your botanist achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Col: Profile info card */}
        <div className="md:col-span-4 flex flex-col space-y-4">
          <Card variant="glass" className="p-6 text-center border-[rgba(34,197,94,0.12)] bg-white space-y-4">
            <div className="relative inline-block mx-auto">
              <img
                src={user?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.uid}`}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full border-4 border-[#22C55E]/40 object-cover bg-emerald-50"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#22C55E] border-2 border-white flex items-center justify-center text-[10px] text-white" title="Active parent">
                ✓
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#1A2E1A]">{user?.displayName}</h3>
              <p className="text-xs text-emerald-600/80 italic">{user?.email}</p>
            </div>

            <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-850 font-bold bg-[#D1FAE5]/50 py-1.5 px-3 rounded-full border border-[rgba(34,197,94,0.12)] w-fit mx-auto">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user?.location || 'Garden City'}</span>
            </div>

            <p className="text-xs text-emerald-800/70 leading-relaxed border-t border-[rgba(34,197,94,0.08)] pt-3">
              "{user?.bio || 'Flora Enthusiast'}"
            </p>

            {isMock && (
              <div className="bg-amber-50 border border-amber-200/40 p-2 rounded-2xl flex items-center justify-center space-x-2 text-[10px] font-black text-amber-800 uppercase tracking-wider">
                <Database className="w-3.5 h-3.5" />
                <span>Local State Storage</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Details editing & Badges */}
        <div className="md:col-span-8 flex flex-col space-y-6">
          <Card variant="glass" className="p-6 sm:p-8 border-[rgba(34,197,94,0.12)] bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#1A2E1A] font-display">Profile Details</h3>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Display Name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black text-emerald-900/60 tracking-wider uppercase">Short Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-2xl border-2 border-[rgba(34,197,94,0.12)] bg-white text-emerald-950 text-sm focus:border-[#22C55E] focus:outline-none"
                    placeholder="Describe your plant-loving journey..."
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" isLoading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-3 py-2 border-b border-[rgba(34,197,94,0.06)]">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800/60 flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-emerald-500" /> Full Name
                  </span>
                  <span className="col-span-2 font-bold text-[#1A2E1A]">{user?.displayName}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[rgba(34,197,94,0.06)]">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800/60 flex items-center">
                    <Mail className="w-4 h-4 mr-1.5 text-emerald-500" /> Email Address
                  </span>
                  <span className="col-span-2 font-semibold text-emerald-950">{user?.email}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[rgba(34,197,94,0.06)]">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800/60 flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-emerald-500" /> Location
                  </span>
                  <span className="col-span-2 font-bold text-[#1A2E1A]">{user?.location || 'Garden City'}</span>
                </div>
                <div className="grid grid-cols-3 py-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800/60 flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-emerald-500" /> Joined
                  </span>
                  <span className="col-span-2 font-semibold text-emerald-950">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                      : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                    }
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Badges Achievements Card */}
          <Card variant="glass" className="p-6 border-[rgba(34,197,94,0.12)] bg-white">
            <h3 className="text-lg font-black text-[#1A2E1A] mb-4 flex items-center font-display">
              <Award className="w-5 h-5 mr-2 text-[#22C55E]" /> Achievements & Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`
                    p-3.5 rounded-2xl border flex items-center space-x-3.5 transition-all duration-300
                    ${badge.unlocked 
                      ? 'bg-emerald-50/20 border-[rgba(34,197,94,0.12)] text-[#1A2E1A]' 
                      : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                    }
                  `}
                >
                  <div className="text-2xl w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {badge.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="font-bold text-sm">{badge.name}</p>
                      {badge.unlocked && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />}
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-800/70">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
