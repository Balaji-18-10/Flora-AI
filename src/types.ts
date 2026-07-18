/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  location?: string;
  notificationPreferences?: {
    watering: boolean;
    fertilizing: boolean;
    repotting: boolean;
    newsletter: boolean;
  };
  createdAt: string;
}

export interface Plant {
  id: string;
  userId: string;
  name: string;
  species: string;
  nickname?: string;
  location: 'indoor' | 'outdoor' | 'office' | 'greenhouse';
  wateringFrequencyDays: number;
  lastWatered: string;
  nextWatering: string;
  healthStatus: 'healthy' | 'needs_attention' | 'critical';
  imageUrl?: string;
  imagePath?: string;
  notes?: string;
  createdAt: string;
}

export interface CareLog {
  id: string;
  plantId: string;
  plantName: string;
  type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'diagnosis';
  date: string;
  notes?: string;
  performedBy: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'watering' | 'care' | 'system' | 'ai';
  read: boolean;
  createdAt: string;
}
