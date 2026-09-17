import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <Card className="bg-[#1a1a1a] border-2 border-[#333333] rounded-none p-4 text-white text-left h-full flex flex-col hover:border-white transition-colors duration-300">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Horizontal Header (Title on left, score on right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined text-xl">{getIcon(categoryKey)}</span>
            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
              {getCategoryTitle(categoryKey)}
            </h4>
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.15rem' }}>{score}</span>
        </div>
        
        <Progress value={score} className="h-2 rounded-none bg-black mb-3 [&>div]:bg-white" />

        <p className="text-[#c6c6c7] text-[0.8rem] leading-relaxed mt-auto font-body m-0" style={{ textAlign: 'left' }}>{feedback}</p>
      </CardContent>
    </Card>
  );
}

export default CategoryCard;
