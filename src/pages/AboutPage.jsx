import React from 'react';
import { ETHIOPIAN_CITIES } from '../data/constants';

export default function AboutPage({ onNavigate, onSearch, onOpenAuth }) {
  return (
    <div>
      {/* Hero */}
      <section className="about-hero">
        <div className="avvo-hero-tag">ABOUT AVVO · LEX-RATING</div>
        <h1>We Make Legal Easier.</h1>
        <p>
          At Avvo, we make legal easier to find, easier to understand, and easier to trust—for everyone. We are the most comprehensive attorney rating and review platform, providing detailed profiles for over 97% of licensed attorneys, hosting one of the largest free legal Q&A forums, and helping millions of people get the legal help and information they need.
        </p>
        <div className="about-hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('directory')}>
            Find a Lawyer →
          </button>
          <button
            className="btn btn-secondary btn-lg"
            style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}
            onClick={() => onNavigate('qa')}
          >
            Ask a Free Question
          </button>
        </div>
      </section>

      {/* Avvo by the Numbers */}
      <section className="about-numbers-strip">
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.6rem' }}>
            Avvo by the Numbers
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '1.5rem', marginBottom: '3.2rem' }}>
            From a bold idea in 2007, Avvo has grown into one of the most comprehensive legal networks, helping millions find the information and legal help they need.
          </p>
          <div className="about-numbers-grid">
            <div>
              <span className="about-number-val">97%</span>
              <div className="about-number-title">Of Attorneys Covered</div>
              <p className="about-number-desc">Comprehensive listings for licensed attorneys nationwide with public verification.</p>
            </div>
            <div>
              <span className="about-number-val">17M+</span>
              <div className="about-number-title">Legal Q&As Answered</div>
              <p className="about-number-desc">Every single answer comes directly from an active, licensed attorney.</p>
            </div>
            <div>
              <span className="about-number-val">1.1M+</span>
              <div className="about-number-title">Lawyers in Our Network</div>
              <p className="about-number-desc">Detailed profiles that make it easy to research, compare, and find the right fit fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Avvo? */}
      <section className="about-story-section">
        <div className="container" style={{ maxWidth: 860 }}>
          <h2 className="avvo-section-title">What is Avvo?</h2>
          <p style={{ fontSize: '1.6rem', color: 'var(--gray-700)', lineHeight: 1.7, marginBottom: '1.6rem' }}>
            Inspired by the Italian word for lawyer, <strong>“avvocato,”</strong> Avvo launched in 2007 with a bold idea: <em>make finding a lawyer as straightforward as choosing a hotel or doctor online.</em> By 2010, Avvo’s directory profiled over 90% of attorneys nationwide. By 2014, our Q&A forum had surpassed 5 million questions and answers, with a 99% response rate.
          </p>
          <p style={{ fontSize: '1.6rem', color: 'var(--gray-700)', lineHeight: 1.7 }}>
            In 2018, Avvo joined Internet Brands as part of the Martindale-Avvo network, creating one of the largest online legal networks attracting over 25 million monthly consumers. Most recently, our network was recognized in <strong>The National Law Journal's 2026 "Best Of" survey</strong>, winning multiple awards for our attorney rating and legal marketing services.
          </p>

          <div className="about-quote-box">
            “Make finding a lawyer as straightforward as choosing a hotel or doctor online.”
          </div>

          <p style={{ fontSize: '1.5rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>
            Today, Avvo hosts detailed profiles for over 97% of all licensed attorneys—based on national lawyer population registries—and more than 17 million searchable legal questions and answers.
          </p>

          {/* Timeline */}
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginTop: '3.6rem', marginBottom: '0.8rem' }}>
            Avvo Timeline
          </h3>
          <div className="about-timeline">
            {[
              { year: '2007', text: 'Avvo launches with a bold vision for accessible legal help.' },
              { year: '2010', text: 'Ratings cover 90%+ of attorneys nationwide.' },
              { year: '2014', text: 'Q&A forum surpasses 5M questions with a 99% response rate.' },
              { year: '2018', text: 'Joins Internet Brands / Martindale-Avvo network; 25M+ monthly consumers.' },
              { year: 'Today', text: '97% of all licensed attorneys rated; 17M+ Q&As searchable.' },
            ].map(t => (
              <div key={t.year} className="timeline-card">
                <div className="timeline-year">{t.year}</div>
                <p className="timeline-text">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="avvo-section avvo-section-white">
        <div className="container">
          <h2 className="avvo-section-title" style={{ textAlign: 'center' }}>Making Legal Easier</h2>
          <p className="avvo-section-sub" style={{ textAlign: 'center' }}>Four tools that connect people with the right legal help</p>

          <div className="about-pillars-grid">
            {/* Pillar 1 */}
            <div className="pillar-card">
              <div className="pillar-badge">01 · Directory</div>
              <div className="pillar-title">Attorney Profiles</div>
              <p className="pillar-desc">
                Featuring a network of 1.1 million lawyers, our legal directory makes it easy to go from "I think I need a lawyer" to "I found the right one." We bring Avvo Ratings, detailed profiles, and client reviews together in one place, giving consumers the tools to quickly research and compare, and giving attorneys a platform to stand out.
              </p>
              <div className="pillar-split">
                <div className="pillar-for">
                  <strong>For Consumers</strong> Research and compare attorneys quickly.
                </div>
                <div className="pillar-for">
                  <strong>For Attorneys</strong> A platform to stand out and attract clients.
                </div>
              </div>
            </div>

             {/* Pillar 2 */}
            <div className="pillar-card">
              <div className="pillar-badge">02 · Rating System</div>
              <div className="pillar-title">The Avvo & ELO Rating</div>
              <p className="pillar-desc">
                The Rating calculates an objective 1-to-10 score—from "Extreme Caution" to "Superb"—for each attorney based on their experience, education, peer endorsements, and court performance history. For consumers, it delivers an instant snapshot of credentials. For attorneys, it provides an objective mark of credibility.
              </p>
              <div className="pillar-split">
                <div className="pillar-for">
                  <strong>For Consumers</strong> An instant snapshot of a lawyer's credentials.
                </div>
                <div className="pillar-for">
                  <strong>For Attorneys</strong> An objective mark of credibility that builds trust.
                </div>
              </div>
            </div>
