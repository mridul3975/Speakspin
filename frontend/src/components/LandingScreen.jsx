import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'EN-US (ENGLISH)' },
  { code: 'en-GB', name: 'EN-GB (ENGLISH)' },
  { code: 'es-ES', name: 'ES-ES (SPANISH)' },
  { code: 'es-MX', name: 'ES-MX (SPANISH)' },
  { code: 'fr-FR', name: 'FR-FR (FRENCH)' },
  { code: 'de-DE', name: 'DE-DE (GERMAN)' },
  { code: 'hi-IN', name: 'HI-IN (HINDI)' },
  { code: 'it-IT', name: 'IT-IT (ITALIAN)' },
  { code: 'ja-JP', name: 'JA-JP (JAPANESE)' },
  { code: 'pt-BR', name: 'PT-BR (PORTUGUESE)' },
  { code: 'zh-CN', name: 'ZH-CN (CHINESE)' },
  { code: 'ar-SA', name: 'AR-SA (ARABIC)' }
];

export function LandingScreen({ onStart, onStartBattle, selectedLanguage, setSelectedLanguage }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="landing-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Logo */}
      <motion.div
        className="landing-logo"
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
        }}
      >
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
      </motion.div>

      {/* Title */}
      <motion.h1 className="landing-title" variants={itemVariants}>
        Speak<span className="text-teal">Spin</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p className="landing-tagline" variants={itemVariants}>
        Master public speaking with AI-powered coaching
      </motion.p>

      {/* Large Intimidating Battle Mode Featured Card matching the reference design */}
      <motion.div
        className="landing-battle-card"
        variants={itemVariants}
      >
        {/* Crossed Swords with Red Glow */}
        <span 
          className="material-symbols-outlined" 
          style={{ 
            fontSize: '5rem', 
            display: 'block', 
            margin: '0 auto 1.5rem', 
            color: '#c0c0c0',
            filter: 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.95))',
            fontVariationSettings: "'FILL' 1"
          }}
        >
          swords
        </span>

        {/* Start Battle Solid Red Banner Button */}
        <Button
          className="w-full bg-[#ff5555] hover:bg-[#ff3333] text-white font-black rounded-none border-2 border-white mb-5 uppercase tracking-widest h-12"
          onClick={onStartBattle}
        >
          START BATTLE
        </Button>

        {/* Choose Language Selector Dropdown (Shadcn style popover) */}
        <div className="w-full text-left mb-10">
          <span className="text-[0.7rem] font-black text-[#888888] block mb-1.5 uppercase tracking-widest font-heading">
            Choose a Language
          </span>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full bg-black text-white border-2 border-white rounded-none font-black text-[0.85rem] uppercase tracking-widest font-heading h-11">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white border-2 border-white rounded-none font-heading shadow-[4px_4px_0px_0px_#ffffff]">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code}
                  className="font-black hover:bg-[#111111] focus:bg-[#111111] focus:text-white rounded-none"
                >
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Capitalized Description Text */}
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#ffffff', 
          lineHeight: '1.6', 
          margin: 0, 
          textTransform: 'uppercase', 
          fontWeight: 900, 
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-heading)'
        }}>
          DUEL REAL SPEAKERS LIVE. CLIMB THE ELO LADDER.<br />
          PROVE YOUR SPEECH DOMINANCE.
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div className="flex flex-col gap-4 w-full max-w-[350px] mx-auto mt-6" variants={itemVariants}>
        <Button
          variant="outline"
          className="w-full p-3 text-xs border-[#333333] text-[#888888] bg-transparent shadow-none rounded-none hover:bg-[#111111] hover:text-white"
          onClick={onStart}
        >
          <span className="material-symbols-outlined text-xs mr-2">rocket_launch</span>
          Practice Solo (Training Mode)
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default LandingScreen;
