import React, { useState } from 'react';
import { ETHIOPIAN_CITIES, SPECIALIZATION_LIST } from '../data/constants';
import LawyerCard from '../features/directory/LawyerCard';

export default function Home({
  lawyers = [],
  onSearch,
  onSelectGuide,
  onNavigate,
  onSelectLawyer
}) {
  const [specInput, setSpecInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const advocateQuotes = [
    {
      id: 1,
      image: '/images/advocate-quote-1.jpg',
      quote: "The true measure of the legal profession is not the eloquence of argument, but the steadfast courage to stand between the citizen and injustice.",
      author: "Advocate Tigist Alemu Bekele",
      title: "Commercial & Civil Rights Counsel",
      location: "Addis Ababa, Ethiopia",
      stat: "12+ Years at Federal Bar",
      accent: "Constitutional & Civil Justice"
    },
    {
      id: 2,
      image: '/images/advocate-quote-2.jpg',
      quote: "In the courtroom, every precedent cited and every statutory article defended is a brick laid in the enduring foundation of the rule of law.",
      author: "Advocate Kebede Haile Mariam",
      title: "Senior Criminal Defense & Cassation Litigator",
      location: "Federal Supreme Court, Addis Ababa",
      stat: "15+ Years Trial Experience",
      accent: "Criminal Procedure & Due Process"
    },
    {
      id: 3,
      image: '/images/advocate-quote-3.jpg',
      quote: "Advocacy is the voice of those whose rights would otherwise be silenced. To practice law is to hold a sacred trust for equity, inclusion, and human dignity.",
      author: "Advocate Yetnebersh Nigussie",
      title: "Human Rights, Inclusion & Equal Justice Advocate",
      location: "Ethiopia & International Jurisdictions",
      stat: "Distinguished Public Interest Counsel",
      accent: "Human Dignity & Accessibility"
    }
  ];

  const doSearch = () => {
    if (onSearch) onSearch(specInput || keywordInput, cityInput);
    if (onNavigate) onNavigate('directory');
  };

  const handlePracticeCard = (spec) => {
    if (onSearch) onSearch(spec, '');
    if (onNavigate) onNavigate('directory');
  };

  // Real Database Lawyers fallback to Mock
  const fallbackLawyers = [
    {
      id: 'l1',
      name: 'Mesfin Tadesse',
      specialization: 'Criminal',
      rating: 4.8,
      reviewsCount: 128,
      city: 'Addis Ababa',
      yearsExperience: 8,
      profilePic: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'l2',
      name: 'Hanan Abdella',
      specialization: 'Family',
      rating: 4.7,
      reviewsCount: 96,
      city: 'Addis Ababa',
      yearsExperience: 6,
      profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'l3',
      name: 'Daniel Reda',
      specialization: 'Contract',
      rating: 4.9,
      reviewsCount: 96,
      city: 'Addis Ababa',
      yearsExperience: 10,
      profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'l4',
      name: 'Lydia Gebre',
      specialization: 'Property',
      rating: 4.5,
      reviewsCount: 74,
      city: 'Addis Ababa',
      yearsExperience: 5,
      profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
    }
  ];

  const displayLawyers = lawyers && lawyers.length > 0 ? lawyers.slice(0, 4) : fallbackLawyers;

  return (
    <div className="lex-home-page">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="lex-hero-section">
        <div className="lex-hero-container">
          {/* Left Text & CTA */}
          <div className="lex-hero-content">
            <h1 className="lex-hero-title">
              Find Trusted Lawyers.<br />
              Share Real Experiences.
            </h1>
            <p className="lex-hero-subtitle">
              LEX helps you find qualified legal professionals in Ethiopia and makes legal services more transparent.
            </p>
            <div className="lex-hero-buttons">
              <button 
                type="button"
                className="lex-btn-dark-lg"
                onClick={() => onNavigate('directory')}
              >
                Find a Lawyer
              </button>
              <button 
                type="button"
                className="lex-btn-outline-play"
                onClick={() => onNavigate('about')}
              >
                How It Works <span className="lex-play-icon">▷</span>
              </button>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lex-hero-image-wrap">
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800" 
              alt="Gavel and scale of justice"
              className="lex-hero-img"
            />
          </div>
        </div>

        {/* Floating Search Bar Card (Lowered slightly) */}
        <div className="lex-search-card-container">
          <div className="lex-search-card">
            <div className="lex-search-col">
              <label className="lex-search-label">Search Lawyer</label>
              <div className="lex-input-icon-wrap">
                <svg className="lex-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="lex-search-input"
                  placeholder="Name, practice area or keyword..."
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
                />
              </div>
            </div>

            <div className="lex-search-col">
              <label className="lex-search-label">Practice Area</label>
              <select
                className="lex-search-select"
                value={specInput}
                onChange={e => setSpecInput(e.target.value)}
              >
                <option value="">All Practice Areas</option>
                {SPECIALIZATION_LIST.map(s => (
                  <option key={s} value={s}>{s} Law</option>
                ))}
              </select>
            </div>

            <div className="lex-search-col">
              <label className="lex-search-label">Location</label>
              <select
                className="lex-search-select"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
              >
                <option value="">All Ethiopia</option>
                {ETHIOPIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="lex-search-btn-col">
              <button type="button" className="lex-btn-search-submit" onClick={doSearch}>
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why LEX? Section ────────────────────────────────────────── */}
      <section className="lex-section lex-why-section">
        <h2 className="lex-section-center-title">Why LEX?</h2>

        <div className="lex-why-grid">
          <div className="lex-why-card">
            <div className="lex-why-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <h3 className="lex-why-card-title">Verified Lawyers</h3>
            <p className="lex-why-card-text">We verify licenses and credentials for trust.</p>
          </div>

          <div className="lex-why-card">
            <div className="lex-why-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h3 className="lex-why-card-title">Real Reviews</h3>
            <p className="lex-why-card-text">Clients share real experiences and ratings.</p>
          </div>

          <div className="lex-why-card">
            <div className="lex-why-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <path d="M12 3V21M12 3L4 7M12 3L20 7M4 7V11C4 13.2091 7.58172 15 12 15C16.4183 15 20 13.2091 20 11V7M4 7L12 11M20 7L12 11"></path>
              </svg>
            </div>
            <h3 className="lex-why-card-title">Ethiopia Focused</h3>
            <p className="lex-why-card-text">Designed for the Ethiopian legal ecosystem.</p>
          </div>

          <div className="lex-why-card">
            <div className="lex-why-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="lex-why-card-title">Safe & Transparent</h3>
            <p className="lex-why-card-text">Fair ratings. No fake reviews. No hidden agendas.</p>
          </div>
        </div>
      </section>

      {/* ─── Quote 1: "The Real Champions of Justice" (Previous Exact Layout) ─── */}
      <section className="xtra-quote-showcase-section">
        <div className="xtra-quote-full-strip">
          <div className="xtra-quote-image-column">
            <div
              className="xtra-quote-image-side"
              style={{ backgroundImage: `url(${advocateQuotes[2].image})` }}
            >
              <div className="xtra-quote-image-overlay" />
            </div>
            <div className="xtra-quote-photo-caption">
              <span className="xtra-quote-photo-accent">{advocateQuotes[2].accent}</span>
            </div>
          </div>

          <div className="xtra-quote-content-side">
            <div className="xtra-quote-inline-header">
              <span className="xtra-quote-inline-tag">Public Interest Advocacy</span>
              <h2 className="xtra-quote-inline-title">The Real Champions of Justice</h2>
              <p className="xtra-quote-inline-sub">
                Championing equal accessibility, human dignity, and pro bono community representation.
              </p>
            </div>

            <div className="xtra-quote-mark">“</div>
            <blockquote className="xtra-quote-text">
              {advocateQuotes[2].quote}
            </blockquote>

            <div className="xtra-quote-attribution">
              <div className="xtra-quote-author-name">
                {advocateQuotes[2].author}
              </div>
              <div className="xtra-quote-author-role">
                {advocateQuotes[2].title}
              </div>
              <div className="xtra-quote-author-meta">
                <span>{advocateQuotes[2].location}</span>
                <span>·</span>
                <span className="xtra-quote-stat-tag">{advocateQuotes[2].stat}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Popular Practice Areas ──────────────────────────────────── */}
      <section className="lex-section">
        <div className="lex-section-header">
          <h2 className="lex-section-title">Popular Practice Areas</h2>
          <button 
            type="button" 
            className="lex-link-view-all"
            onClick={() => onNavigate('directory')}
          >
            View All
          </button>
        </div>

        <div className="lex-practice-icons-grid">
          {[
            {
              name: 'Criminal Law', spec: 'Criminal',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <path d="M12 3V21M12 3L4 7M12 3L20 7M4 7V11C4 13.2091 7.58172 15 12 15C16.4183 15 20 13.2091 20 11V7M4 7L12 11M20 7L12 11"></path>
                </svg>
              )
            },
            {
              name: 'Family Law', spec: 'Family',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              )
            },
            {
              name: 'Contract Law', spec: 'Contract',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              )
            },
            {
              name: 'Property Law', spec: 'Property',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              )
            },
            {
              name: 'Employment Law', spec: 'Employment',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              )
            },
            {
              name: 'Business Law', spec: 'Corporate',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              )
            },
            {
              name: 'Immigration Law', spec: 'Immigration',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              )
            },
            {
              name: 'More', spec: '',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              )
            }
          ].map(p => (
            <div
              key={p.name}
              className="lex-practice-box"
              onClick={() => handlePracticeCard(p.spec)}
              role="button"
              tabIndex={0}
            >
              <div className="lex-practice-icon-svg">{p.icon}</div>
              <span className="lex-practice-name">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Quote 2: "The Old Gems" (Previous Exact Layout) ────────────────── */}
      <section className="xtra-quote-showcase-section">
        <div className="xtra-quote-full-strip reverse">
          <div className="xtra-quote-image-column">
            <div
              className="xtra-quote-image-side"
              style={{ backgroundImage: `url(${advocateQuotes[1].image})` }}
            >
              <div className="xtra-quote-image-overlay" />
            </div>
            <div className="xtra-quote-photo-caption">
              <span className="xtra-quote-photo-accent">{advocateQuotes[1].accent}</span>
            </div>
          </div>

          <div className="xtra-quote-content-side">
            <div className="xtra-quote-inline-header">
              <span className="xtra-quote-inline-tag">Mastery & Tradition</span>
              <h2 className="xtra-quote-inline-title">The Old Gems</h2>
              <p className="xtra-quote-inline-sub">
                Veteran litigators who have shaped precedent across the Federal Supreme Court and Cassation Bench.
              </p>
            </div>

            <div className="xtra-quote-mark">“</div>
            <blockquote className="xtra-quote-text">
              {advocateQuotes[1].quote}
            </blockquote>

            <div className="xtra-quote-attribution">
              <div className="xtra-quote-author-name">
                {advocateQuotes[1].author}
              </div>
              <div className="xtra-quote-author-role">
                {advocateQuotes[1].title}
              </div>
              <div className="xtra-quote-author-meta">
                <span>{advocateQuotes[1].location}</span>
                <span>·</span>
                <span className="xtra-quote-stat-tag">{advocateQuotes[1].stat}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Top Rated Lawyers ──────────────────────────────────────── */}
      <section className="lex-section">
        <div className="lex-section-header">
          <h2 className="lex-section-title">Top Rated Lawyers</h2>
          <button 
            type="button" 
            className="lex-link-view-all"
            onClick={() => onNavigate('directory')}
          >
            View All Lawyers →
          </button>
        </div>

        <div className="lex-lawyers-grid">
          {displayLawyers.map(lawyer => (
            <LawyerCard
              key={lawyer.id}
              lawyer={lawyer}
              onClick={() => {
                if (onSelectLawyer) onSelectLawyer(lawyer);
                else onNavigate('directory');
              }}
            />
          ))}
        </div>
      </section>

      {/* ─── Quote 3: "The Real Ones" (Previous Exact Layout) ──────────────── */}
      <section className="xtra-quote-showcase-section">
        <div className="xtra-quote-full-strip">
          <div className="xtra-quote-image-column">
            <div
              className="xtra-quote-image-side"
              style={{ backgroundImage: `url(${advocateQuotes[0].image})` }}
            >
              <div className="xtra-quote-image-overlay" />
            </div>
            <div className="xtra-quote-photo-caption">
              <span className="xtra-quote-photo-accent">{advocateQuotes[0].accent}</span>
            </div>
          </div>

          <div className="xtra-quote-content-side">
            <div className="xtra-quote-inline-header">
              <span className="xtra-quote-inline-tag">Voices of the Bar</span>
              <h2 className="xtra-quote-inline-title">The Real Ones</h2>
              <p className="xtra-quote-inline-sub">
                Advocates with steadfast dedication to client rights, constitutional justice, and courtroom integrity.
              </p>
            </div>

            <div className="xtra-quote-mark">“</div>
            <blockquote className="xtra-quote-text">
              {advocateQuotes[0].quote}
            </blockquote>

            <div className="xtra-quote-attribution">
              <div className="xtra-quote-author-name">
                {advocateQuotes[0].author}
              </div>
              <div className="xtra-quote-author-role">
                {advocateQuotes[0].title}
              </div>
              <div className="xtra-quote-author-meta">
                <span>{advocateQuotes[0].location}</span>
                <span>·</span>
                <span className="xtra-quote-stat-tag">{advocateQuotes[0].stat}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────────── */}
      <section className="lex-section lex-how-section">
        <h2 className="lex-section-center-title">How It Works</h2>

        <div className="lex-how-steps">
          <div className="lex-how-step">
            <div className="lex-how-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div className="lex-how-text">
              <h3 className="lex-how-title">Search</h3>
              <p className="lex-how-sub">Find lawyers by practice area or location.</p>
            </div>
          </div>

          <span className="lex-step-arrow">›</span>

          <div className="lex-how-step">
            <div className="lex-how-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="lex-how-text">
              <h3 className="lex-how-title">Compare</h3>
              <p className="lex-how-sub">Compare profiles, ratings, and reviews.</p>
            </div>
          </div>

          <span className="lex-step-arrow">›</span>

          <div className="lex-how-step">
            <div className="lex-how-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="lex-how-text">
              <h3 className="lex-how-title">Connect</h3>
              <p className="lex-how-sub">Contact the lawyer that fits your needs.</p>
            </div>
          </div>

          <span className="lex-step-arrow">›</span>

          <div className="lex-how-step">
            <div className="lex-how-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div className="lex-how-text">
              <h3 className="lex-how-title">Review</h3>
              <p className="lex-how-sub">Share your experience to help others.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Are you a lawyer? Banner ────────────────────────────────── */}
      <section className="lex-cta-banner">
        <div className="lex-cta-left">
          <div className="lex-cta-gold-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3V21M12 3L4 7M12 3L20 7M4 7V11C4 13.2091 7.58172 15 12 15C16.4183 15 20 13.2091 20 11V7M4 7L12 11M20 7L12 11" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="lex-cta-info">
            <h2 className="lex-cta-title">Are you a lawyer?</h2>
            <p className="lex-cta-sub">
              Join LEX and build your professional profile. Get trusted by clients and grow your practice.
            </p>
          </div>
        </div>

        <div className="lex-cta-right">
          <button 
            type="button"
            className="lex-btn-gold-lg"
            onClick={() => onNavigate('directory')}
          >
            Create Lawyer Account
          </button>
        </div>
      </section>
    </div>
  );
}
