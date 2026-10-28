import React from 'react';

const TITLES = { confidence: 'Confidence', fluency: 'Fluency', relevance: 'Relevance', vocabulary: 'Vocabulary', structure: 'Structure', clarity: 'Clarity', engagement: 'Engagement', timeManagement: 'Time management' };
export const getCategoryTitle = key => TITLES[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, letter => letter.toUpperCase());

export function CategoryCard({ categoryKey, score, feedback = '' }) {
  const value = typeof score === 'number' && Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : null;
  return <div className="category-score-row">
    <div className="category-score-header"><h3>{getCategoryTitle(categoryKey)}</h3><strong>{value === null ? '—' : value}<small> / 100</small></strong></div>
    {value !== null && <meter className="category-score-meter" min={0} max={100} value={value} aria-label={`${getCategoryTitle(categoryKey)} score`} />}
    {feedback && <p>{feedback}</p>}
  </div>;
}

export default CategoryCard;
