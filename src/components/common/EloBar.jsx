import React from 'react';

export default function EloBar({ elo = 1000 }) {
  const numElo = Number(elo) || 1000;
  const pct = Math.min(Math.max(((numElo - 800) / 800) * 100, 5), 100);

  return (
    <div className="elo-bar-wrap">
      <div className="elo-bar-track">
        <div className="elo-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="elo-bar-label">{numElo} ELO</span>
    </div>
  );
}
