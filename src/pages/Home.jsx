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

