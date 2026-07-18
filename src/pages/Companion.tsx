/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { PlantAvatar } from '../components/PlantAvatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { 
  Sprout, Droplet, Sun, Scissors, Heart, Shield, RefreshCw, 
  Wind, Mic, MicOff, Volume2, VolumeX, Upload, Send, 
  Sparkles, Award, ArrowLeft, Calendar, Brain, Activity, Sparkle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface AnalysisResult {
  species: string;
  healthStatus: 'healthy' | 'dry' | 'diseased' | 'overwatered' | 'sunlight_stressed';
  leafColor: string;
  drynessLevel: 'low' | 'medium' | 'high';
  diseases: string[];
  pests: string[];
  soilCondition: string;
  waterStress: 'none' | 'mild' | 'severe';
  sunlightRequirement: 'low' | 'medium' | 'high';
  nutrientDeficiency: string;
  growthStage: string;
  confidenceScore: number;
  recommendedActions: string[];
  personalityTrait: string;
  personalityGreeting: string;
}

// Supported Voice Languages
const VOICE_LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇬🇧' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', flag: '🇮🇳' }
];

export const Companion: React.FC = () => {
  const { user } = useAuth();

  // Selected companion state
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [customPlantName, setCustomPlantName] = useState<string>('');
  
  // Available plants from database/collection to transform
  const [existingPlants, setExistingPlants] = useState<any[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);

  // Vision Analysis states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Chat/Avatar conversation states
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userTextInput, setUserTextInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // Voice States
  const [preferredLanguage, setPreferredLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Care Recovering states
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryType, setRecoveryType] = useState<'watering' | 'sunlight' | 'fertilizer' | 'repot' | 'disease_treat' | 'pruning' | 'airflow' | null>(null);
  const [recoveryTimer, setRecoveryTimer] = useState<number | null>(null);

  // Memory & Ledger logs
  const [careHistory, setCareHistory] = useState<{ id: string; type: string; date: string; notes: string }[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load user's plants and companion history on mount
  useEffect(() => {
    loadUserPlants();
  }, [user]);

  // Scroll to bottom of chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load existing plants from database or LocalStorage
  const loadUserPlants = async () => {
    if (!user) return;
    setIsLoadingPlants(true);
    try {
      if (db) {
        // Query user plants from Firestore
        const q = query(collection(db, 'plants'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setExistingPlants(list);
      } else {
        // Local fallback
        const stored = localStorage.getItem(`flora_plants_${user.uid}`);
        if (stored) {
          setExistingPlants(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPlants(false);
    }
  };

  // Convert uploaded image to base64 for API Vision
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Gemini Vision Analysis
  const runVisionAnalysis = async () => {
    if (!imagePreview) {
      toast.error('Please upload an image first.');
      return;
    }

    setIsAnalyzing(true);
    const toastId = toast.loading('Flora Vision is analyzing leaf cells, soil condition and moisture patterns...');

    try {
      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imagePreview })
      });

      if (!response.ok) {
        throw new Error('Analysis request failed. Make sure server is online.');
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
      
      // Seed first in-character message
      const firstMessage: Message = {
        role: 'model',
        text: data.personalityGreeting || `Hello there! I am your new ${data.species || 'companion'}. How can we grow together?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([firstMessage]);
      speakText(firstMessage.text, preferredLanguage);

      // Log initial care logs
      const initialLogs = [
        { id: '1', type: 'Diagnosis', date: new Date().toLocaleDateString(), notes: `Reborn with Health Score: ${data.confidenceScore}% (${data.healthStatus})` }
      ];
      setCareHistory(initialLogs);

      toast.success('Analysis complete! Your plant companion is now alive.', { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Analysis failed. Please try again.', { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text-To-Speech (TTS)
  const speakText = (text: string, langCode: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    // Try to find a voice matching the language code
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    // Set interactive visual talking states
    utterance.onstart = () => setIsTalking(true);
    utterance.onend = () => setIsTalking(false);
    utterance.onerror = () => setIsTalking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Mic Toggle)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const rec = new SpeechRecObj();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = preferredLanguage;

      rec.onstart = () => {
        setIsListening(true);
        toast.success('Listening... Speak to your plant companion.');
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setUserTextInput(text);
          sendMessage(text);
        }
      };

      rec.onerror = (err: any) => {
        console.error(err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  // Send conversation message
  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || userTextInput;
    if (!textToSend.trim() || !analysis) return;

    setUserTextInput('');
    const userMsg: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages,
          plantDetails: analysis,
          preferredLanguage: VOICE_LANGUAGES.find(l => l.code === preferredLanguage)?.name || 'English'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get companion response.');
      }

      const data = await response.json();
      const modelMsg: Message = {
        role: 'model',
        text: data.text || `Mmm, I'm absorbing your words. Let's grow strong!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, modelMsg]);
      speakText(modelMsg.text, preferredLanguage);
    } catch (error) {
      console.error(error);
      toast.error('Companion lost connection for a second. Try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Trigger Care Actions & Recovering Animation
  const performCareAction = (
    type: 'watering' | 'sunlight' | 'fertilizer' | 'repot' | 'disease_treat' | 'pruning' | 'airflow',
    label: string
  ) => {
    if (isRecovering || !analysis) return;

    setIsRecovering(true);
    setRecoveryType(type);

    // Plant speaks descriptive dialogue immediately during recovery
    let speech = '';
    switch (type) {
      case 'watering':
        speech = "Ahhh! Water is trickling through my dry roots. My cells are inflating, and I can already feel my stems lifting upright!";
        break;
      case 'sunlight':
        speech = "Mmmm, warm golden sunbeams! Photosynthesis is firing up, and my leaves are generating fresh glucose right now!";
        break;
      case 'fertilizer':
        speech = "Ooh, rich organic nutrients! My soil is teeming with microbes, giving my roots the ultimate energy boost!";
        break;
      case 'repot':
        speech = "Wow! Extra space for my crowded roots to spread out and breathe. This brand new pot fits me perfectly!";
        break;
      case 'disease_treat':
        speech = "Ah, thank goodness! That therapeutic defense shield is eradicating the leaf diseases and pests immediately!";
        break;
      case 'pruning':
        speech = "Snip, snip! Trimming away those dead brown leaves allows me to channel all my energy into healthy new shoots!";
        break;
      case 'airflow':
        speech = "Whoosh! That refreshing breeze is circulating oxygen around my crown and keeping stale moisture away!";
        break;
    }

    speakText(speech, preferredLanguage);
    setChatMessages(prev => [
      ...prev,
      {
        role: 'model',
        text: speech,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // 4-second healing sequence
    setTimeout(() => {
      setIsRecovering(false);
      setRecoveryType(null);

      // Recover status to healthy
      const updatedAnalysis: AnalysisResult = {
        ...analysis,
        healthStatus: 'healthy',
        drynessLevel: 'low',
        waterStress: 'none',
        confidenceScore: 100
      };
      setAnalysis(updatedAnalysis);

      // Celebrate recovery speech
      const celebration = "Look at me! I'm completely recovered, hydrated, and absolutely shining with happiness now!";
      speakText(celebration, preferredLanguage);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: celebration,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Add to Care History Ledger
      const newLog = {
        id: Math.random().toString(),
        type: label,
        date: new Date().toLocaleDateString(),
        notes: 'Successfully recovered plant to peak parameters!'
      };
      setCareHistory(prev => [newLog, ...prev]);

      // Save to existing inventory or local storage
      saveRecoveryToInventory(updatedAnalysis);
      toast.success(`${label} completed! Companion is perfectly healthy.`);
    }, 4500);
  };

  // Update original plant list
  const saveRecoveryToInventory = async (updated: AnalysisResult) => {
    if (!user) return;
    const matched = existingPlants.find(p => p.species === updated.species || p.name === customPlantName);
    if (matched) {
      const updatedPlant = {
        ...matched,
        healthStatus: 'healthy',
        lastWatered: new Date().toISOString(),
        nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      if (db) {
        try {
          await updateDoc(doc(db, 'plants', matched.id), {
            healthStatus: 'healthy',
            lastWatered: new Date().toISOString()
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        const stored = localStorage.getItem(`flora_plants_${user.uid}`);
        if (stored) {
          const arr = JSON.parse(stored);
          const idx = arr.findIndex((p: any) => p.id === matched.id);
          if (idx !== -1) {
            arr[idx] = updatedPlant;
            localStorage.setItem(`flora_plants_${user.uid}`, JSON.stringify(arr));
          }
        }
      }
    }
  };

  // Convert existing catalog plant into character
  const adoptCatalogPlant = (plant: any) => {
    setCustomPlantName(plant.name);
    // Construct fake analysis from catalog details
    const simulatedAnalysis: AnalysisResult = {
      species: plant.species,
      healthStatus: plant.healthStatus === 'critical' ? 'dry' : plant.healthStatus === 'needs_attention' ? 'diseased' : 'healthy',
      leafColor: plant.healthStatus === 'critical' ? 'pale brown' : 'bright green',
      drynessLevel: plant.healthStatus === 'critical' ? 'high' : 'low',
      diseases: plant.healthStatus === 'needs_attention' ? ['Minor leaf spotting'] : [],
      pests: [],
      soilCondition: plant.healthStatus === 'critical' ? 'Dry, compacted soil' : 'Moist aerated substrate',
      waterStress: plant.healthStatus === 'critical' ? 'severe' : 'none',
      sunlightRequirement: 'medium',
      nutrientDeficiency: 'None detected',
      growthStage: 'Mature',
      confidenceScore: plant.healthStatus === 'critical' ? 45 : 95,
      recommendedActions: ['Perform root saturation', 'Nurture in direct bright ambient light'],
      personalityTrait: plant.species.toLowerCase().includes('cactus') ? 'Funny & confident Cactus' : 'Cheerful Money Plant',
      personalityGreeting: `Hi my special caretaker! I'm ${plant.name}, your loyal ${plant.species}. I'm thrilled to be talking to you directly!`,
    };

    setAnalysis(simulatedAnalysis);
    const greeting = simulatedAnalysis.personalityGreeting;
    setChatMessages([{
      role: 'model',
      text: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    speakText(greeting, preferredLanguage);

    setCareHistory([
      { id: '1', type: 'Adopted Companion', date: new Date().toLocaleDateString(), notes: `Adopted ${plant.name} into virtual character interface!` }
    ]);
  };

  return (
    <div className="flex-grow bg-[#FAFCFA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 font-extrabold text-xs uppercase tracking-widest bg-emerald-50 w-max px-3 py-1.5 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 animate-pulse" />
              <span>Flora AI Premium Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 font-sans sm:text-4xl">
              Virtual Plant Companion <span className="text-[#22C55E]">AI</span>
            </h1>
            <p className="text-sm text-emerald-800/70 mt-1 max-w-2xl font-medium">
              Upload a snapshot of your plants or select one from your botanical collection. Flora AI breathes interactive virtual life, speech, and custom emotional personalities directly into your green companions!
            </p>
          </div>

          {analysis && (
            <Button 
              variant="outline" 
              onClick={() => {
                setAnalysis(null);
                setImageFile(null);
                setImagePreview(null);
                setChatMessages([]);
              }}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Catalog Selector
            </Button>
          )}
        </div>

        {/* ================= STAGE 1: CHOOSE OR UPLOAD PLANT ================= */}
        {!analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Drag & Drop Vision Upload */}
            <Card variant="glass" className="p-8 space-y-6 flex flex-col justify-between border-[rgba(34,197,94,0.15)] bg-white">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-emerald-950 text-lg">Upload Plant Snapshot</h3>
                    <p className="text-xs text-emerald-800/60 font-medium">Capture a real plant leaves photo to analyze health & generate animated character</p>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="relative border-2 border-dashed border-emerald-200/80 rounded-3xl bg-emerald-50/20 p-8 text-center hover:bg-emerald-50/40 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-56 mx-auto rounded-2xl object-cover border border-emerald-100 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-xs text-emerald-600 font-bold">Tap area to upload a different image</p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-6">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#22C55E] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-950 text-sm">Drag & Drop or Click to Browse</p>
                        <p className="text-[11px] text-emerald-700/60 font-medium mt-1">Supports PNG, JPG, JPEG formats up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-900">Custom Companion Name (Optional)</label>
                  <Input 
                    type="text" 
                    placeholder="E.g., Charlotte the Ivy, Spike the Cactus" 
                    value={customPlantName}
                    onChange={(e) => setCustomPlantName(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="primary" 
                  className="w-full justify-center" 
                  onClick={runVisionAnalysis}
                  disabled={!imagePreview || isAnalyzing}
                  leftIcon={isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
                >
                  {isAnalyzing ? 'Flora AI is thinking...' : 'Analyze leaf cells & Awaken Plant'}
                </Button>
              </div>
            </Card>

            {/* Right: Select Existing Catalog Plant */}
            <Card variant="glass" className="p-8 space-y-6 flex flex-col justify-between border-[rgba(34,197,94,0.15)] bg-white">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-extrabold text-emerald-950 text-lg">Awaken Saved Plant Companion</h3>
                    <p className="text-xs text-emerald-800/60 font-medium">Instantly launch conversation module using a plant from your inventory list</p>
                  </div>
                </div>

                {isLoadingPlants ? (
                  <div className="py-20 text-center text-emerald-800/60 text-xs font-bold animate-pulse">
                    Retrieving catalog inventory list...
                  </div>
                ) : existingPlants.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-emerald-100 rounded-3xl p-6 space-y-4">
                    <Sprout className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs text-emerald-800/60 font-medium">
                      No plants found in your inventory. Upload a snapshot on the left to start instantly, or add some plants in the main Dashboard!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[24rem] overflow-y-auto pr-2 scrollbar-thin">
                    {existingPlants.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => adoptCatalogPlant(p)}
                        className="group flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50/30 hover:bg-emerald-50/70 border border-emerald-100/50 hover:border-[#22C55E]/25 transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-emerald-100 shadow-inner group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Sprout className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-grow text-left">
                          <p className="font-extrabold text-emerald-950 text-xs tracking-tight truncate">{p.name}</p>
                          <p className="text-[10px] text-emerald-600 font-bold italic truncate">{p.species}</p>
                          <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            p.healthStatus === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.healthStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center pt-4">
                <span className="text-[10px] font-extrabold tracking-widest text-emerald-700/40 uppercase">
                  Connected to Local SQLite/Firestore Stack
                </span>
              </div>
            </Card>

          </div>
        ) : (
          
          // ================= STAGE 2: LIVE COMPANION AI SCREEN =================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (SPAN 4) - The Interactive Animated Plant Avatar */}
            <div className="lg:col-span-4 space-y-6">
              
              <Card variant="glass" className="p-6 space-y-6 border-[rgba(34,197,94,0.15)] bg-white text-center">
                <div>
                  <h3 className="font-black text-emerald-950 text-xl tracking-tight">
                    {customPlantName || analysis.species}
                  </h3>
                  <p className="text-xs text-emerald-600/80 italic font-bold">
                    {analysis.species}
                  </p>
                </div>

                {/* Animated SVG Plant Avatar Component */}
                <PlantAvatar 
                  healthStatus={analysis.healthStatus}
                  isTalking={isTalking}
                  isRecovering={isRecovering}
                  recoveryType={recoveryType}
                  species={analysis.species}
                />

                {/* Dynamic Speech bubbles / Status badges */}
                <div className="flex justify-center items-center space-x-2 text-xs bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    analysis.healthStatus === 'healthy' ? 'bg-[#22C55E]' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <span className="font-extrabold text-emerald-950 capitalize">
                    {analysis.healthStatus.replace('_', ' ')}
                  </span>
                  <span className="text-emerald-800/40">•</span>
                  <span className="font-bold text-emerald-800/70">
                    Confidence: {analysis.confidenceScore}%
                  </span>
                </div>

                {/* Interactive Care Actions Grid */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 text-left pl-1">
                    🌳 Interactive Care Controls
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <button 
                      onClick={() => performCareAction('watering', '💧 Water Me')}
                      disabled={isRecovering}
                      className="flex items-center space-x-2 p-3 text-xs font-bold text-blue-900 bg-blue-50/80 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-all text-left shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      <Droplet className="w-4 h-4 text-blue-500 fill-blue-500" />
                      <span>Water Me</span>
                    </button>

                    <button 
                      onClick={() => performCareAction('sunlight', '🌞 Give Sunlight')}
                      disabled={isRecovering}
                      className="flex items-center space-x-2 p-3 text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100 rounded-2xl border border-amber-100 transition-all text-left shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Give Sunlight</span>
                    </button>

                    <button 
                      onClick={() => performCareAction('fertilizer', '🌿 Add Fertilizer')}
                      disabled={isRecovering}
                      className="flex items-center space-x-2 p-3 text-xs font-bold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 rounded-2xl border border-emerald-100 transition-all text-left shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      <Sprout className="w-4 h-4 text-[#22C55E]" />
                      <span>Add Fertilizer</span>
                    </button>

                    <button 
                      onClick={() => performCareAction('pruning', '✂ Trim Dead Leaves')}
                      disabled={isRecovering}
                      className="flex items-center space-x-2 p-3 text-xs font-bold text-slate-900 bg-slate-50/80 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all text-left shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      <Scissors className="w-4 h-4 text-slate-500" />
                      <span>Trim Leaves</span>
                    </button>

                    <button 
                      onClick={() => performCareAction('repot', '🪴 Repot Me')}
                      disabled={isRecovering}
                      className="flex items-center space-x-2 p-3 text-xs font-bold text-amber-950 bg-amber-50/50 hover:bg-amber-100 rounded-2xl border border-amber-200 transition-all text-left shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Repot Me</span>
                    </button>

                    <button 
                      onClick={() => performCareAction('disease_treat', '🐞 Treat Disease')}
                      disabled={isRecovering}
                      className="flex items-center space-x-2 p-3 text-xs font-bold text-rose-900 bg-rose-50/80 hover:bg-rose-100 rounded-2xl border border-rose-100 transition-all text-left shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      <Shield className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span>Treat Disease</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => performCareAction('airflow', '💨 Improve Air Flow')}
                    disabled={isRecovering}
                    className="w-full flex items-center justify-center space-x-2 p-3 text-xs font-bold text-teal-900 bg-teal-50/80 hover:bg-teal-100 rounded-2xl border border-teal-100 transition-all shadow-sm hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                  >
                    <Wind className="w-4 h-4 text-teal-500" />
                    <span>Improve Air Flow</span>
                  </button>
                </div>
              </Card>

              {/* Cognitive Memory Ledger Panel */}
              <Card variant="glass" className="p-6 space-y-4 border-[rgba(34,197,94,0.15)] bg-white text-left">
                <div className="flex items-center space-x-2 text-emerald-950 font-extrabold text-xs uppercase tracking-widest">
                  <Brain className="w-4 h-4 text-[#22C55E]" />
                  <span>Plant Memory Ledger</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-[11px] bg-emerald-50/30 p-3 rounded-xl border border-emerald-50 font-medium">
                    <div>
                      <p className="text-emerald-800/50 font-bold uppercase tracking-wider text-[8px]">Personality</p>
                      <p className="text-emerald-950 font-bold mt-0.5 truncate">{analysis.personalityTrait}</p>
                    </div>
                    <div>
                      <p className="text-emerald-800/50 font-bold uppercase tracking-wider text-[8px]">Growth Stage</p>
                      <p className="text-emerald-950 font-bold mt-0.5 truncate">{analysis.growthStage}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">📋 Treatment & Care Log</p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                      {careHistory.map((log) => (
                        <div key={log.id} className="flex justify-between items-start text-[10px] bg-emerald-50/20 p-2 rounded-lg border border-emerald-50/50">
                          <div>
                            <span className="font-extrabold text-[#22C55E] uppercase tracking-wide">{log.type}</span>
                            <p className="text-emerald-900/70 font-semibold mt-0.5">{log.notes}</p>
                          </div>
                          <span className="text-[9px] text-emerald-800/40 font-bold whitespace-nowrap">{log.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column (SPAN 8) - Immersive Chat Dialogue Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              <Card variant="glass" className="h-[36rem] flex flex-col justify-between border-[rgba(34,197,94,0.15)] bg-white overflow-hidden shadow-lg">
                
                {/* Chat Header */}
                <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-sm border border-[#22C55E]/10 shadow-sm animate-bounce">
                      💬
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#22C55E]">Chat Room</span>
                      <h4 className="font-black text-emerald-950 text-sm leading-tight">Conversation with Plant Companion</h4>
                    </div>
                  </div>

                  {/* Audio Controls and Voice selectors */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 bg-white border border-emerald-100 rounded-full px-3 py-1 shadow-sm">
                      <span className="text-xs">🗣️</span>
                      <select 
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className="text-[11px] font-bold text-emerald-950 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
                      >
                        {VOICE_LANGUAGES.map((v) => (
                          <option key={v.code} value={v.code}>
                            {v.flag} {v.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-full border transition-all ${
                        isMuted 
                          ? 'text-rose-500 bg-rose-50 border-rose-100' 
                          : 'text-[#22C55E] bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                      }`}
                      title={isMuted ? 'Unmute Speech Synthesis' : 'Mute Speech Synthesis'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Messages Display */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-[#F7FAF7]/30">
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div 
                        key={index} 
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                      >
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold mb-1 border border-emerald-200">
                            🪴
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm border ${
                          isUser 
                            ? 'bg-[#16A34A] text-white border-[#22C55E]/10 rounded-br-none' 
                            : 'bg-white text-emerald-950 border-emerald-100 rounded-bl-none'
                        }`}>
                          <p className="text-xs font-semibold leading-relaxed whitespace-pre-line">{msg.text}</p>
                          <span className={`block text-[8px] mt-1.5 text-right font-medium ${
                            isUser ? 'text-emerald-100/70' : 'text-emerald-800/40'
                          }`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isChatLoading && (
                    <div className="flex justify-start items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold border border-emerald-200">
                        🪴
                      </div>
                      <div className="bg-white border border-emerald-100 rounded-2xl p-4 rounded-bl-none shadow-sm flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Message Input Panel */}
                <div className="p-4 border-t border-emerald-100 bg-white/80 backdrop-blur-md flex items-center space-x-2.5">
                  <button 
                    onClick={toggleSpeechRecognition}
                    className={`p-3 rounded-2xl border transition-all ${
                      isListening 
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                        : 'bg-emerald-50 text-[#16A34A] border-emerald-100 hover:bg-emerald-100/60'
                    }`}
                    title={isListening ? 'Stop Mic' : 'Start Mic / Natural Speech'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <input 
                    type="text" 
                    placeholder="Type or speak a message to your plant character..." 
                    value={userTextInput}
                    onChange={(e) => setUserTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow bg-emerald-50/40 border border-emerald-100/80 rounded-2xl px-4 py-3 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-[#22C55E] placeholder-emerald-800/40"
                  />

                  <Button 
                    variant="primary" 
                    onClick={() => sendMessage()}
                    disabled={!userTextInput.trim()}
                    className="!py-3 !px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

              </Card>

              {/* Detailed Botanical Health Diagnostics Breakdown */}
              <Card variant="glass" className="p-6 space-y-4 border-[rgba(34,197,94,0.15)] bg-white text-left">
                <div className="flex items-center space-x-2 text-emerald-950 font-extrabold text-xs uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-[#22C55E]" />
                  <span>AI Botanical Diagnostics Breakdown</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Leaves & Moisture */}
                  <div className="p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#22C55E] flex items-center space-x-1">
                      <span className="text-xs">🍁</span>
                      <span>Foliage & Moisture</span>
                    </p>
                    <div className="text-[10.5px] font-semibold text-emerald-950 space-y-1">
                      <p><span className="text-emerald-800/60">Color:</span> {analysis.leafColor}</p>
                      <p><span className="text-emerald-800/60">Dryness:</span> <span className="capitalize">{analysis.drynessLevel}</span></p>
                      <p><span className="text-emerald-800/60">Water Stress:</span> <span className="capitalize">{analysis.waterStress}</span></p>
                    </div>
                  </div>

                  {/* Diseases & Pests */}
                  <div className="p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#22C55E] flex items-center space-x-1">
                      <span className="text-xs">🐛</span>
                      <span>Pathogens & Pests</span>
                    </p>
                    <div className="text-[10.5px] font-semibold text-emerald-950 space-y-1">
                      <p><span className="text-emerald-800/60">Deficiency:</span> {analysis.nutrientDeficiency || 'None detected'}</p>
                      <p>
                        <span className="text-emerald-800/60">Diseases:</span>{' '}
                        {analysis.diseases && analysis.diseases.length > 0 ? (
                          <span className="text-rose-600 font-extrabold">{analysis.diseases.join(', ')}</span>
                        ) : (
                          <span className="text-emerald-600 font-extrabold">None detected</span>
                        )}
                      </p>
                      <p>
                        <span className="text-emerald-800/60">Pests:</span>{' '}
                        {analysis.pests && analysis.pests.length > 0 ? (
                          <span className="text-amber-600 font-extrabold">{analysis.pests.join(', ')}</span>
                        ) : (
                          <span className="text-emerald-600 font-extrabold">None detected</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Growth & Environment */}
                  <div className="p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#22C55E] flex items-center space-x-1">
                      <span className="text-xs">☀️</span>
                      <span>Habitat Metrics</span>
                    </p>
                    <div className="text-[10.5px] font-semibold text-emerald-950 space-y-1">
                      <p><span className="text-emerald-800/60">Sunlight:</span> <span className="capitalize">{analysis.sunlightRequirement} req</span></p>
                      <p><span className="text-emerald-800/60">Soil status:</span> {analysis.soilCondition}</p>
                      <p><span className="text-emerald-800/60">Stage:</span> {analysis.growthStage}</p>
                    </div>
                  </div>

                </div>

                {/* Treatment instructions */}
                {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
                  <div className="p-3.5 bg-emerald-50/10 border border-emerald-100/50 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-800 mb-1.5">💡 Expert Botanist Recommendations</p>
                    <ul className="list-disc pl-4 text-[10.5px] font-semibold text-emerald-950 space-y-1">
                      {analysis.recommendedActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
