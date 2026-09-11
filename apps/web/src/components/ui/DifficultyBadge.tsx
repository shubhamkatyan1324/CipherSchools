import React from 'react';
import { Badge } from './Badge';
import { Difficulty } from '../../types';

export const DifficultyBadge: React.FC<{ difficulty: Difficulty | string }> = ({ difficulty }) => {
  switch (difficulty) {
    case 'EASY':
      return <Badge variant="emerald">Easy</Badge>;
    case 'MEDIUM':
      return <Badge variant="orange">Medium</Badge>;
    case 'HARD':
      return <Badge variant="rose">Hard</Badge>;
    default:
      return <Badge variant="neutral">{difficulty}</Badge>;
  }
};
