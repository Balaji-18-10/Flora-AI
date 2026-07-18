/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { 
  Sprout, 
  Droplet, 
  Plus, 
  Calendar, 
  Search, 
  ChevronRight, 
  FileSpreadsheet, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Plant, CareLog } from '../types';
import toast from 'react-hot-toast';
import { db, storage } from '../firebase/config';
import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete confirmation states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New plant form states
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState('');
  const [newLocation, setNewLocation] = useState<'indoor' | 'outdoor' | 'office' | 'greenhouse'>('indoor');
  const [newWateringDays, setNewWateringDays] = useState('7');
  const [newNotes, setNewNotes] = useState('');

  // Image Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initial Seed Data if local storage is empty
  useEffect(() => {
    const storedPlants = localStorage.getItem(`flora_plants_${user?.uid}`);
    if (storedPlants) {
      try {
        setPlants(JSON.parse(storedPlants));
      } catch {
        setPlants([]);
      }
    } else {
      const defaultPlants: Plant[] = [
        {
          id: 'p1',
          userId: user?.uid || '1',
          name: 'Monstera Deliciosa',
          species: 'Split-leaf philodendron',
          nickname: 'Monty',
          location: 'indoor',
          wateringFrequencyDays: 7,
          lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          nextWatering: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'healthy',
          imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=600&auto=format&fit=crop',
          notes: 'Likes high humidity and bright, indirect light.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'p2',
          userId: user?.uid || '1',
          name: 'Snake Plant',
          species: 'Sansevieria trifasciata',
          nickname: 'Zack',
          location: 'office',
          wateringFrequencyDays: 14,
          lastWatered: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), // 13 days ago
          nextWatering: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'needs_attention',
          imageUrl: 'https://images.unsplash.com/photo-1593487568522-746db8894941?q=80&w=600&auto=format&fit=crop',
          notes: 'Extremely resilient. Tolerates low light.',
          createdAt: new Date().toISOString()
        }
      ];
      setPlants(defaultPlants);
      localStorage.setItem(`flora_plants_${user?.uid}`, JSON.stringify(defaultPlants));
    }
  }, [user?.uid]);

  const savePlantsToStorage = (updatedPlants: Plant[]) => {
    setPlants(updatedPlants);
    localStorage.setItem(`flora_plants_${user?.uid}`, JSON.stringify(updatedPlants));
  };

  // Image upload helpers
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const clearImageSelection = () => {
    setSelectedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setUploadProgress(null);
    setIsUploading(false);
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WEBP image formats are allowed.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum allowed size is 10 MB.');
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSpecies) {
      toast.error('Name and Species are required');
      return;
    }

    const plantId = 'plant_' + Math.random().toString(36).substr(2, 9);
    const freq = parseInt(newWateringDays) || 7;
    const now = new Date();
    const nextDate = new Date();
    nextDate.setDate(now.getDate() + freq);

    let finalImageUrl = 'https://images.unsplash.com/photo-1512428813824-f4b0c04757fd?q=80&w=600&auto=format&fit=crop'; // default plant image
    let finalImagePath = '';

    const toastId = toast.loading('Adding plant companion...');
    setIsUploading(true);

    try {
      // 1. Upload to Firebase Storage if a file was selected and storage is configured
      if (selectedFile) {
        if (!storage) {
          throw new Error('Firebase Storage is not configured or available.');
        }

        const path = `plants/${user?.uid || '1'}/${plantId}/image`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        const uploadPromise = new Promise<{ url: string; path: string }>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ url: downloadURL, path });
              } catch (err) {
                reject(err);
              }
            }
          );
        });

        const { url, path: uploadedPath } = await uploadPromise;
        finalImageUrl = url;
        finalImagePath = uploadedPath;
      }

      const newPlant: Plant = {
        id: plantId,
        userId: user?.uid || '1',
        name: newName,
        species: newSpecies,
        location: newLocation,
        wateringFrequencyDays: freq,
        lastWatered: now.toISOString(),
        nextWatering: nextDate.toISOString(),
        healthStatus: 'healthy',
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
        notes: newNotes,
        createdAt: now.toISOString()
      };

      // 2. Save to Firestore if db is configured
      if (db) {
        try {
          await setDoc(doc(db, 'plants', newPlant.id), newPlant);
        } catch (fsError: any) {
          console.error("Firestore save plant error:", fsError);
          throw new Error(`Firestore Error: ${fsError.message || fsError}`);
        }
      }

      // 3. Save to Local Storage
      const updated = [newPlant, ...plants];
      savePlantsToStorage(updated);
      
      // Also log this creation inside CareHistory logs!
      addCareLog(newPlant.id, newPlant.name, 'diagnosis', 'Added plant to garden');

      // Reset Form and States
      setNewName('');
      setNewSpecies('');
      setNewLocation('indoor');
      setNewWateringDays('7');
      setNewNotes('');
      clearImageSelection();
      setIsAddModalOpen(false);
      toast.success(`${newPlant.name} successfully added!`, { id: toastId });
    } catch (error: any) {
      console.error("Adding plant failed:", error);
      toast.error(`Failed to add plant: ${error.message || error}`, { id: toastId });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleWaterPlant = (id: string) => {
    const now = new Date();
    const updated = plants.map(plant => {
      if (plant.id === id) {
        const nextDate = new Date();
        nextDate.setDate(now.getDate() + plant.wateringFrequencyDays);
        
        // Also log this inside care logs
        addCareLog(plant.id, plant.name, 'watering', 'Watered through quick-action dashboard');

        return {
          ...plant,
          lastWatered: now.toISOString(),
          nextWatering: nextDate.toISOString(),
          healthStatus: 'healthy' as const
        };
      }
      return plant;
    });

    savePlantsToStorage(updated);
    toast.success('Gave your plant companion a drink! 💧');
  };

  const handleDeletePlantClick = (plant: Plant) => {
    setPlantToDelete(plant);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePlant = async () => {
    if (!plantToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${plantToDelete.name}...`);

    try {
      // 1. Delete from Firestore if db is configured
      if (db) {
        try {
          const plantDocRef = doc(db, 'plants', plantToDelete.id);
          await deleteDoc(plantDocRef);
        } catch (fsError: any) {
          console.error("Firestore deletion error:", fsError);
          throw new Error(`Firestore Error: ${fsError.message || fsError}`);
        }
      }

      // 2. Delete corresponding image from Storage if storage is configured and imageUrl is valid
      if (storage) {
        const pathToDelete = plantToDelete.imagePath || (plantToDelete.imageUrl && (plantToDelete.imageUrl.includes('firebasestorage.googleapis.com') || plantToDelete.imageUrl.startsWith('gs://')) ? plantToDelete.imageUrl : null);
        if (pathToDelete) {
          try {
            const imageRef = ref(storage, pathToDelete);
            await deleteObject(imageRef);
          } catch (storageError: any) {
            console.error("Storage deletion error:", storageError);
            // Handle edge case: "Storage file already deleted" (object-not-found)
            if (storageError.code !== 'storage/object-not-found') {
              throw new Error(`Storage Error: ${storageError.message || storageError}`);
            }
          }
        }
      }

      // 3. Remove the plant immediately from UI and LocalStorage
      const updated = plants.filter(p => p.id !== plantToDelete.id);
      savePlantsToStorage(updated);

      toast.success('Plant deleted successfully.', { id: toastId });
      setIsDeleteModalOpen(false);
      setPlantToDelete(null);
    } catch (error: any) {
      console.error("Deletion failed:", error);
      toast.error(`Deletion failed: ${error.message || error}`, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const addCareLog = (plantId: string, plantName: string, type: CareLog['type'], notes: string) => {
    const storedLogs = localStorage.getItem(`flora_logs_${user?.uid}`);
    let logs: CareLog[] = [];
    if (storedLogs) {
      try {
        logs = JSON.parse(storedLogs);
      } catch {
        logs = [];
      }
    }
    const newLog: CareLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      plantId,
      plantName,
      type,
      date: new Date().toISOString(),
      notes,
      performedBy: user?.displayName || 'User'
    };
    localStorage.setItem(`flora_logs_${user?.uid}`, JSON.stringify([newLog, ...logs]));
  };

  const filteredPlants = plants.filter(plant => 
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    plant.species.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const needsWateringCount = plants.filter(p => new Date(p.nextWatering) <= new Date()).length;

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 bg-[#F9FBF9]">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A2E1A] tracking-tight font-display">
            Welcome, {user?.displayName || 'Botanist'}!
          </h1>
          <p className="text-sm text-emerald-900/75 font-medium">
            Here is an overview of your smart botanical sanctuary today.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
          className="shadow-lg shadow-[#22C55E]/20"
        >
          Add Companion Plant
        </Button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="glass" className="p-6 border-[rgba(34,197,94,0.12)] bg-white/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60">Total Companions</p>
              <h3 className="text-3xl font-black text-[#1A2E1A] mt-1">{plants.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#86EFAC]/20 text-[#16A34A] flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 border-[rgba(34,197,94,0.12)] bg-white/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60">Needs Watering</p>
              <h3 className="text-3xl font-black text-blue-950 mt-1">{needsWateringCount}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${needsWateringCount > 0 ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-blue-50 text-blue-500'} flex items-center justify-center`}>
              <Droplet className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 border-[rgba(34,197,94,0.12)] bg-white/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60">Attention Needed</p>
              <h3 className="text-3xl font-black text-rose-950 mt-1">
                {plants.filter(p => p.healthStatus !== 'healthy').length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* List and search bar section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950 self-start">My Plant Collection</h2>
          
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search your botanical list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-emerald-500" />}
            />
          </div>
        </div>

        {filteredPlants.length === 0 ? (
          <Card variant="outline" className="p-12 text-center max-w-md mx-auto space-y-4 border-dashed">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950">No plant companions found</h3>
            <p className="text-xs text-emerald-800/70">
              Get started by adding your first plant to track watering cycles and botanical growth parameters.
            </p>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Your First Plant
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => {
              const isOverdue = new Date(plant.nextWatering) <= new Date();
              
              return (
                <Card key={plant.id} variant="glass" className="group relative border-[rgba(34,197,94,0.12)] bg-white hover:shadow-xl">
                  {/* Plant Image Cover */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={plant.imageUrl} 
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 flex space-x-1.5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        plant.healthStatus === 'healthy' 
                          ? 'bg-[#D1FAE5] text-[#065F46] border border-[#22C55E]/20' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      }`}>
                        {plant.healthStatus.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-emerald-950 border border-[rgba(34,197,94,0.12)] backdrop-blur-sm">
                        {plant.location}
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-extrabold text-emerald-950 text-lg group-hover:text-[#22C55E] transition-colors">
                        {plant.name}
                      </h3>
                      <p className="text-xs text-emerald-600/80 italic font-medium">{plant.species}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs bg-emerald-50/40 p-3 rounded-2xl border border-emerald-50">
                      <div>
                        <p className="text-emerald-800/60 font-semibold uppercase tracking-wider text-[9px]">Last Watered</p>
                        <p className="font-bold text-emerald-950 mt-0.5">
                          {new Date(plant.lastWatered).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-emerald-800/60 font-semibold uppercase tracking-wider text-[9px]">Interval</p>
                        <p className="font-bold text-emerald-950 mt-0.5">Every {plant.wateringFrequencyDays} days</p>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-50">
                      <div className="text-[11px] font-semibold flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span className={isOverdue ? "text-rose-600 font-bold" : "text-emerald-800"}>
                          {isOverdue 
                            ? "Watering Overdue" 
                            : `Water in ${Math.ceil((new Date(plant.nextWatering).getTime() - Date.now()) / (24 * 60 * 60 * 1000))}d`
                          }
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link 
                          to="/companion" 
                          className="p-2 text-emerald-800/60 hover:text-[#16A34A] hover:bg-emerald-50 rounded-full transition-colors flex items-center justify-center"
                          title="Talk to AI Companion"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                        </Link>
                        <Button 
                          variant={isOverdue ? "primary" : "outline"} 
                          size="sm" 
                          onClick={() => handleWaterPlant(plant.id)}
                          leftIcon={<Droplet className="w-3.5 h-3.5" />}
                        >
                          Water
                        </Button>
                        <button 
                          onClick={() => handleDeletePlantClick(plant)}
                          className="p-2 text-emerald-800/60 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                          title="Delete Plant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reusable Modal for Adding Plants */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => !isUploading && setIsAddModalOpen(false)} 
        title="Add Plant Companion"
        footer={
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={isUploading}>Cancel</Button>
            <Button variant="primary" onClick={handleAddPlant} isLoading={isUploading} disabled={isUploading}>Save Companion</Button>
          </div>
        }
      >
        <form onSubmit={handleAddPlant} className="space-y-4">
          <Input 
            label="Plant Name / Nickname" 
            placeholder="e.g. Monty, Greenie" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required
            disabled={isUploading}
          />
          <Input 
            label="Plant Species" 
            placeholder="e.g. Monstera Deliciosa, Fiddle Leaf Fig" 
            value={newSpecies} 
            onChange={(e) => setNewSpecies(e.target.value)} 
            required
            disabled={isUploading}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">Location</label>
              <select 
                value={newLocation} 
                onChange={(e: any) => setNewLocation(e.target.value)}
                className="w-full py-2.5 px-4 rounded-2xl border-2 border-emerald-100 bg-white text-emerald-950 text-sm focus:border-[#22C55E] focus:outline-none disabled:opacity-50"
                disabled={isUploading}
              >
                <option value="indoor">Indoor (Home)</option>
                <option value="outdoor">Outdoor (Garden)</option>
                <option value="office">Office</option>
                <option value="greenhouse">Greenhouse</option>
              </select>
            </div>

            <Input 
              label="Watering Interval (Days)" 
              type="number" 
              min="1" 
              max="90" 
              value={newWateringDays} 
              onChange={(e) => setNewWateringDays(e.target.value)} 
              required
              disabled={isUploading}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">Care Instructions / Notes</label>
            <textarea 
              rows={3} 
              placeholder="Any specific care notes or placement suggestions..." 
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full py-2.5 px-4 rounded-2xl border-2 border-emerald-100 bg-white text-emerald-950 text-sm focus:border-[#22C55E] focus:outline-none disabled:opacity-50"
              disabled={isUploading}
            />
          </div>

          {/* Drag & Drop Image Upload Section */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">Plant Image</label>
            
            {imagePreviewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-100 group aspect-video bg-emerald-50/10">
                <img 
                  src={imagePreviewUrl} 
                  alt="Selected plant preview" 
                  className="w-full h-full object-cover"
                />
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors duration-200"
                      title="Remove Image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-[#1A2E1A]/85 text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 font-medium backdrop-blur-xs">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && document.getElementById('plant-image-upload')?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 group ${
                  isDragActive 
                    ? 'border-[#22C55E] bg-emerald-50/50' 
                    : 'border-emerald-100 hover:border-[#22C55E] hover:bg-emerald-50/20'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-950">
                    Drag and drop your image here, or <span className="text-[#22C55E]">browse</span>
                  </p>
                  <p className="text-xs text-emerald-800/60 mt-1">
                    Supports JPG, JPEG, PNG, WEBP (Max 10MB)
                  </p>
                </div>
                <input 
                  id="plant-image-upload"
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden" 
                  disabled={isUploading}
                />
              </div>
            )}

            {/* Progress Bar / Indicator */}
            {isUploading && uploadProgress !== null && (
              <div className="w-full bg-emerald-50 rounded-full h-2 mt-2 overflow-hidden border border-emerald-100">
                <div 
                  className="bg-[#22C55E] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
                <div className="flex justify-between items-center text-[10px] text-emerald-800 font-semibold mt-1 px-1">
                  <span>Uploading Image...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Plant?"
        footer={
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDeletePlant}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-emerald-950 font-medium">
            Are you sure you want to permanently delete <strong className="text-[#1A2E1A]">{plantToDelete?.name}</strong>?
          </p>
          <p className="text-xs text-emerald-800/60 leading-normal">
            Are you sure you want to permanently delete this plant? This action cannot be undone. All recorded care schedules, localized telemetry diagnostic data, and its AI character identity will be removed from the portal database.
          </p>
        </div>
      </Modal>
    </div>
  );
};
