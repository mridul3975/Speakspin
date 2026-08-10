import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export function CategoryCard({ categoryKey, score = 0, feedback = '' }) {
  // Map category keys to Lucide icons
  const getIcon = (key) => {
    switch (key) {
      case 'confidence':
        return <Icons.ShieldCheck className="category-icon" size={20} />;
      case 'fluency':
        return <Icons.Waves className="category-icon" size={20} />;
      case 'relevance':
        return <Icons.Target className="category-icon" size={20} />;
      case 'vocabulary':
        return <Icons.BookOpen className="category-icon" size={20} />;
      case 'structure':
        return <Icons.GitMerge className="category-icon" size={20} />; // or Layers
      case 'clarity':
        return <Icons.Volume2 className="category-icon" size={20} />;
      case 'engagement':
        return <Icons.Sparkles className="category-icon" size={20} />;
      case 'timeManagement':
        return <Icons.Clock className="category-icon" size={20} />;
      default:
        return <Icons.HelpCircle className="category-icon" size={20} />;
    }
  };

  const getCategoryTitle = (key) => {
    switch (key) {
      case 'confidence': return 'Confidence';
      case 'fluency': return 'Fluency';
      case 'relevance': return 'Relevance';
      case 'vocabulary': return 'Vocabulary';
      case 'structure': return 'Structure';
      case 'clarity': return 'Clarity';
      case 'engagement': return 'Engagement';
      case 'timeManagement': return 'Time Management';
      default: return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  const getColor = (val) => {
    if (val >= 80) return '#4ECDC4'; // teal
    if (val >= 60) return '#FFEAA7'; // yellow
    if (val >= 40) return '#FFA502'; // orange
    return '#FF6B6B'; // red
  };

  const color = getColor(score);

  return (
    <div className="category-card">
      <div className="category-card-header">
        <div className="category-title-wrapper">
          {getIcon(categoryKey)}
          <h4 className="category-name">{getCategoryTitle(categoryKey)}</h4>
        </div>
        <span className="category-score" style={{ color }}>{score}</span>
      </div>
      
      {/* Horizontal progress bar */}
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <p className="category-feedback">{feedback}</p>
    </div>
  );
}

export default CategoryCard;
