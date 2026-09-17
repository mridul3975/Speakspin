import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORIES = [
  "General",
  "Personal Finance",
  "Entrepreneurship",
  "Startups",
  "Tech / AI",
  "Fitness",
  "Nutrition",
  "Productivity",
  "History",
  "Literature",
  "Philosophy"
];

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Español (Spain)' },
  { code: 'es-MX', name: 'Español (Mexico)' },
  { code: 'fr-FR', name: 'Français (France)' },
  { code: 'de-DE', name: 'Deutsch (Germany)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'it-IT', name: 'Italiano (Italy)' },
  { code: 'ja-JP', name: '日本語 (Japanese)' },
  { code: 'pt-BR', name: 'Português (Brazil)' },
  { code: 'zh-CN', name: '中文 (Simplified Chinese)' },
  { code: 'ar-SA', name: 'العربية (Arabic)' }
];

export function TimerSelector({ 
  selectedDuration, 
  onChangeDuration, 
  onNext, 
  onBack, 
  selectedCategory,
  onChangeCategory,
  selectedLanguage,
  onChangeLanguage
}) {
  const options = [
    { value: 30, icon: 'bolt', label: '30s', desc: 'Quick' },
    { value: 60, icon: 'my_location', label: '1 min', desc: 'Standard' },
    { value: 120, icon: 'local_fire_department', label: '2 min', desc: 'Challenge' },
    { value: 300, icon: 'emoji_events', label: '5 min', desc: 'Pro Mode' },
  ];

  return (
    <motion.div
      className="setup-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}
    >
      <div className="setup-header">
        <Button variant="ghost" onClick={onBack} className="text-white hover:text-white hover:bg-[#1a1a1a] rounded-none px-2 font-black -ml-2 mb-2">
          <span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Back
        </Button>
        <h2 className="setup-title" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined text-2xl">settings</span> Set Your Challenge
        </h2>
      </div>

      <div className="setup-instruction">Select Speech Duration</div>

      <div className="timer-selector-grid" style={{ marginBottom: '1.5rem' }}>
        {options.map((opt) => {
          const isSelected = selectedDuration === opt.value;
          return (
            <motion.div
              key={opt.value}
              className={`timer-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onChangeDuration(opt.value)}
              whileHover={{ y: isSelected ? 0 : -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="material-symbols-outlined text-3xl">{opt.icon}</span>
              </div>
              <div className="timer-card-val">{opt.label}</div>
              <div className="timer-card-label">{opt.desc}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="setup-instruction">Select Theme Category</div>

      {/* Category Dropdown Selector */}
      <div className="mb-6">
        <Select value={selectedCategory} onValueChange={onChangeCategory}>
          <SelectTrigger className="w-full bg-black text-white border-2 border-white rounded-none font-black text-[0.9rem] uppercase font-heading h-12">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-2 border-white rounded-none font-heading shadow-[4px_4px_0px_0px_#ffffff]">
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat} className="font-black hover:bg-[#111111] focus:bg-[#111111] focus:text-white rounded-none">
                {cat.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="setup-instruction">Select Speaking Language</div>

      {/* Language Dropdown Selector */}
      <div className="mb-8">
        <Select value={selectedLanguage} onValueChange={onChangeLanguage}>
          <SelectTrigger className="w-full bg-black text-white border-2 border-white rounded-none font-black text-[0.9rem] uppercase font-heading h-12">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-2 border-white rounded-none font-heading shadow-[4px_4px_0px_0px_#ffffff]">
            {SUPPORTED_LANGUAGES.map(lang => (
              <SelectItem key={lang.code} value={lang.code} className="font-black hover:bg-[#111111] focus:bg-[#111111] focus:text-white rounded-none">
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full h-14 bg-white hover:bg-[#e0e0e0] text-black font-black uppercase tracking-widest rounded-none border-2 border-white text-base"
        onClick={onNext}
      >
        <span className="material-symbols-outlined text-base mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
        Spin the "{selectedCategory}" Wheel!
      </Button>
    </motion.div>
  );
}

export default TimerSelector;
