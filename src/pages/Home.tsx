/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { 
  Sprout, 
  Camera, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Droplet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const features = [
    {
      icon: Camera,
      title: 'Smart Plant Identification',
      description: 'Simply snap a photo of any plant to identify it instantly, complete with scientific names, general care requirements, and historical background.',
      color: 'bg-emerald-500/10 text-emerald-600'
    },
    {
      icon: Droplet,
      title: 'Watering & Care Schedules',
      description: 'Get tailored care timers based on your plant species, indoor location, and regional climate. Never forget to water, mist, or fertilize again.',
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      icon: Sprout,
      title: 'AI Health Diagnostic Assistant',
      description: 'Analyze yellowing leaves, spots, or signs of pests. Receive instant step-by-step treatment protocols to bring your companion back to life.',
      color: 'bg-green-500/10 text-green-600'
    },
    {
      icon: Clock,
      title: 'Botanical Growth Timeline',
      description: 'Log and track watering milestones, re-potting days, and upload visual progress photos to build a digital scrapbook for your indoor garden.',
      color: 'bg-amber-500/10 text-amber-600'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Snap a Photo',
      description: 'Take a quick picture of your plant or upload one from your photo gallery.'
    },
    {
      num: '02',
      title: 'Receive Insights',
      description: 'Get immediate species confirmation, diagnostic reports, and customized advice.'
    },
    {
      num: '03',
      title: 'Automate Care',
      description: 'Setup smart push reminders, log care sessions, and track long-term growth.'
    }
  ];

  return (
    <div className="flex-grow bg-[#F9FBF9] overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#86EFAC] text-[#065F46] rounded-full text-xs font-extrabold uppercase tracking-widest">
              <span>Your Smart Plant Companion</span>
            </div>
            
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight text-[#1A2E1A] leading-[1.1]">
              Cultivate a <span className="text-[#22C55E]">Greener</span> Living Space.
            </h1>
            
            <p className="text-[#374151] text-base sm:text-lg max-w-xl leading-relaxed">
              Flora AI combines advanced computer vision and soil sensor data to ensure your indoor garden thrives. Real-time diagnostics for over 12,000 species.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto shadow-xl shadow-[#22C55E]/30"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {user ? 'Launch Dashboard' : 'Launch Dashboard'}
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/60">
                  Watch Tutorial
                </Button>
              </a>
            </div>

            {/* Feature strip from editorial design */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 border-t border-[rgba(34,197,94,0.12)]">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> AI Diagnosis
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Smart Watering
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Light Tracking
              </div>
            </div>
          </motion.div>

          {/* Hero Right Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative animate-fade-in"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-[#86EFAC]/40 rounded-[40px] opacity-20 blur-3xl" />
            
            <Card variant="glass" className="relative p-8 border-[rgba(34,197,94,0.12)] shadow-2xl bg-white/80">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-[#1A2E1A]">Monstera Deliciosa</h3>
                  <p className="text-xs text-[#6B7280] font-semibold">Living Room • Zone A</p>
                </div>
                <span className="bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Healthy
                </span>
              </div>

              {/* Stat grid from mockup */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/55 p-4 rounded-2xl border border-[rgba(34,197,94,0.06)]">
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-extrabold mb-1">Soil Moisture</div>
                  <div className="text-xl font-black text-[#1A2E1A]">42%</div>
                  <div className="h-1 w-full bg-gray-200 rounded-full mt-2.5 overflow-hidden">
                    <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                <div className="bg-white/55 p-4 rounded-2xl border border-[rgba(34,197,94,0.06)]">
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-extrabold mb-1">Sunlight</div>
                  <div className="text-xl font-black text-[#1A2E1A]">8.2 hrs</div>
                  <div className="h-1 w-full bg-gray-200 rounded-full mt-2.5 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div className="bg-white/55 p-4 rounded-2xl border border-[rgba(34,197,94,0.06)]">
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-extrabold mb-1">Temperature</div>
                  <div className="text-xl font-black text-[#1A2E1A]">22°C</div>
                </div>

                <div className="bg-white/55 p-4 rounded-2xl border border-[rgba(34,197,94,0.06)]">
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-extrabold mb-1">Humidity</div>
                  <div className="text-xl font-black text-[#1A2E1A]">65%</div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[rgba(0,0,0,0.05)] flex justify-between items-center text-xs font-bold">
                <span className="text-emerald-950/70">Next Watering</span>
                <span className="text-[#16A34A] uppercase tracking-wider font-extrabold">In 2 days</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white/60 backdrop-blur-sm border-y border-emerald-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">Features Overview</h2>
            <p className="font-sans font-extrabold text-3xl sm:text-4xl text-emerald-950 tracking-tight">
              A comprehensive system for modern plant lovers
            </p>
            <p className="text-sm text-emerald-800/70">
              We pack state-of-the-art biological algorithms into an incredibly simple user interface. Designed to support plants of all difficulty tiers.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full border-emerald-50 hover:bg-emerald-50/20 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center mb-5`}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-emerald-950 text-lg mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-emerald-800/70 leading-relaxed">{feat.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">How It Works</h2>
            <p className="font-sans font-extrabold text-3xl text-emerald-950 tracking-tight">
              Three simple steps to mastery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group text-center md:text-left">
                {/* Horizontal flow line for large screens */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-[2px] bg-gradient-to-r from-emerald-100 to-transparent z-0" />
                )}
                
                <div className="relative z-10 flex flex-col items-center md:items-start space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A34A] border-2 border-emerald-100 flex items-center justify-center font-extrabold text-xl shadow-inner group-hover:bg-[#22C55E] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-emerald-950 text-xl">{step.title}</h3>
                  <p className="text-sm text-emerald-800/70 max-w-xs leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card variant="gradient" className="relative p-8 md:p-16 border-emerald-200/40 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-[#16A34A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-emerald-950 tracking-tight leading-tight">
              Ready to raise healthy, happy plants?
            </h2>
            <p className="text-emerald-800/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Join thousands of plant parents using Flora AI to systematically manage, nurture, and diagnose their collection. Get started today.
            </p>
            <div className="flex justify-center pt-2">
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="shadow-lg shadow-emerald-500/20"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  {user ? 'Go to Dashboard' : 'Create Free Account'}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
