import React from 'react';
import { ETHIOPIAN_CITIES } from '../data/constants';

export default function AboutPage({ onNavigate, onSearch, onOpenAuth }) {
  return (
    <div className="lex-about-page">
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="lex-about-hero-section">
        <div className="lex-about-hero-container">
          <span className="lex-guide-tag">ABOUT LEX-RATING • ETHIOPIA'S OFFICIAL B2G LEGAL DIRECTORY</span>
          <h1 className="lex-about-hero-title">
            Demystifying Legal Practice Through Verified Lawyer Experience.
          </h1>
          <p className="lex-about-hero-sub">
            <strong>LEX-RATING</strong> is Ethiopia's authoritative legal rating platform. We provide complete transparency for citizens, enterprises, and public institutions to evaluate, compare, and retain Ministry of Justice verified advocates based on real courtroom performance, litigation track records, and authentic client reviews.
          </p>

          <div className="lex-about-hero-buttons">
            <button
              type="button"
              className="lex-btn-dark-lg"
              onClick={() => onNavigate('directory')}
            >
              Find a Verified Advocate →
            </button>
            <button
              type="button"
              className="lex-btn-outline-play"
              onClick={() => onNavigate('qa')}
            >
              Ask a Free Legal Question
            </button>
          </div>
        </div>
      </section>

      {/* ─── Meaning of LEX Section ────────────────────────────────────── */}
      <section className="lex-section">
        <div className="lex-about-card-box">
          <div className="lex-about-callout-header">
            <span>What Does </span>
            <span className="lex-badge-tag-dark">LEX</span>
            <span> Mean?</span>
          </div>

          <p className="lex-about-lead-text">
            At its core, <strong>LEX stands for Lawyer EXperience</strong> (while also drawing heritage from the classical Latin root <em>lex</em>, meaning <em>Law and Justice</em>).
          </p>
          <p className="lex-about-lead-text">
            In traditional legal markets, choosing an attorney has often relied on hearsay, non-transparent claims, or marketing. <strong>LEX-RATING was established to redefine "Lawyer Experience" into a verifiable, merit-based standard.</strong> To us, experience is not just how many years have passed on a diploma—it is measured by an advocate's real-world courtroom history, validated Ministry of Justice credentials, case win/loss ratios across regional and federal benches, and their active contribution to community justice.
          </p>

          <div className="lex-about-dims-grid">
            <div className="lex-dim-card">
              <h4 className="lex-dim-title">1. Courtroom Record</h4>
              <p className="lex-dim-text">
                Real litigation analytics tracking verdicts, rulings, and settlement outcomes before the Federal Supreme Court, High Courts, and Regional circuits.
              </p>
            </div>

            <div className="lex-dim-card">
              <h4 className="lex-dim-title">2. Official MoJ Verification</h4>
              <p className="lex-dim-text">
                Every listed advocate holds an authenticated, active Ministry of Justice license, cross-checked against federal disciplinary registries.
              </p>
            </div>

            <div className="lex-dim-card">
              <h4 className="lex-dim-title">3. Domain Specialization</h4>
              <p className="lex-dim-text">
                Deep practice-area classification spanning Criminal Defense, Corporate M&A, Land & Property Expropriation, Commercial Arbitration, and Family Law.
              </p>
            </div>

            <div className="lex-dim-card">
              <h4 className="lex-dim-title">4. Civic & Pro Bono Impact</h4>
              <p className="lex-dim-text">
                Active engagement answering citizens' legal dilemmas in the public Q&A forum and undertaking verified pro bono representations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Operating Tenets ──────────────────────────────────── */}
      <section className="lex-section">
        <div className="lex-section-header-center">
          <h2 className="lex-section-center-title">Our Core Operating Tenets</h2>
          <p className="lex-section-center-sub">
            The three guiding principles that govern every profile and rating on the LEX platform.
          </p>
        </div>

        <div className="lex-motto-grid">
          <div className="lex-motto-card">
            <span className="lex-motto-tag">TRUST</span>
            <h3 className="lex-motto-title">Government-Backed Integrity</h3>
            <p className="lex-motto-desc">
              Every lawyer profile is linked directly to the Ethiopian Ministry of Justice license database. Unlicensed or suspended individuals cannot register or represent themselves on the platform.
            </p>
          </div>

          <div className="lex-motto-card">
            <span className="lex-motto-tag">REVIEW</span>
            <h3 className="lex-motto-title">Authentic Litigant Feedback</h3>
            <p className="lex-motto-desc">
              Real clients who have retained an advocate share transparent reviews and ratings on communication, courtroom preparation, and ethical conduct.
            </p>
          </div>

          <div className="lex-motto-card">
            <span className="lex-motto-tag">CHOOSE</span>
            <h3 className="lex-motto-title">Confident Legal Selection</h3>
            <p className="lex-motto-desc">
              With objective ELO performance ratings, win/loss stats, and clear consultation terms, citizens and businesses choose the ideal legal counsel with complete confidence.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Platform by the Numbers ──────────────────────────────────── */}
      <section className="lex-numbers-strip">
        <div className="lex-numbers-container">
          <h2 className="lex-numbers-heading">LEX-RATING in Numbers</h2>
          <p className="lex-numbers-sub">
            Transforming Ethiopia's legal landscape into an accessible, data-driven, and trustworthy ecosystem.
          </p>

          <div className="lex-numbers-grid">
            <div className="lex-number-item">
              <span className="lex-number-val">100%</span>
              <h4 className="lex-number-title">MoJ Licensed Verification</h4>
              <p className="lex-number-desc">Zero unverified listings. Every advocate authenticated via Ministry of Justice registries.</p>
            </div>
            <div className="lex-number-item">
              <span className="lex-number-val">2,500+</span>
              <h4 className="lex-number-title">Court Decisions Tracked</h4>
              <p className="lex-number-desc">Federal Supreme, High Court, and Regional bench rulings aggregated for performance scoring.</p>
            </div>
            <div className="lex-number-item">
              <span className="lex-number-val">11</span>
              <h4 className="lex-number-title">Regional Jurisdictions</h4>
              <p className="lex-number-desc">Connecting citizens in Addis Ababa, Hawassa, Bahir Dar, Dire Dawa, Mekelle, and beyond.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Four Pillars of the Platform ────────────────────────────── */}
      <section className="lex-section">
        <div className="lex-section-header-center">
          <h2 className="lex-section-center-title">How LEX-RATING Serves You</h2>
          <p className="lex-section-center-sub">Four dedicated tools bringing clarity and confidence to legal assistance</p>
        </div>

        <div className="lex-pillars-grid">
          {/* Pillar 1 */}
          <div className="lex-pillar-card">
            <span className="lex-pillar-badge">01 • Directory</span>
            <h3 className="lex-pillar-title">Advocate Directory</h3>
            <p className="lex-pillar-desc">
              Easily filter by city, language, and legal specialization. Review comprehensive profiles with admissions, office addresses, fees, and verified credentials.
            </p>
            <div className="lex-pillar-split">
              <div className="lex-pillar-for">
                <strong>For Litigants:</strong> Discover top counsel matched to your exact case requirements.
              </div>
              <div className="lex-pillar-for">
                <strong>For Advocates:</strong> Showcase validated credentials and expand your client base.
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="lex-pillar-card">
            <span className="lex-pillar-badge">02 • Rating System</span>
            <h3 className="lex-pillar-title">The ELO Experience Rating</h3>
            <p className="lex-pillar-desc">
              An algorithmic rating (1000–1400+ ELO) that dynamically evaluates win/loss litigation outcomes, case complexity, and active courtroom advocacy.
            </p>
            <div className="lex-pillar-split">
              <div className="lex-pillar-for">
                <strong>For Litigants:</strong> An instant, objective benchmark of demonstrated courtroom success.
              </div>
              <div className="lex-pillar-for">
                <strong>For Advocates:</strong> A merit-based accolade that highlights superior trial excellence.
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="lex-pillar-card">
            <span className="lex-pillar-badge">03 • Verified Reviews</span>
            <h3 className="lex-pillar-title">Client & Peer Reviews</h3>
            <p className="lex-pillar-desc">
              Genuine feedback from litigants who have engaged with the advocate for consultations or court representation, verified to prevent tampering.
            </p>
            <div className="lex-pillar-split">
              <div className="lex-pillar-for">
                <strong>For Litigants:</strong> Authentic, firsthand insights into responsiveness and professionalism.
              </div>
              <div className="lex-pillar-for">
                <strong>For Advocates:</strong> Build a long-term reputation backed by real client satisfaction.
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="lex-pillar-card">
            <span className="lex-pillar-badge">04 • Community Q&A</span>
            <h3 className="lex-pillar-title">Free Legal Q&A Forum</h3>
            <p className="lex-pillar-desc">
              Ask legal questions anonymously and receive expert guidance directly from licensed Ethiopian advocates specializing in relevant proclamations.
            </p>
            <div className="lex-pillar-split">
              <div className="lex-pillar-for">
                <strong>For Litigants:</strong> Fast, free preliminary answers to pressing legal issues.
              </div>
              <div className="lex-pillar-for">
                <strong>For Advocates:</strong> Demonstrate domain mastery and earn Community Leaderboard awards.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How the Rating Works Deep Dive ──────────────────────────── */}
      <section className="lex-section">
        <div className="lex-about-card-box">
          <h2 className="lex-section-title" style={{ fontSize: '2.4rem', marginBottom: '1.4rem' }}>How the Lawyer Experience (LEX) Rating Works</h2>
          <p className="lex-about-lead-text">
            The LEX Rating is calculated by an automated, data-driven algorithm developed in coordination with judicial procedures. It synthesizes two primary inputs: official court litigation logs (case outcomes, appeals, and court bench levels) and Ministry of Justice registry records.
          </p>
          <p className="lex-about-lead-text">
            Every advocate is evaluated under standardized criteria—courtroom victories, case complexity, specialization mastery, disciplinary record, and client ratings. As new court rulings are handed down, the ELO score updates automatically in real-time.
          </p>
          <div className="lex-privacy-notice-box" style={{ marginTop: '2rem' }}>
            <span style={{ fontSize: '1.6rem' }}>⚖️</span>
            <div>
              <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.2rem' }}>The rating cannot be bought or manipulated:</strong>
              <span style={{ color: '#475569' }}>No sponsored tier, ad spend, or manual override can modify an advocate's ELO score or verified court record.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────── */}
      <section className="lex-section">
        <div className="lex-section-header-center">
          <h2 className="lex-section-center-title">Voices from Our Community</h2>
          <p className="lex-section-center-sub">From senior advocates building verified reputations to litigants finding justice</p>
        </div>

        <div className="lex-testimonials-grid">
          <div className="lex-testimonial-card">
            <span className="lex-pill">Advocate</span>
            <p className="lex-testimonial-quote">“LEX-RATING provides genuine meritocracy. Our firm's high-stakes litigation wins are accurately reflected, attracting top commercial clients.”</p>
            <div className="lex-testimonial-author">— Kebede Haile Mariam, Federal Supreme Court Advocate</div>
          </div>

          <div className="lex-testimonial-card">
            <span className="lex-pill">Litigant</span>
            <p className="lex-testimonial-quote">“I needed an expert in municipal land lease disputes in Hawassa. Finding Dawit's verified MoJ profile and courtroom track record gave me complete peace of mind.”</p>
            <div className="lex-testimonial-author">— Meseret A., Business Owner</div>
          </div>

          <div className="lex-testimonial-card">
            <span className="lex-pill">Advocate</span>
            <p className="lex-testimonial-quote">“Answering questions on the legal Q&A forum allows us to give back to the community while demonstrating our specialized expertise in Ethiopian commercial law.”</p>
            <div className="lex-testimonial-author">— Tigist Alemu Bekele, Corporate Law Specialist</div>
          </div>

          <div className="lex-testimonial-card">
            <span className="lex-pill">Litigant</span>
            <p className="lex-testimonial-quote">“The free legal Q&A gave me clear constitutional answers within hours. I then retained a verified advocate directly through the directory.”</p>
            <div className="lex-testimonial-author">— Dawit T., Litigant</div>
          </div>
        </div>
      </section>

      {/* ─── Browse Locations & Practice Areas ──────────────────────── */}
      <section className="lex-section" style={{ marginBottom: '4rem' }}>
        <div className="lex-about-card-box">
          <h3 className="lex-section-title" style={{ marginBottom: '1.6rem' }}>Popular Regional Locations</h3>
          <div className="lex-filter-chips-wrap" style={{ marginBottom: '2.4rem' }}>
            {ETHIOPIAN_CITIES.map(c => (
              <button
                key={c}
                type="button"
                className="lex-chip"
                onClick={() => {
                  if (onSearch) onSearch('', c);
                  onNavigate('directory');
                }}
              >
                {c} Advocates
              </button>
            ))}
          </div>

          <h3 className="lex-section-title" style={{ marginBottom: '1.6rem' }}>Practice Areas & Specializations</h3>
          <div className="lex-filter-chips-wrap">
            {[
              'Criminal Defense', 'Corporate & Commercial', 'Family & Inheritance', 'Civil Litigation',
              'Labor & Employment', 'Land & Property Rights', 'Taxation & Customs', 'Constitutional Law'
            ].map(p => (
              <button
                key={p}
                type="button"
                className="lex-chip"
                onClick={() => {
                  const sp = p.split(' ')[0];
                  if (onSearch) onSearch(sp, '');
                  onNavigate('directory');
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
