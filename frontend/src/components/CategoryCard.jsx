import React from 'react';
import { motion } from 'framer-motion';

export function CategoryCard({ categoryKey, score = 0, feedback = '' }) {
  const getIcon = (key) => {
    switch (key) {
      case 'confidence': return 'shield';
      case 'fluency': return 'waves';
      case 'relevance': return 'target';
      case 'vocabulary': return 'menu_book';
      case 'structure': return 'account_tree';
      case 'clarity': return 'volume_up';
      case 'engagement': return 'auto_awesome';
      case 'timeManagement': return 'schedule';
      default: return 'help';
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

  return (
    <div className="category-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
        <span className="material-symbols-outlined text-2xl">{getIcon(categoryKey)}</span>
        <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
          {getCategoryTitle(categoryKey)}
        </h4>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.25rem' }}>{score}</span>
      </div>
      
      <div className="category-bar-container">
        <motion.div
          className="category-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <p className="category-desc">{feedback}</p>
    </div>
  );
}

export default CategoryCard;
