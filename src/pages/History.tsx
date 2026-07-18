/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  History as HistoryIcon, 
  Droplet, 
  Sprout, 
  Plus, 
  Trash2,
  Activity,
  HeartCrack,
  Tag
} from 'lucide-react';
import { CareLog } from '../types';
import toast from 'react-hot-toast';
import { Modal } from '../components/Modal';
import { db, storage } from '../firebase/config';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

export const History: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'watering' | 'diagnosis' | 'repotting'>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const storedLogs = localStorage.getItem(`flora_logs_${user?.uid}`);
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch {
        setLogs([]);
      }
    } else {
      // Seed default logs for elegant presentation
      const defaultLogs: CareLog[] = [
        {
          id: 'l1',
          plantId: 'p1',
          plantName: 'Monstera Deliciosa',
          type: 'watering',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Watered thoroughly until soil was completely moist.',
          performedBy: user?.displayName || 'User'
        },
        {
          id: 'l2',
          plantId: 'p2',
          plantName: 'Snake Plant',
          type: 'diagnosis',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Identified minor overwatering leaf softeness. Relocated to higher office ventilation.',
          performedBy: user?.displayName || 'User'
        },
        {
          id: 'l3',
          plantId: 'p1',
          plantName: 'Monstera Deliciosa',
          type: 'repotting',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Repotted into a 12-inch terracotta planter with rich organic draining mix.',
          performedBy: user?.displayName || 'User'
        }
      ];
      setLogs(defaultLogs);
      localStorage.setItem(`flora_logs_${user?.uid}`, JSON.stringify(defaultLogs));
    }
  }, [user?.uid]);

  const handleClearLogs = () => {
    if (logs.length === 0) {
      toast('No history available to clear.', { icon: 'ℹ️' });
      return;
    }
    setIsClearModalOpen(true);
  };

  const confirmClearHistory = async () => {
    if (!user) {
      toast.error('You must be logged in to clear history.');
      return;
    }
    setIsClearing(true);
    const toastId = toast.loading('Clearing plant history...');

    try {
      // 1. Delete all history documents from Firebase Firestore that belong only to the currently logged-in user.
      if (db) {
        const collectionsToClear = ['logs', 'care_logs', 'history'];
        
        for (const colName of collectionsToClear) {
          try {
            const q = query(collection(db, colName), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              const batch = writeBatch(db);
              
              for (const docSnapshot of snapshot.docs) {
                const data = docSnapshot.data();
                
                // If history contains image references, also delete those images from Firebase Storage
                const imageUrl = data.imageUrl || data.image || data.photoURL;
                if (storage && imageUrl) {
                  const isFirebaseStorage = imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.startsWith('gs://');
                  if (isFirebaseStorage) {
                    try {
                      const imageRef = ref(storage, imageUrl);
                      await deleteObject(imageRef);
                    } catch (storageError: any) {
                      console.error(`Failed to delete storage image: ${imageUrl}`, storageError);
                      // Handle edge case: "Storage file already deleted" (object-not-found)
                      if (storageError.code !== 'storage/object-not-found') {
                        throw storageError;
                      }
                    }
                  }
                }
                
                batch.delete(docSnapshot.ref);
              }
              
              await batch.commit();
            }
          } catch (colError) {
            console.warn(`Could not clear collection ${colName}:`, colError);
          }
        }
      }

      // 2. Also check if any logs in local state had image references to be super thorough
      if (storage) {
        for (const log of logs) {
          const logData = log as any;
          const imageUrl = logData.imageUrl || logData.image;
          if (imageUrl) {
            const isFirebaseStorage = imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.startsWith('gs://');
            if (isFirebaseStorage) {
              try {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
              } catch (storageError: any) {
                console.error(`Failed to delete image: ${imageUrl}`, storageError);
              }
            }
          }
        }
      }

      // 3. Remove all history items from React state immediately so UI updates without refreshing
      setLogs([]);
      localStorage.setItem(`flora_logs_${user.uid}`, JSON.stringify([]));

      toast.success('Plant history cleared successfully.', { id: toastId });
      setIsClearModalOpen(false);
    } catch (error: any) {
      console.error('Failed to clear plant history:', error);
      toast.error(`Clear failed: ${error.message || error}`, { id: toastId });
    } finally {
      setIsClearing(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'all') return true;
    return log.type === activeFilter;
  });

  const getLogIcon = (type: CareLog['type']) => {
    switch (type) {
      case 'watering':
        return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'repotting':
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'diagnosis':
        return <Activity className="w-5 h-5 text-amber-500" />;
      default:
        return <Tag className="w-5 h-5 text-emerald-700" />;
    }
  };

  const getLogColor = (type: CareLog['type']) => {
    switch (type) {
      case 'watering': return 'bg-blue-50/30 border-blue-100';
      case 'repotting': return 'bg-emerald-50/30 border-[rgba(34,197,94,0.12)]';
      case 'diagnosis': return 'bg-amber-50/30 border-amber-100';
      default: return 'bg-slate-50/30 border-slate-100';
    }
  };

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 bg-[#F9FBF9]">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(34,197,94,0.12)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1A] flex items-center font-display">
            <HistoryIcon className="w-7 h-7 mr-2 text-[#22C55E]" /> Care History Logs
          </h1>
          <p className="text-sm text-emerald-900/75 font-medium">
            A secure chronological timeline of all watering, repotting, and health actions taken.
          </p>
        </div>
        {logs.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearLogs}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-400 font-bold"
            leftIcon={<Trash2 className="w-4 h-4" />}
            disabled={isClearing}
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'watering', 'repotting', 'diagnosis'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300
              ${activeFilter === filter 
                ? 'bg-[#16A34A] text-white border-transparent shadow-md shadow-emerald-800/10' 
                : 'bg-white hover:bg-[#F9FBF9] text-[#1A2E1A] border-[rgba(34,197,94,0.12)]'
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      {filteredLogs.length === 0 ? (
        <Card variant="outline" className="p-12 text-center max-w-md mx-auto space-y-4 border-dashed border-[rgba(34,197,94,0.12)]">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
            <HeartCrack className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#1A2E1A]">No logs matching filter</h3>
          <p className="text-xs text-emerald-800/70">
            Select a different filter category or trigger care actions from the Dashboard to log events.
          </p>
        </Card>
      ) : (
        <div className="relative border-l-2 border-[rgba(34,197,94,0.12)] ml-4 pl-6 space-y-6">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Left Timeline circular node icon */}
              <div className={`
                absolute -left-[37px] top-0.5 w-7 h-7 rounded-full border-2 border-[rgba(34,197,94,0.12)] bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110
              `}>
                {getLogIcon(log.type)}
              </div>

              {/* Log Card */}
              <Card variant="glass" className={`p-5 border bg-white ${getLogColor(log.type)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <h3 className="font-extrabold text-[#1A2E1A] text-sm sm:text-base">
                    {log.plantName} <span className="text-xs font-semibold text-emerald-800/60 uppercase tracking-wide">({log.type})</span>
                  </h3>
                  <span className="text-xs text-emerald-700/80 font-bold">
                    {new Date(log.date).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                  {log.notes}
                </p>
                <div className="mt-3 pt-2.5 border-t border-emerald-900/5 text-[10px] font-bold text-emerald-700/60 uppercase tracking-wider flex items-center justify-between">
                  <span>Authorized Caretaker: {log.performedBy}</span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => !isClearing && setIsClearModalOpen(false)}
        title="Clear Plant History?"
        footer={
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsClearModalOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmClearHistory}
              isLoading={isClearing}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear History
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-emerald-950 font-medium">
            Are you sure you want to permanently delete all plant history? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};
