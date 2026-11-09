import React from 'react';
import { Award } from 'lucide-react';
export function getTier(rating) {
  if (rating < 800) return {
    name: 'Bronze',
    color: '#e3b68c',
    title: 'Finding Your Voice'
  };
  if (rating < 1000) return {
    name: 'Silver',
    color: '#ddd8ec',
    title: 'Rising Voice'
  };
  if (rating < 1200) return {
    name: 'Gold',
    color: '#efcf9d',
    title: 'Confident Speaker'
  };
  if (rating < 1400) return {
    name: 'Diamond',
    color: '#c7bcff',
    title: 'Eloquent Champion'
  };
  if (rating < 1600) return {
    name: 'Master',
    color: '#d9a9f0',
    title: 'Speech Master'
  };
  return {
    name: 'Legend',
    color: '#ffc1d4',
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
