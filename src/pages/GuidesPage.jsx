import React, { useState, useMemo } from 'react';
import { LEGAL_GUIDES } from '../data/legalGuides';

export default function GuidesPage({ guides = LEGAL_GUIDES, onSelectGuide }) {
  const [guideCat, setGuideCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Criminal Law',
    'Family Law',
    'Corporate Law',
    'Civil & Land Law',
    'Labour Law',
    'Constitutional Law',
    'Intellectual Property',
    'Civil Law'
  ];

  const filteredGuides = useMemo(() => {
    return guides.filter(g => {
      const matchCat = guideCat === 'All' || g.cat === guideCat;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.subtitle.toLowerCase().includes(q) ||
        g.cat.toLowerCase().includes(q) ||
        g.author.toLowerCase().includes(q) ||
        (g.proclamations && g.proclamations.some(p => p.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });
  }, [guides, guideCat, searchQuery]);

  return (
    <section className="lex-guides-page">
      <div className="lex-guides-container">
        {/* Header Hero */}
        <div className="lex-guides-hero">
          <span className="lex-guide-tag">Ethiopian Legal Knowledge Base</span>
          <h1 className="lex-guides-title">Legal Guides & Citizen Resources</h1>
          <p className="lex-guides-sub">
            Plain-language statutory guides, constitutional explanations, and procedural handbooks authored by licensed Ethiopian advocates.
          </p>

          {/* Search Bar */}
          <div className="lex-guides-search-card">
            <div className="lex-input-icon-wrap">
              <svg className="lex-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="lex-search-input"
                placeholder="Search guides by legal topic, proclamation number, or keyword (e.g. arrest rights, severance, divorce)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="lex-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="lex-filter-chips-wrap" style={{ justifyContent: 'center', marginTop: '1.6rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`lex-chip${guideCat === cat ? ' active' : ''}`}
                onClick={() => setGuideCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Guides Cards Grid */}
        {filteredGuides.length > 0 ? (
          <div className="lex-guides-grid">
            {filteredGuides.map(g => (
              <div
                key={g.id}
                className="lex-guide-card"
                onClick={() => onSelectGuide(g)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelectGuide(g); }}
              >
                <div className="lex-guide-card-header">
                  <span className="lex-guide-cat-badge">{g.cat}</span>
                  <span className="lex-guide-read-time">{g.read} read</span>
                </div>

                <h3 className="lex-guide-card-title">{g.title}</h3>
                <p className="lex-guide-card-sub">{g.subtitle}</p>

                {/* Proclamations Tag */}
                {g.proclamations && g.proclamations.length > 0 && (
                  <div className="lex-guide-proclamations-row">
                    <span className="lex-proclamation-lbl">Key Law:</span>
                    <span className="lex-proclamation-tag">{g.proclamations[0]}</span>
                    {g.proclamations.length > 1 && (
                      <span className="lex-proclamation-more">+{g.proclamations.length - 1} more</span>
                    )}
                  </div>
                )}

                {/* Footer Meta & Action */}
                <div className="lex-guide-card-footer">
                  <div className="lex-guide-author-info">
                    <div className="lex-guide-author-name">{g.author}</div>
                    <div className="lex-guide-date">{g.updated}</div>
                  </div>
                  <button 
                    type="button" 
                    className="lex-btn-dark-sm"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectGuide(g);
                    }}
                  >
                    Read Guide →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="lex-empty-box">
            <h3 className="lex-empty-title">No Legal Guides Found</h3>
            <p className="lex-empty-sub">No guides match your search query "{searchQuery}". Try searching with different keywords or resetting filters.</p>
            <button
              type="button"
              className="lex-btn-dark-lg"
              onClick={() => {
                setSearchQuery('');
                setGuideCat('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
