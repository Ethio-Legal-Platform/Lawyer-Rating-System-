import React, { useState } from 'react';
import { ETHIOPIAN_CITIES, PRACTICE_AREAS, SPECIALIZATION_LIST } from '../data/constants';
import { LEGAL_GUIDES } from '../data/legalGuides';

export default function Home({
  onSearch,
  onSelectGuide,
  onNavigate
}) {
  const [specInput, setSpecInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [activeFaq, setActiveFaq] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

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
    if (onSearch) onSearch(specInput, cityInput);
    if (onNavigate) onNavigate('directory');
  };

  const handlePracticeCard = (area) => {
    if (onSearch) onSearch(area.spec, '');
    if (onNavigate) onNavigate('directory');
  };

  const faqs = [
    {
      q: 'How is an advocate’s ELO performance rating calculated in Ethiopia?',
      a: 'The ELO rating engine starts all licensed advocates at 1000 base points. Every verified court case recorded by Federal High Court and Supreme Court judges dynamically updates ratings based on case complexity, opposing advocate strength, and final verdict outcome.'
    },
    {
      q: 'Is Ministry of Justice (MoJ) license verification live and mandatory?',
      a: 'Yes. Only advocates holding active, unexpired licenses from the Federal Ministry of Justice of Ethiopia can register and appear on the directory. Registrations are automatically verified against the MoJ national database.'
    },
    {
      q: 'Can citizens ask legal questions and consult lawyers for free?',
      a: 'Yes! Litigants and businesses can post questions anonymously in the Legal Q&A Forum. Verified advocates provide initial legal insights, and users can upvote helpful advice or reach out directly for private consultations.'
    },
    {
      q: 'How are judicial court cases submitted and authenticated?',
      a: 'Court cases are entered directly by authorized judicial officers and court registrars using encrypted MoJ credentials. Every record includes docket numbers, presiding bench, counsel on record, and certified outcome.'
    },
    {
      q: 'Which regions and court jurisdictions are covered?',
      a: 'LEX-RATING covers Federal First Instance, Federal High Court, and Federal Supreme Court benches across Addis Ababa, Dire Dawa, Hawassa, Bahir Dar, Mekelle, Gondar, Jimma, Adama, Dessie, and Harar.'
    }
  ];

  return (
    <div className="xtra-home-page">
      {/* ─── Hero Section (XTRA Dark Gradient & Gold Theme) ────────────── */}
      <section className="xtra-hero">
        <div className="xtra-hero-glow" />
        <div className="container xtra-hero-container">
          {/* Main Headline */}
          <h1 className="xtra-hero-title">
            Empowering Justice with <br />
            <span className="xtra-gold-gradient">Verified Advocate Ratings</span> & Insights
          </h1>

          {/* Subtitle */}
          <p className="xtra-hero-subtitle">
            Find Ministry of Justice-verified Ethiopian lawyers across 10 regions. 
            Evaluate transparent courtroom ELO ratings, read legal guides, and connect directly.
          </p>

          {/* Action CTAs */}
          <div className="xtra-hero-actions">
            <button className="btn btn-gold btn-lg" onClick={() => onNavigate('directory')}>
              Find Top Advocates &rarr;
            </button>
            <button className="btn btn-dark-outline btn-lg" onClick={() => setShowVideoModal(true)}>
              <span className="play-icon-circle">&#9658;</span> Watch System Tour
            </button>
          </div>

          {/* Dual Search Bar */}
          <div className="xtra-search-card">
            <div className="xtra-search-field">
              <span className="xtra-field-label">Practice Area / Advocate Name</span>
              <input
                className="xtra-search-input"
                type="text"
                list="home-spec-list"
                placeholder="e.g. Criminal, Corporate, Kebede…"
                value={specInput}
                onChange={e => setSpecInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
              />
              <datalist id="home-spec-list">
                {SPECIALIZATION_LIST.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div className="xtra-search-divider" />

            <div className="xtra-search-field">
              <span className="xtra-field-label">City / Jurisdiction</span>
              <input
                className="xtra-search-input"
                type="text"
                list="home-city-list"
                placeholder="e.g. Addis Ababa, Hawassa…"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
              />
              <datalist id="home-city-list">
                {ETHIOPIAN_CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <button className="btn btn-gold xtra-search-submit" onClick={doSearch}>
              Search Lawyers
            </button>
          </div>
        </div>
      </section>

      {/* ─── Client Metrics & Trust Bar ─────────────────────────────────── */}
      <section className="xtra-metrics-section">
        <div className="container">
          <div className="xtra-metrics-grid">
            {[
              ['20+', 'MoJ-Verified Advocates', 'Active practicing advocates on the national registry'],
              ['16+', 'Decided Court Cases', 'Judicially validated trial records across federal courts'],
              ['10', 'Regional Benches', 'Courts covered across Addis Ababa & regional states'],
              ['1-10', 'Performance Scale', 'Transparent ELO algorithmic advocate ranking score'],
            ].map(([num, title, desc]) => (
              <div key={title} className="xtra-metric-item">
                <div className="xtra-metric-num">{num}</div>
                <div className="xtra-metric-title">{title}</div>
                <div className="xtra-metric-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Quote 1: "The Real Ones" (Full Screen Strip) ──────────────── */}
      <section className="xtra-quote-showcase-section">
        <div className="xtra-quote-full-strip">
          {/* Side Image with Edge-to-Edge Contrast Gradient Overlay */}
          <div
            className="xtra-quote-image-side"
            style={{ backgroundImage: `url(${advocateQuotes[0].image})` }}
          >
            <div className="xtra-quote-image-overlay" />
            <div className="xtra-quote-badge-floating">
              <span>{advocateQuotes[0].accent}</span>
            </div>
          </div>

          {/* High-Contrast Typography & Inline Header Side */}
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

      {/* ─── Practice Areas (Pre-Built Demo Style Grid) ────────────────── */}
      <section className="xtra-section">
        <div className="container">
          <div className="xtra-section-header">
            <span className="xtra-section-tag">Explore Legal Specialties</span>
            <h2 className="xtra-section-title">Specialized Legal Practice Areas</h2>
            <p className="xtra-section-sub">
              Browse top-rated advocates by specific category for your civil, criminal, or corporate matters.
            </p>
          </div>

          <div className="xtra-practice-grid">
            {PRACTICE_AREAS.map(area => (
              <div
                key={area.label}
                className="xtra-practice-card"
                onClick={() => handlePracticeCard(area)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') handlePracticeCard(area); }}
              >
                <div className="xtra-practice-icon-box">
                  <span className="xtra-practice-dot" />
                </div>
                <h3 className="xtra-practice-title">{area.label}</h3>
                <span className="xtra-practice-arrow">&rarr;</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Quote 2: "The Old Gems" (Full Screen Strip) ─────────────────── */}
      <section className="xtra-quote-showcase-section">
        <div className="xtra-quote-full-strip reverse">
          {/* Side Image with Edge-to-Edge Contrast Gradient Overlay */}
          <div
            className="xtra-quote-image-side"
            style={{ backgroundImage: `url(${advocateQuotes[1].image})` }}
          >
            <div className="xtra-quote-image-overlay" />
            <div className="xtra-quote-badge-floating">
              <span>{advocateQuotes[1].accent}</span>
            </div>
          </div>

          {/* High-Contrast Typography & Inline Header Side */}
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

      {/* ─── Core Platform Highlights (High-Contrast Tech Grid) ─────────── */}
      <section className="xtra-section xtra-section-darker">
        <div className="container">
          <div className="xtra-section-header">
            <span className="xtra-section-tag">B2G Architecture</span>
            <h2 className="xtra-section-title">Why Ethiopia Trusts LEX-RATING</h2>
            <p className="xtra-section-sub">
              Bridging the gap between citizens, advocates, and the judicial court system.
            </p>
          </div>

          <div className="xtra-features-grid">
            <div className="xtra-feature-card">
              <div className="xtra-feature-number">01</div>
              <h3 className="xtra-feature-title">Verified MoJ Credentials</h3>
              <p className="xtra-feature-text">
                Every advocate profile is cross-checked with the Federal Ministry of Justice roll of advocates. No unverified legal practitioners.
              </p>
            </div>

            <div className="xtra-feature-card gold-border">
              <div className="xtra-feature-number gold">02</div>
              <h3 className="xtra-feature-title">Courtroom ELO Ratings</h3>
              <p className="xtra-feature-text">
                Live mathematical ELO calculations based on win/loss records, opponent strength, case complexity, and certified judicial scores.
              </p>
            </div>

            <div className="xtra-feature-card">
              <div className="xtra-feature-number">03</div>
              <h3 className="xtra-feature-title">Free Citizen Q&A Forum</h3>
              <p className="xtra-feature-text">
                Litigants can ask legal questions and receive answers from advocates across criminal, family, land, and corporate law.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quote 3: "The Pillars of Justice" (Full Screen Strip) ───────── */}
      <section className="xtra-quote-showcase-section">
        <div className="xtra-quote-full-strip">
          {/* Side Image with Edge-to-Edge Contrast Gradient Overlay */}
          <div
            className="xtra-quote-image-side"
            style={{ backgroundImage: `url(${advocateQuotes[2].image})` }}
          >
            <div className="xtra-quote-image-overlay" />
            <div className="xtra-quote-badge-floating">
              <span>{advocateQuotes[2].accent}</span>
            </div>
          </div>

          {/* High-Contrast Typography & Inline Header Side */}
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

      {/* ─── Accordion FAQ Component (Standard High-Contrast Accordion) ──── */}
      <section className="xtra-section">
        <div className="container xtra-faq-container">
          <div className="xtra-section-header">
            <span className="xtra-section-tag">Frequently Asked Questions</span>
            <h2 className="xtra-section-title">Got Questions? We’ve Got Answers</h2>
            <p className="xtra-section-sub">
              Learn how the LEX-RATING rating methodology and verified legal network work.
            </p>
          </div>

          <div className="xtra-accordion">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`xtra-accordion-item${isOpen ? ' active' : ''}`}
                >
                  <button
                    className="xtra-accordion-header"
                    onClick={() => setActiveFaq(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="xtra-accordion-title">{faq.q}</span>
                    <span className="xtra-accordion-icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="xtra-accordion-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

 