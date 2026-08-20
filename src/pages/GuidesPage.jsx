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
    <section className="guides-page-section">
      <div className="container">
        {/* Header Hero */}
        <div className="guides-hero-block">
          <span className="section-label">Ethiopian Legal Knowledge Base</span>
          <h1 className="guides-page-title">Legal Guides & Citizen Resources</h1>
          <p className="guides-page-sub">
            Plain-language statutory guides, constitutional explanations, and procedural handbooks authored by licensed Ethiopian advocates.
          </p>

          {/* Search Bar */}
          <div className="guides-search-wrap">
            <input
              type="text"
              className="guides-search-input"
              placeholder="Search guides by legal topic, proclamation number, or keyword (e.g. arrest rights, severance, divorce, lease)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="guides-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="guides-filter-chips">
            {categories.map(cat => (
              <button
                key={cat}
                className={`guide-filter-chip${guideCat === cat ? ' active' : ''}`}
                onClick={() => setGuideCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length > 0 ? (
          <div className="guides-grid">
            {filteredGuides.map(g => (
              <div
                key={g.id}
                className="guide-card"
                onClick={() => onSelectGuide(g)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') onSelectGuide(g); }}
              >
                <div className="guide-card-top-bar">
                  <span className="guide-cat-badge">{g.cat}</span>
                  <span className="guide-read-chip">⏱ {g.read}</span>
                </div>

                <h3 className="guide-card-title">{g.title}</h3>
                <p className="guide-card-subtitle">{g.subtitle}</p>

                {/* Proclamations Preview */}
                {g.proclamations && g.proclamations.length > 0 && (
                  <div className="guide-card-proclamations">
                    <span className="guide-proclamation-label">Key Law:</span>
                    <span className="guide-proclamation-tag">{g.proclamations[0]}</span>
                    {g.proclamations.length > 1 && (
                      <span className="guide-proclamation-more">+{g.proclamations.length - 1} more</span>
                    )}
                  </div>
                )}

                {/* Card Footer */}
                <div className="guide-card-footer">
                  <div className="guide-card-meta">
                    <div className="guide-card-author">{g.author}</div>
                    <div className="guide-card-date">{g.updated}</div>
                  </div>
                  <button className="btn btn-gold btn-sm guide-read-btn">
                    Read Guide &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="guides-empty-state">
            <h3>No Legal Guides Found</h3>
            <p>No guides match your query "{searchQuery}". Try searching with different keywords or choosing another category.</p>
            <button
              className="btn btn-gold btn-sm"
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
