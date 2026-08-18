import React, { useState } from 'react';
import { LEGAL_GUIDES } from '../data/legalGuides';

export default function GuidesPage({ guides = LEGAL_GUIDES, onSelectGuide }) {
  const [guideCat, setGuideCat] = useState('All');

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

  const filteredGuides = guides.filter(g => guideCat === 'All' || g.cat === guideCat);

  return (
    <section className="avvo-section avvo-section-gray" style={{ minHeight: '60vh' }}>
      <div className="container">
        <h1 className="avvo-section-title">Legal Guides & Resources</h1>
        <p className="avvo-section-sub">
          Plain-language explanations of Ethiopian laws, proclamations, and procedures written by verified advocates.
        </p>

        {/* Category Filter Chips */}
        <div className="filter-chips" style={{ marginBottom: '2.8rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip${guideCat === cat ? ' active' : ''}`}
              onClick={() => setGuideCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="guides-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.4rem' }}>
          {filteredGuides.map(g => (
            <div
              key={g.id}
              className="guide-card"
              onClick={() => onSelectGuide(g)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') onSelectGuide(g); }}
            >
              <div className="guide-card-color" style={{ background: g.color }} />
              <div className="guide-card-body">
                <div className="guide-cat">{g.cat}</div>
                <div className="guide-title">{g.title}</div>
                <p style={{ fontSize: '1.35rem', color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: '1.2rem' }}>
                  {g.subtitle}
                </p>
                <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)', borderTop: '1px solid var(--border)', paddingTop: '0.8rem', marginBottom: '1.2rem' }}>
                  <div>Author: {g.author}</div>
                  <div>Date: {g.updated} · Read time: {g.read}</div>
                </div>
                <button
                  className="btn btn-primary btn-sm btn-full"
                  style={{ background: g.color || 'var(--orange)' }}
                >
                  Read Full Guide &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
