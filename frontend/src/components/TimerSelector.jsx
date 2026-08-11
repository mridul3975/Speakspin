import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

const SUBTOPICS_MAP = {
  "General": [
    "The best piece of advice you've ever received",
    "How a major personal failure led to later success",
    "Why lifelong learning is crucial in a changing world",
    "A childhood memory that shaped who you are today",
    "How regular public speaking boosts social confidence",
    "The value of incorporating art and music into daily life",
    "One daily habit change that vastly improved your life",
    "Mental exercises to remain calm under high stress",
    "How practicing gratitude changes your daily perspective",
    "Why exploring new countries expands human empathy"
  ],
  "Personal Finance": [
    "The power of compound interest in wealth building",
    "Active investing vs. passive index fund investing",
    "How to construct a realistic monthly budget plan",
    "The danger of consumer credit card debt",
    "Why emergency savings funds are non-negotiable",
    "Should you buy or rent a residential home?",
    "The strategic value of multiple income streams",
    "How blockchain currency is changing retail finance",
    "Why personal finance literacy should be taught in schools",
    "Retirement planning tips for people in their twenties"
  ],
  "Entrepreneurship": [
    "The psychological mindset needed to be your own boss",
    "How to view and recover from failure in enterprise",
    "Why strategic networking is key to business growth",
    "Bootstrapping vs. raising external venture capital",
    "How to successfully locate a profitable market niche",
    "The critical role of mentors in entrepreneurial paths",
    "Balancing calculations of risk against business caution",
    "How to build a compelling personal founder brand",
    "Why overnight startup success is a modern myth",
    "Key signals that you are ready to quit your job to start up"
  ],
  "Startups": [
    "How to validate a new business concept on a budget",
    "Deciding what goes into your Minimum Viable Product (MVP)",
    "How to pitch your early-stage venture to angel investors",
    "The signals that indicate true product-market fit",
    "Best practices for hiring your first ten key employees",
    "How to structure startup equity among early members",
    "Why 90% of tech startups fail and how to beat the odds",
    "When to execute a strategic pivot in your business plan",
    "Growth hacking channels for scaling early user traction",
    "The core operational differences between startups and SMBs"
  ],
  "Tech / AI": [
    "How artificial intelligence is rewriting the job market",
    "The ethical implications of facial recognition tracking",
    "How machine learning algorithms influence daily choices",
    "The future of timeline of self-driving passenger vehicles",
    "Will humanity ever construct Artificial General Intelligence?",
    "How modern cybersecurity threats impact global trade",
    "The leverage of big data analytics in corporate strategy",
    "How distributed ledgers can protect democratic voting",
    "The carbon and power footprint of modern data centers",
    "Is artificial intelligence capable of true human creativity?"
  ],
  "Fitness": [
    "The metabolic benefits of weight lifting vs. cardio",
    "How to sustain physical workout motivation for years",
    "The role of sleep cycles in muscular recovery",
    "How to counter the health damages of prolonged sitting",
    "Why high-intensity interval training is highly efficient",
    "How cardiovascular performance changes as we age",
    "Effective stretching routines to prevent training injuries",
    "The societal shift from outdoor play to gym culture",
    "Are bodyweight home exercises as good as gym machines?",
    "Why dynamic flexibility is essential for joint mobility"
  ],
  "Nutrition": [
    "The physiological process behind intermittent fasting",
    "How processed sugars and additives affect brain health",
    "Debunking popular modern diet myths and fads",
    "The protein debate: plant sources vs. animal sources",
    "How daily water intake levels impact cognitive speed",
    "The contribution of the gut microbiome to overall health",
    "Why refined sugar is the biggest threat to public health",
    "How to read beyond marketing on food nutrition labels",
    "The ideal balance of macronutrients for daily energy",
    "Why extreme caloric restriction fails for long-term health"
  ],
  "Productivity": [
    "Why multitasking decreases overall cognitive performance",
    "How to optimize focus blocks with the Pomodoro system",
    "The compound effect of building daily atomic habits",
    "How physical workspace organization impacts attention spans",
    "Practical hacks to beat procrastination immediately",
    "The power of saying no to low-value commitments",
    "How a structured morning routine defines your daily output",
    "Minimizing notification clutter to reclaim deep work focus",
    "The critical distinction between being busy and productive",
    "How to write and execute SMART personal action items"
  ],
  "History": [
    "How Gutenberg's press catalyzed the modern information age",
    "The transformation of cities during the Industrial Era",
    "The primary geopolitical causes of the fall of Rome",
    "Leadership lessons from the turning points of World War II",
    "How the silk roads created early globalized economies",
    "The technological spin-offs of the 1960s space race",
    "How the Magna Carta laid foundation for modern liberty",
    "The societal and labor shifts after the Black Death pandemic",
    "The engineering secrets behind the pyramids of Giza",
    "How proxy conflicts shaped borders during the Cold War"
  ],
  "Literature": [
    "Why century-old classic books still tell truths today",
    "The history and impact of book bans on creative expression",
    "How dystopian fiction reflects our current societal worries",
    "How writers use metaphors to alter human perception",
    "Why poetry is a necessary outlet in a digital world",
    "How Shakespeare's plays expanded the english vocabulary",
    "The evolution of sci-fi from pulp magazines to literature",
    "Should writers prioritize aesthetics over moral lessons?",
    "Why graphic novels are gaining academic recognition",
    "How digital audiobooks are changing human reading speeds"
  ],
  "Philosophy": [
    "What the ancient thinkers meant by living a good life",
    "Is human happiness a deliberate choice or external luck?",
    "The philosophy of time: is the past and future real?",
    "Does absolute free will exist in a cause-and-effect universe?",
    "How to establish personal meaning in an chaotic world",
    "The cognitive value of silence in a hyper-connected world",
    "Are human beings naturally collaborative or self-interested?",
    "How Stoic philosophies help handle modern anxieties",
    "Is life governed by predestined paths or pure chance?",
    "What is the definition of objective truth in information spaces"
  ]
};

