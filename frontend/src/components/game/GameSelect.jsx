import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function GameSelect({ id, label, value, onValueChange, options, className = '', disabled = false }) {
  return <Select items={options} value={value} onValueChange={next => { if (next !== null) onValueChange?.(next); }} disabled={disabled}>
    <SelectTrigger id={id} className={`game-select ${className}`} aria-label={label}>
      <SelectValue placeholder={label} />
    </SelectTrigger>
    <SelectContent className="game-select-content" align="start" alignItemWithTrigger={false} sideOffset={7}>
      {options.map(option => <SelectItem className="game-select-option" key={option.value} value={option.value}>{option.label}</SelectItem>)}
    </SelectContent>
  </Select>;
}

export default GameSelect;
