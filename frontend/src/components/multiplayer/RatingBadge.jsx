import React from 'react';
import { Award } from 'lucide-react';
export function getTier(rating) {
  if (rating < 800) return {
    name: 'Bronze',
    color: '#d9a472',
    title: 'Finding Your Voice'
  };
  if (rating < 1000) return {
    name: 'Silver',
    color: '#bdcbdc',
    title: 'Rising Voice'
  };
  if (rating < 1200) return {
    name: 'Gold',
    color: '#e8c47c',
    title: 'Confident Speaker'
  };
  if (rating < 1400) return {
    name: 'Diamond',
    color: '#63e8e1',
    title: 'Eloquent Champion'
  };
  if (rating < 1600) return {
    name: 'Master',
    color: '#c3b3f0',
    title: 'Speech Master'
  };
  return {
    name: 'Legend',
    color: '#ffad88',
    title: 'Grand Orator'
  };
}
export function RatingBadge({
  rating = 1000
}) {
  const tier = getTier(rating);
  return <span className={`rank-badge rank-badge--${tier.name.toLowerCase()}`}><Award size={16} aria-hidden="true" /><span>{tier.name}</span><strong>{rating} ELO</strong></span>;
}
export default RatingBadge;