export function TimerSelector({ 
  selectedDuration, 
  onChangeDuration, 
  onNext, 
  onBack, 
  onStartWithCustomTopic,
  selectedCategory,
  onChangeCategory
}) {
  const [topicMode, setTopicMode] = useState('wheel'); // 'wheel' | 'custom'
  const [selectedTopic, setSelectedTopic] = useState('');

  const options = [
    { value: 30, icon: 'bolt', label: '30s', desc: 'Quick' },
    { value: 60, icon: 'my_location', label: '1 min', desc: 'Standard' },
    { value: 120, icon: 'local_fire_department', label: '2 min', desc: 'Challenge' },
    { value: 300, icon: 'emoji_events', label: '5 min', desc: 'Pro Mode' },
  ];

  const handleCategoryChange = (e) => {
    onChangeCategory(e.target.value);
    setSelectedTopic(''); // Reset subtopic
  };

  const subtopics = SUBTOPICS_MAP[selectedCategory] || [];

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
        <button className="btn-back-ghost" onClick={onBack}>
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
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
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        style={{
          width: '100%',
          padding: '0.85rem',
          backgroundColor: '#000000',
          border: '2px solid #ffffff',
          color: '#ffffff',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          borderRadius: '0px',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat.toUpperCase()}</option>
        ))}
      </select>

      <div className="setup-instruction">Select Topic Selection Mode</div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', border: '2px solid #ffffff', backgroundColor: '#0a0a1a', padding: '0.2rem' }}>
        <button
          onClick={() => setTopicMode('wheel')}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            background: topicMode === 'wheel' ? '#ffffff' : 'transparent',
            color: topicMode === 'wheel' ? '#000000' : '#ffffff',
            fontWeight: 900,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          🎡 Random Wheel
        </button>
        <button
          onClick={() => setTopicMode('custom')}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            background: topicMode === 'custom' ? '#ffffff' : 'transparent',
            color: topicMode === 'custom' ? '#000000' : '#ffffff',
            fontWeight: 900,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          📂 Select Topic
        </button>
      </div>

      {topicMode === 'wheel' ? (
        <motion.button
          className="btn btn-primary"
          style={{ width: '100%', padding: '1.25rem' }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
          Spin the "{selectedCategory}" Wheel!
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#000000',
              border: '2px solid #ffffff',
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              borderRadius: '0px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">-- SELECT SUBTOPIC FROM LIST --</option>
            {subtopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            onClick={() => selectedTopic && onStartWithCustomTopic(selectedTopic)}
            className="btn btn-primary"
            disabled={!selectedTopic}
            style={{
              width: '100%',
              padding: '1.25rem',
              opacity: selectedTopic ? 1 : 0.5,
              cursor: selectedTopic ? 'pointer' : 'not-allowed'
            }}
          >
            <span className="material-symbols-outlined text-sm">mic</span>
            Start Speaking!
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default TimerSelector;
