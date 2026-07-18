/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

interface PlantAvatarProps {
  healthStatus: 'healthy' | 'dry' | 'diseased' | 'overwatered' | 'sunlight_stressed';
  isTalking: boolean;
  isRecovering: boolean;
  recoveryType: 'watering' | 'sunlight' | 'fertilizer' | 'repot' | 'disease_treat' | 'pruning' | 'airflow' | null;
  species: string;
}

export const PlantAvatar: React.FC<PlantAvatarProps> = ({
  healthStatus,
  isTalking,
  isRecovering,
  recoveryType,
  species = 'Houseplant',
}) => {
  // Determine dominant species characteristics
  const isCactus = species.toLowerCase().includes('cactus') || species.toLowerCase().includes('succulent');
  const isRose = species.toLowerCase().includes('rose') || species.toLowerCase().includes('tulip') || species.toLowerCase().includes('flower');
  const isTulsi = species.toLowerCase().includes('tulsi') || species.toLowerCase().includes('basil') || species.toLowerCase().includes('herbal');

  // Blinking animation trigger
  const [blinkTrigger, setBlinkTrigger] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkTrigger(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Floating particles
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  useEffect(() => {
    if (healthStatus === 'healthy' || isRecovering) {
      const interval = setInterval(() => {
        setParticles(prev => {
          const newParticle = {
            id: Math.random(),
            x: Math.random() * 80 + 10,
            y: 90,
            color: isRecovering 
              ? (recoveryType === 'watering' ? '#3B82F6' : recoveryType === 'sunlight' ? '#FBBF24' : '#10B981')
              : '#34D399'
          };
          return [...prev.slice(-15), newParticle];
        });
      }, 400);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [healthStatus, isRecovering, recoveryType]);

  // Map state to colors and expressions
  let leafColor = '#4ADE80'; // Bright healthy green
  let stemAngle = 0; // Straight upright
  let expression: 'happy' | 'sad' | 'worried' | 'sleepy' | 'uncomfortable' = 'happy';
  let motionSpeed = 1;

  if (healthStatus === 'dry') {
    leafColor = '#B45309'; // Wilted brown/gold
    stemAngle = 18; // Drooped
    expression = 'sad';
    motionSpeed = 0.5;
  } else if (healthStatus === 'diseased') {
    leafColor = '#A3E635'; // Sickly yellow-green
    stemAngle = 8;
    expression = 'worried';
    motionSpeed = 0.7;
  } else if (healthStatus === 'overwatered') {
    leafColor = '#065F46'; // Soggy dark green
    stemAngle = -6;
    expression = 'uncomfortable';
    motionSpeed = 0.6;
  } else if (healthStatus === 'sunlight_stressed') {
    leafColor = '#CA8A04'; // Pale yellow-green burnt
    stemAngle = 12;
    expression = 'sleepy';
    motionSpeed = 0.4;
  }

  // Override during dynamic recovery animations
  if (isRecovering) {
    leafColor = '#10B981'; // Revived vibrant green
    stemAngle = 0;
    expression = 'happy';
    motionSpeed = 1.8;
  }

  // Talking mouth animation loop
  const mouthYScale = isTalking ? [1, 0.3, 1.2, 0.5, 1] : 1;

  return (
    <div className="relative w-full aspect-square flex items-center justify-center bg-gradient-to-b from-emerald-500/5 to-emerald-500/15 rounded-3xl overflow-hidden border border-[rgba(34,197,94,0.15)] p-6 shadow-inner">
      
      {/* Sparkle background for healthy and recovering plants */}
      {(healthStatus === 'healthy' || isRecovering) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.2, y: 120, x: `${p.x}%` }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 0.8, 0], y: -40 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
                className="absolute text-xl"
                style={{ color: p.color, left: 0 }}
              >
                {recoveryType === 'watering' ? '💧' : recoveryType === 'sunlight' ? '☀️' : '✨'}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dynamic Aura Ring */}
      <motion.div 
        animate={{ 
          scale: healthStatus === 'healthy' ? [1, 1.05, 1] : [1, 1.02, 1],
          opacity: healthStatus === 'healthy' ? [0.15, 0.25, 0.15] : [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute w-72 h-72 rounded-full blur-2xl ${
          healthStatus === 'healthy' ? 'bg-emerald-400' :
          healthStatus === 'dry' ? 'bg-amber-600' :
          healthStatus === 'diseased' ? 'bg-rose-400' : 'bg-blue-300'
        }`}
      />

      {/* Main SVG Rig */}
      <svg viewBox="0 0 200 200" className="w-64 h-64 z-10 drop-shadow-xl overflow-visible">
        
        {/* Recovery Animations overlay */}
        <AnimatePresence>
          {isRecovering && recoveryType === 'watering' && (
            <motion.g
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Rain/Water Pouring particles */}
              {[...Array(6)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={70 + i * 15}
                  cy={15}
                  r="2.5"
                  fill="#60A5FA"
                  animate={{ y: [0, 130], opacity: [1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'linear'
                  }}
                />
              ))}
            </motion.g>
          )}

          {isRecovering && recoveryType === 'sunlight' && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="origin-center"
            >
              {/* Solar Aura */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="#FBBF24" strokeWidth="2" strokeDasharray="5 5">
                <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="15s" repeatCount="indefinite" />
              </circle>
            </motion.g>
          )}
        </AnimatePresence>

        {/* --- PLANT STRUCTURE --- */}
        {/* Gentle breathing scaling & sway of the whole plant */}
        <motion.g
          animate={{
            scaleY: [1, 1.03, 1],
            rotate: [stemAngle, stemAngle + 1.5, stemAngle - 1.5, stemAngle],
          }}
          transition={{
            duration: 3 / motionSpeed,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="origin-bottom"
          style={{ transformOrigin: '100px 150px' }}
        >
          {/* Stem/Branch */}
          <path
            d="M100,150 Q100,105 100,75"
            fill="none"
            stroke={healthStatus === 'dry' ? '#78350F' : '#22C55E'}
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Plant Leaves based on Species */}
          {isCactus ? (
            // CACTUS BODY (Thicker segmented paddle)
            <g>
              {/* Main Paddle */}
              <rect x="86" y="65" width="28" height="60" rx="14" fill={leafColor} stroke={healthStatus === 'dry' ? '#451A03' : '#15803D'} strokeWidth="2" />
              {/* Right Side Arm */}
              <path d="M112,95 C125,95 125,75 125,75" fill="none" stroke={leafColor} strokeWidth="12" strokeLinecap="round" />
              <path d="M112,95 C125,95 125,75 125,75" fill="none" stroke={healthStatus === 'dry' ? '#451A03' : '#15803D'} strokeWidth="2" strokeLinecap="round" />
              {/* Left Side Arm */}
              <path d="M88,105 C75,105 75,85 75,85" fill="none" stroke={leafColor} strokeWidth="10" strokeLinecap="round" />
              {/* Cactus Needles / Spines */}
              <g stroke="#FFF" strokeWidth="1.5" strokeLinecap="round">
                <line x1="82" y1="80" x2="77" y2="78" />
                <line x1="118" y1="85" x2="123" y2="83" />
                <line x1="100" y1="58" x2="100" y2="52" />
                <line x1="90" y1="70" x2="85" y2="68" />
                <line x1="110" y1="70" x2="115" y2="68" />
                <line x1="123" y1="72" x2="128" y2="70" />
                <line x1="72" y1="82" x2="67" y2="80" />
              </g>
            </g>
          ) : isRose ? (
            // ROSE STEM + LEAVES + BLOOM
            <g>
              {/* Rose Leaves */}
              <path d="M100,110 Q125,110 120,95 Q105,95 100,110" fill={leafColor} />
              <path d="M100,125 Q75,120 80,105 Q95,105 100,125" fill={leafColor} />
              
              {/* Flower Blossom */}
              <motion.g
                animate={isRecovering || healthStatus === 'healthy' ? { scale: [1, 1.15, 1] } : { scale: 0.9 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="origin-center"
                style={{ transformOrigin: '100px 65px' }}
              >
                {/* Outer Petals */}
                <circle cx="100" cy="65" r="22" fill={healthStatus === 'dry' ? '#991B1B' : '#E11D48'} />
                <circle cx="90" cy="55" r="16" fill={healthStatus === 'dry' ? '#7F1D1D' : '#F43F5E'} />
                <circle cx="110" cy="55" r="16" fill={healthStatus === 'dry' ? '#7F1D1D' : '#F43F5E'} />
                <circle cx="100" cy="50" r="14" fill={healthStatus === 'dry' ? '#B91C1C' : '#FDA4AF'} />
                {/* Center Swirl */}
                <path d="M100,58 C104,58 106,62 100,64 C94,66 100,72 100,72" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>
            </g>
          ) : isTulsi ? (
            // TULSI / BASIL BUSHY MULTIPLE LEAVES
            <g>
              {/* Leaf tiers */}
              <path d="M100,120 C125,115 130,95 115,95 C100,95 100,120 100,120" fill={leafColor} />
              <path d="M100,120 C75,115 70,95 85,95 C100,95 100,120 100,120" fill={leafColor} />
              <path d="M100,95 C118,90 120,75 110,75 C100,75 100,95 100,95" fill={leafColor} />
              <path d="M100,95 C82,90 80,75 90,75 C100,75 100,95 100,95" fill={leafColor} />
              {/* Top tiny leaf pair */}
              <path d="M100,75 C108,70 110,62 100,62 C90,62 92,70 100,75" fill="#4ADE80" />
            </g>
          ) : (
            // STANDARD GREEN HOUSEPLANT (E.G. MONEY PLANT)
            <g>
              {/* Heart-shaped splayed leaves */}
              <path d="M100,130 C130,130 135,100 115,100 C100,100 100,130 100,130" fill={leafColor} stroke={healthStatus === 'dry' ? '#5B21B6' : 'none'} />
              <path d="M100,130 C70,130 65,100 85,100 C100,100 100,130 100,130" fill={leafColor} />
              
              <path d="M100,105 C125,105 130,80 110,80 C100,80 100,105 100,105" fill={leafColor} />
              <path d="M100,105 C75,105 70,80 90,80 C100,80 100,105 100,105" fill={leafColor} />
              
              <path d="M100,80 Q112,65 100,55 Q88,65 100,80" fill={leafColor} />
            </g>
          )}

          {/* --- FACE PANEL (Centered on plant body) --- */}
          <g transform={`translate(${isRose ? '0, 45' : isCactus ? '0, 20' : '0, 15'})`}>
            
            {/* Blushing Cheeks */}
            {(expression === 'happy' || isRecovering) && (
              <g opacity="0.6">
                <ellipse cx="88" cy="85" rx="5" ry="3.5" fill="#F43F5E" />
                <ellipse cx="112" cy="85" rx="5" ry="3.5" fill="#F43F5E" />
              </g>
            )}

            {/* Eyes Rig with blinking */}
            <g>
              {expression === 'sad' || expression === 'worried' ? (
                // Sad expression (slanted curved lines or downcast circles)
                <g stroke={healthStatus === 'dry' ? '#451A03' : '#14532D'} strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M83,82 Q88,78 93,82" />
                  <path d="M107,82 Q112,78 117,82" />
                </g>
              ) : expression === 'sleepy' ? (
                // Closed, peaceful/sleepy lines
                <g stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <path d="M83,80 Q88,85 93,80" />
                  <path d="M107,80 Q112,85 117,80" />
                </g>
              ) : (
                // Happy/Normal circular eyes with blinking animation
                <g fill="#14532D">
                  <motion.ellipse
                    cx="88"
                    cy="81"
                    rx="3.5"
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3.5
                    }}
                    style={{ transformOrigin: '88px 81px' }}
                  />
                  <motion.ellipse
                    cx="112"
                    cy="81"
                    rx="3.5"
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3.5
                    }}
                    style={{ transformOrigin: '112px 81px' }}
                  />
                  {/* Eye sparkles */}
                  <circle cx="89.5" cy="79.5" r="1" fill="#FFF" />
                  <circle cx="113.5" cy="79.5" r="1" fill="#FFF" />
                </g>
              )}
            </g>

            {/* Mouth Rig with speaking animation */}
            <g>
              {isRecovering || expression === 'happy' ? (
                // Big Happy Smile
                <motion.path
                  d="M94,88 Q100,98 106,88"
                  fill="none"
                  stroke="#14532D"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{ scaleY: mouthYScale }}
                  style={{ transformOrigin: '100px 92px' }}
                />
              ) : expression === 'sad' ? (
                // Sad Curve
                <path d="M95,93 Q100,87 105,93" fill="none" stroke={healthStatus === 'dry' ? '#451A03' : '#14532D'} strokeWidth="3" strokeLinecap="round" />
              ) : expression === 'worried' ? (
                // Wobbly / Worried line
                <path d="M94,90 Q97,88 100,90 Q103,92 106,90" fill="none" stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                // Neutral curve / default smile
                <motion.path
                  d="M95,89 Q100,95 105,89"
                  fill="none"
                  stroke="#14532D"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ scaleY: mouthYScale }}
                  style={{ transformOrigin: '100px 92px' }}
                />
              )}
            </g>
          </g>
        </motion.g>

        {/* --- DIRT & POT (Static but reactive soil colors) --- */}
        <g>
          {/* Soil / Dirt inside pot */}
          <ellipse
            cx="100"
            cy="150"
            rx="36"
            ry="10"
            fill={
              healthStatus === 'dry' ? '#78350F' : // Light sandy dry soil
              healthStatus === 'overwatered' ? '#1E1B4B' : // Dark muddy soggy soil
              '#451A03' // Rich normal moist dark-brown soil
            }
          />

          {/* Plant Pot body */}
          <path
            d="M62,150 L68,185 C69,189 73,192 78,192 L122,192 C127,192 131,189 132,185 L138,150 Z"
            fill="#F97316" // Classic terracotta orange pot
            stroke="#C2410C"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Pot Rim */}
          <rect
            x="58"
            y="142"
            width="84"
            height="10"
            rx="3"
            fill="#EA580C"
            stroke="#C2410C"
            strokeWidth="3"
          />
        </g>
      </svg>
    </div>
  );
};
