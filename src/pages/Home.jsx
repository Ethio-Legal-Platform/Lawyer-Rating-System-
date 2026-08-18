import React, { useState } from 'react';
import LawyerCard from '../features/directory/LawyerCard';
import { ETHIOPIAN_CITIES, PRACTICE_AREAS } from '../data/constants';
import { LEGAL_GUIDES } from '../data/legalGuides';

export default function Home({
  lawyers = [],
  leaderboard = [],
  loading = false,
  onSearch,
  onSelectLawyer,
  onSelectGuide,
  onNavigate
}) {
  const [specInput, setSpecInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  const doSearch = () => {
    if (onSearch) onSearch(specInput, cityInput);
    if (onNavigate) onNavigate('directory');
  };

  const handlePracticeCard = (area) => {
    if (onSearch) onSearch(area.spec, '');
    if (onNavigate) onNavigate('directory');
  };

  return (
    <>
      {/* Hero */}
      <section className="avvo-hero">
        <div className="avvo-hero-tag">🇪🇹 Official Ministry of Justice Registry</div>
        <h1>Legal. <em>Easier.</em></h1>
        <p className="avvo-hero-sub">
          Find MoJ-verified Ethiopian lawyers by practice area and city. Compare live ELO ratings, read profiles, and connect instantly.
        </p>

        {/* Dual search bar */}
        <div className="avvo-search-box">
          <div className="avvo-search-field">
            <span className="avvo-search-icon">⚖</span>
            <input
              className="avvo-search-input"
              type="text"
              list="home-spec-list"
              placeholder="Practice area (Criminal, Family…)"
              value={specInput}
              onChange={e => setSpecInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
            />
            <datalist id="home-spec-list">
              {['Criminal', 'Corporate', 'Family', 'Civil'].map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="avvo-search-field">
            <span className="avvo-search-icon">📍</span>
            <input
              className="avvo-search-input"
              type="text"
              list="home-city-list"
              placeholder="City (Addis Ababa, Hawassa…)"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
            />
            <datalist id="home-city-list">
              {ETHIOPIAN_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <button className="avvo-search-btn" onClick={doSearch}>Find Lawyers</button>
        </div>

        {/* Hero stats */}
        <div className="avvo-hero-stats">
          {[
            [`${lawyers.length}+`, 'Verified Advocates'],
            ['10', 'Ethiopian Cities'],
            ['4', 'Practice Areas'],
            ['ELO', 'Live Performance Ratings'],
          ].map(([num, label]) => (
            <div key={label} className="avvo-hero-stat">
              <span className="avvo-hero-stat-num">{num}</span>
              <span className="avvo-hero-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Practice Area Grid */}
      <section className="avvo-section avvo-section-white">
        <div className="container">
          <h2 className="avvo-section-title">Browse by Practice Area</h2>
          <p className="avvo-section-sub">Find verified lawyers specializing in your legal need.</p>
          <div className="practice-grid">
            {PRACTICE_AREAS.map(area => (
              <div
                key={area.label}
                className="practice-card"
                onClick={() => handlePracticeCard(area)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') handlePracticeCard(area); }}
              >
                <span className="practice-card-icon">{area.icon}</span>
                <span className="practice-card-label">{area.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="avvo-section avvo-section-gray">
        <div className="container">
          <h2 className="avvo-section-title" style={{ textAlign: 'center' }}>How LEX-RATING Works</h2>
          <p className="avvo-section-sub" style={{ textAlign: 'center' }}>Three simple steps to finding your advocate.</p>
          <div className="how-strip">
            {[
              { num: '1', title: 'Search', desc: 'Enter your legal issue and city. Filter by specialization to narrow results instantly.' },
              { num: '2', title: 'Compare', desc: 'Review live ELO performance ratings, case win rates, education, and client reviews.' },
              { num: '3', title: 'Connect', desc: 'Message or call the lawyer directly. All advocates are MoJ-verified and licensed.' },
            ].map(s => (
              <div key={s.num} className="how-step">
                <div className="how-step-num">{s.num}</div>
                <div className="how-step-title">{s.title}</div>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust-bar">
        <div className="trust-bar-inner">
          {[
            ['12', 'MoJ-Verified Advocates'],
            ['10+', 'Court Cases Rated'],
            ['10', 'Cities Covered'],
            ['1–10', 'Transparent ELO Rating'],
          ].map(([num, label]) => (
            <div key={label} className="trust-stat">
              <span className="trust-stat-num">{num}</span>
              <span className="trust-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Lawyers */}
      <section className="avvo-section avvo-section-white">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.4rem' }}>
            <div>
              <h2 className="avvo-section-title" style={{ marginBottom: '0.3rem' }}>Top-Rated Advocates</h2>
              <p className="avvo-section-sub" style={{ marginBottom: 0 }}>Sorted by ELO performance rating.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('directory')}>View All →</button>
          </div>
          {loading ? (
            <div className="loading-state">
              Loading advocates <span className="loading-dots"><span/><span/><span/></span>
            </div>
          ) : (
            <div className="lawyers-grid">
              {lawyers.slice(0, 6).map(lawyer => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} onClick={() => onSelectLawyer(lawyer)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Most Interactive Advocates Podium */}
      {leaderboard.length > 0 && (
        <section className="avvo-section avvo-section-white" style={{ borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 2.8rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f55d25', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ⭐ 2026 Community Recognition
              </span>
              <h2 className="avvo-section-title" style={{ marginTop: '0.4rem', marginBottom: '0.6rem' }}>
                Most Interactive Advocates of the Year
              </h2>
              <p className="avvo-section-sub" style={{ marginBottom: 0 }}>
                Honoring the most engaged advocates answering citizen legal questions, providing verified guidance, and receiving top community helpfulness ratings.
              </p>
            </div>

            <div className="leaderboard-grid">
              {leaderboard.map((lawyer, idx) => {
                const topAw = lawyer.awards && lawyer.awards.length > 0 ? lawyer.awards[0] : null;
                const crownLabel = idx === 0 ? '🏆 Rank #1 Advocate' : idx === 1 ? '⭐ Rank #2 Advocate' : '🌟 Rank #3 Advocate';
                return (
                  <div
                    key={lawyer.id}
                    className={`leaderboard-card rank-${idx + 1}`}
                    onClick={() => {
                      const fullLawyer = lawyers.find(l => l.id === lawyer.id) || lawyer;
                      onSelectLawyer(fullLawyer);
                    }}
                  >
                    <span
                      className="leaderboard-rank-crown"
                      style={{
                        background: idx === 0 ? '#f59e0b' : idx === 1 ? '#64748b' : '#ea580c'
                      }}
                    >
                      {crownLabel}
                    </span>
                    <img
                      src={lawyer.profilePic}
                      alt={lawyer.name}
                      className="leaderboard-avatar"
                      onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.3rem' }}>
                      {lawyer.name}
                    </h3>
                    <div style={{ fontSize: '1.35rem', color: 'var(--blue)', fontWeight: 600, marginBottom: '0.6rem' }}>
                      {lawyer.specialization} Law · 📍 {lawyer.city}
                    </div>
                    {topAw && (
                      <div style={{ fontSize: '1.2rem', color: '#92400e', background: '#fef3c7', padding: '0.3rem 0.8rem', borderRadius: 99, display: 'inline-block', fontWeight: 700, marginBottom: '1.2rem' }}>
                        {topAw.title}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', background: '#f8fafc', padding: '1rem', borderRadius: 8, marginBottom: '1.4rem', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue)' }}>{lawyer.interactionScore || 0}</div>
                        <div style={{ fontSize: '1.15rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Activity Points</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#52a304' }}>▲ {lawyer.helpfulVotesReceived || 0}</div>
                        <div style={{ fontSize: '1.15rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Helpful Votes</div>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm btn-full">
                      View Advocate Profile →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Legal Guides */}
      <section className="avvo-section avvo-section-white">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.4rem' }}>
            <div>
              <h2 className="avvo-section-title" style={{ marginBottom: '0.3rem' }}>Legal Guides & Articles</h2>
              <p className="avvo-section-sub" style={{ marginBottom: 0 }}>Plain-language explanations of Ethiopian laws and procedures.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('guides')}>All Guides →</button>
          </div>
          <div className="guides-grid">
            {LEGAL_GUIDES.slice(0, 3).map(g => (
              <div key={g.id} className="guide-card" onClick={() => onSelectGuide(g)}>
                <div className="guide-card-color" style={{ background: g.color || 'var(--orange)' }} />
                <div className="guide-card-body">
                  <div className="guide-cat">{g.cat}</div>
                  <div className="guide-title">{g.title}</div>
                  <p style={{ fontSize: '1.35rem', color: 'var(--gray-500)', lineHeight: 1.45, marginBottom: '0.8rem' }}>
                    {g.subtitle}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span className="guide-read">📖 {g.read}</span>
                    <span style={{ fontSize: '1.3rem', color: 'var(--blue)', fontWeight: 700 }}>Read Article →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
