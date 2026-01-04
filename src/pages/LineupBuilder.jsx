import React from 'react';
import { LineupBoard } from '../components/domain/Lineup';

// ============================================
// Lineup Builder Page
// Kanban-style visual boat lineup management
// ============================================

function LineupBuilder() {
  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
      <LineupBoard />
    </div>
  );
}

export default LineupBuilder;
