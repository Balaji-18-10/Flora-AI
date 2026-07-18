/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { UserProfile } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateUserProfile: (displayName: string, bio?: string, location?: string) => Promise<void>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(!isFirebaseConfigured);

  // Sync state for real or mock authentication
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`,
            bio: 'Flora Enthusiast',
            location: 'Garden City',
            createdAt: new Date().toISOString(),
          });
          setIsMock(false);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Authentication Setup using localStorage
      const storedUser = localStorage.getItem('flora_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('flora_user');
        }
      }
      setLoading(false);
      setIsMock(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back to Flora AI!');
      } else {
        // Mock Login
        const storedUsersStr = localStorage.getItem('flora_registered_users') || '[]';
        const users = JSON.parse(storedUsersStr);
        const matchedUser = users.find((u: any) => u.email === email && u.password === password);
        
        if (matchedUser) {
          const profile: UserProfile = {
            uid: matchedUser.uid,
            email: matchedUser.email,
            displayName: matchedUser.displayName,
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${matchedUser.uid}`,
            bio: 'Flora Enthusiast',
            location: 'Garden City',
            createdAt: matchedUser.createdAt,
          };
          localStorage.setItem('flora_user', JSON.stringify(profile));
          setUser(profile);
          toast.success('Logged in successfully (Local Mock Mode)!');
        } else {
          throw new Error('Invalid email or password. (For testing, signup a new account first).');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseUpdateProfile(userCredential.user, { displayName });
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userCredential.user.uid}`,
          bio: 'Flora Enthusiast',
          location: 'Garden City',
          createdAt: new Date().toISOString(),
        });
        toast.success('Account created successfully!');
      } else {
        // Mock Signup
        const uid = 'mock_uid_' + Math.random().toString(36).substr(2, 9);
        const newUser = {
          uid,
          email,
          password,
          displayName,
          createdAt: new Date().toISOString()
        };

        const storedUsersStr = localStorage.getItem('flora_registered_users') || '[]';
        const users = JSON.parse(storedUsersStr);
        
        if (users.some((u: any) => u.email === email)) {
          throw new Error('Email already registered.');
        }

        users.push(newUser);
        localStorage.setItem('flora_registered_users', JSON.stringify(users));

        const profile: UserProfile = {
          uid,
          email,
          displayName,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
          bio: 'Flora Enthusiast',
          location: 'Garden City',
          createdAt: newUser.createdAt,
        };
        localStorage.setItem('flora_user', JSON.stringify(profile));
        setUser(profile);
        toast.success('Account registered successfully (Local Mock Mode)!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      } else {
        localStorage.removeItem('flora_user');
        setUser(null);
      }
      toast.success('Logged out successfully.');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        toast.success('Welcome back to Flora AI!');
      } else {
        // Mock Google Sign In
        const uid = 'google_mock_' + Math.random().toString(36).substr(2, 9);
        const profile: UserProfile = {
          uid,
          email: 'google_user@example.com',
          displayName: 'Google Partner',
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
          bio: 'Flora Expert',
          location: 'Silicon Valley',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('flora_user', JSON.stringify(profile));
        setUser(profile);
        toast.success('Logged in with Mock Google Account!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (displayName: string, bio?: string, location?: string) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, displayName, bio, location };
      if (isFirebaseConfigured && auth?.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName });
        // Since custom profile fields (bio, location) are firestore-dependent,
        // we update our local state representatively
      }
      
      if (!isFirebaseConfigured) {
        localStorage.setItem('flora_user', JSON.stringify(updatedUser));
      }
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Profile update failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle, updateUserProfile, isMock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
