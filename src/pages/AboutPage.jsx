import React from 'react';
import { ETHIOPIAN_CITIES } from '../data/constants';

export default function AboutPage({ onNavigate, onSearch, onOpenAuth }) {
  return (
    <div>
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-logo-box">
          <img 
            src="/images/lex-logo.png" 
            alt="LEX - Lawyer Rating" 
            className="about-hero-logo-img" 
          />
          <div className="about-hero-logo-motto">
            <span>TRUST</span>
            <span className="dot">•</span>
            <span>REVIEW</span>
            <span className="dot">•</span>
            <span>CHOOSE</span>
          </div>
        </div>

        <div className="avvo-hero-tag">ABOUT LEX-RATING · ETHIOPIA'S OFFICIAL B2G LEGAL DIRECTORY</div>
        <h1>Demystifying Legal Practice Through Verified Lawyer Experience.</h1>
        <p>
          <strong>LEX-RATING</strong> is Ethiopia's authoritative Business-to-Government (B2G) legal rating platform. We provide complete transparency for citizens, enterprises, and public institutions to evaluate, compare, and retain Ministry of Justice verified advocates based on real courtroom performance, litigation track records, and authentic client reviews.
        </p>

        <div className="about-hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('directory')}>
            Find a Verified Advocate &rarr;
          </button>
          <button
            className="btn btn-lg"
            style={{
              background: '#ffffff',
              color: '#090c10',
              borderColor: '#ffffff',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
            }}
            onClick={() => onNavigate('qa')}
          >
            Ask a Free Legal Question
          </button>
        </div>
      </section>

      {/* ─── Meaning of LEX Section ────────────────────────────────────── */}
      <section className="about-lex-meaning-section">
        <div className="container" style={{ maxWidth: 960 }}>
          <div className="about-lex-meaning-box">
            <div className="about-lex-callout-title">
              <span>What Does</span>
              <span className="about-lex-highlight-tag">LEX</span>
              <span>Mean?</span>
            </div>
            
            <p className="about-lex-meaning-text">
              At its core, <strong>LEX stands for Lawyer EXperience</strong> (while also drawing heritage from the classical Latin root <em>lex</em>, meaning <em>Law and Justice</em>). 
            </p>
            <p className="about-lex-meaning-text">
              In traditional legal markets, choosing an attorney has often relied on hearsay, non-transparent claims, or marketing. <strong>LEX-RATING was established to redefine "Lawyer Experience" into a verifiable, merit-based standard.</strong> To us, experience is not just how many years have passed on a diploma—it is measured by an advocate's real-world courtroom history, validated Ministry of Justice credentials, case win/loss ratios across regional and federal benches, and their active contribution to community justice.
            </p>

            <div className="about-lex-dims-grid">
              <div className="about-lex-dim-card">
                <div className="about-lex-dim-title">1. Courtroom Record</div>
                <div className="about-lex-dim-desc">
                  Real litigation analytics tracking verdicts, rulings, and settlement outcomes before the Federal Supreme Court, High Courts, and Regional circuits.
                </div>
              </div>

              <div className="about-lex-dim-card">
                <div className="about-lex-dim-title">2. Official MoJ Verification</div>
                <div className="about-lex-dim-desc">
                  Every listed advocate holds an authenticated, active Ministry of Justice license (<code style={{ color: 'var(--gold)' }}>LAW-XXXX</code>), cross-checked against federal disciplinary registries.
                </div>
              </div>

              <div className="about-lex-dim-card">
                <div className="about-lex-dim-title">3. Domain Specialization</div>
                <div className="about-lex-dim-desc">
                  Deep practice-area classification spanning Criminal Defense, Corporate M&amp;A, Land &amp; Property Expropriation, Commercial Arbitration, and Family Law.
                </div>
              </div>

              <div className="about-lex-dim-card">
                <div className="about-lex-dim-title">4. Civic &amp; Pro Bono Impact</div>
                <div className="about-lex-dim-desc">
                  Active engagement answering citizens' legal dilemmas in the public Q&amp;A forum and undertaking verified pro bono representations.
                </div>
              </div>
            </div>
          </div>

          {/* ─── The 3 Motto Tenets ──────────────────────────────────────── */}
          <h2 className="avvo-section-title" style={{ textAlign: 'center', marginTop: '4rem' }}>
            Our Core Operating Tenets
          </h2>
          <p className="avvo-section-sub" style={{ textAlign: 'center' }}>
            The three guiding principles that govern every profile and rating on the LEX platform.
          </p>

          <div className="about-motto-grid">
            <div className="about-motto-card">
              <div className="about-motto-tag">TRUST</div>
              <div className="about-motto-title">Government-Backed Integrity</div>
              <p className="about-motto-desc">
                Every lawyer profile is linked directly to the Ethiopian Ministry of Justice license database. Unlicensed or suspended individuals cannot register or represent themselves on the platform.
              </p>
            </div>

            <div className="about-motto-card">
              <div className="about-motto-tag">REVIEW</div>
              <div className="about-motto-title">Authentic Litigant Feedback</div>
              <p className="about-motto-desc">
                Real clients who have retained an advocate share transparent reviews and ratings on communication, courtroom preparation, and ethical conduct.
              </p>
            </div>

            <div className="about-motto-card">
              <div className="about-motto-tag">CHOOSE</div>
              <div className="about-motto-title">Confident Legal Selection</div>
              <p className="about-motto-desc">
                With objective ELO performance ratings, win/loss stats, and clear consultation terms, citizens and businesses choose the ideal legal counsel with complete confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platform by the Numbers ──────────────────────────────────── */}
      <section className="about-numbers-strip">
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.6rem' }}>
            LEX-RATING in Numbers
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '1.5rem', marginBottom: '3.2rem' }}>
            Transforming Ethiopia's legal landscape into an accessible, data-driven, and trustworthy ecosystem.
          </p>
          <div className="about-numbers-grid">
            <div>
              <span className="about-number-val">100%</span>
              <div className="about-number-title">MoJ Licensed Verification</div>
              <p className="about-number-desc">Zero unverified listings. Every advocate authenticated via Ministry of Justice registries.</p>
            </div>
            <div>
              <span className="about-number-val">2,500+</span>
              <div className="about-number-title">Court Decisions Tracked</div>
              <p className="about-number-desc">Federal Supreme, High Court, and Regional bench rulings aggregated for performance scoring.</p>
            </div>
            <div>
              <span className="about-number-val">11</span>
              <div className="about-number-title">Regional Jurisdictions</div>
              <p className="about-number-desc">Connecting citizens in Addis Ababa, Hawassa, Bahir Dar, Dire Dawa, Mekelle, and beyond.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Four Pillars of the Platform ────────────────────────────── */}
      <section className="avvo-section avvo-section-white">
        <div className="container">
          <h2 className="avvo-section-title" style={{ textAlign: 'center' }}>How LEX-RATING Serves You</h2>
          <p className="avvo-section-sub" style={{ textAlign: 'center' }}>Four dedicated tools bringing clarity and confidence to legal assistance</p>

          <div className="about-pillars-grid">
            {/* Pillar 1 */}
            <div className="pillar-card">
              <div className="pillar-badge">01 · Directory</div>
              <div className="pillar-title">Advocate Directory</div>
              <p className="pillar-desc">
                Easily filter by city, language, and legal specialization. Review comprehensive profiles with admissions, office addresses, fees, and verified credentials.
              </p>
              <div className="pillar-split">
                <div className="pillar-for">
                  <strong>For Litigants</strong> Discover top counsel matched to your exact case requirements.
                </div>
                <div className="pillar-for">
                  <strong>For Advocates</strong> Showcase validated credentials and expand your client base.
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="pillar-card">
              <div className="pillar-badge">02 · Rating System</div>
              <div className="pillar-title">The ELO Experience Rating</div>
              <p className="pillar-desc">
                An algorithmic rating (1000–1400+ ELO) that dynamically evaluates win/loss litigation outcomes, case complexity, and active courtroom advocacy.
              </p>
              <div className="pillar-split">
                <div className="pillar-for">
                  <strong>For Litigants</strong> An instant, objective benchmark of demonstrated courtroom success.
                </div>
                <div className="pillar-for">
                  <strong>For Advocates</strong> A merit-based accolade that highlights superior trial excellence.
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="pillar-card">
              <div className="pillar-badge">03 · Verified Reviews</div>
              <div className="pillar-title">Client &amp; Peer Reviews</div>
              <p className="pillar-desc">
                Genuine feedback from litigants who have engaged with the advocate for consultations or court representation, verified to prevent tampering.
              </p>
              <div className="pillar-split">
                <div className="pillar-for">
                  <strong>For Litigants</strong> Authentic, firsthand insights into responsiveness and professionalism.
                </div>
                <div className="pillar-for">
                  <strong>For Advocates</strong> Build a long-term reputation backed by real client satisfaction.
                </div>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="pillar-card">
              <div className="pillar-badge">04 · Community Q&A</div>
              <div className="pillar-title">Free Legal Q&amp;A Forum</div>
              <p className="pillar-desc">
                Ask legal questions anonymously and receive expert guidance directly from licensed Ethiopian advocates specializing in relevant proclamations.
              </p>
              <div className="pillar-split">
                <div className="pillar-for">
                  <strong>For Litigants</strong> Fast, free preliminary answers to pressing legal issues.
                </div>
                <div className="pillar-for">
                  <strong>For Advocates</strong> Demonstrate domain mastery and earn Community Leaderboard awards.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How the Rating Works Deep Dive ──────────────────────────── */}
      <div className="about-rating-deepdive">
        <div className="container" style={{ maxWidth: 860 }}>
          <h2>How the Lawyer Experience (LEX) Rating Works</h2>
          <p>
            The LEX Rating is calculated by an automated, data-driven algorithm developed in coordination with judicial procedures. It synthesizes two primary inputs: official court litigation logs (case outcomes, appeals, and court bench levels) and Ministry of Justice registry records.
          </p>
          <p>
            Every advocate is evaluated under standardized criteria—courtroom victories, case complexity, specialization mastery, disciplinary record, and client ratings. As new court rulings are handed down, the ELO score updates automatically in real-time.
          </p>
          <div className="about-rating-highlight">
            <strong>The rating cannot be bought or manipulated:</strong> No sponsored tier, ad spend, or manual override can modify an advocate's ELO score or verified court record.
          </div>
        </div>
      </div>

      {/* ─── Testimonials ────────────────────────────────────────────── */}
      <section className="avvo-section avvo-section-white">
        <div className="container">
          <h2 className="avvo-section-title" style={{ textAlign: 'center' }}>Voices from Our Community</h2>
          <p className="avvo-section-sub" style={{ textAlign: 'center' }}>From senior advocates building verified reputations to litigants finding justice</p>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div>
                <span className="testimonial-role attorney">Advocate</span>
                <p className="testimonial-quote">“LEX-RATING provides genuine meritocracy. Our firm's high-stakes litigation wins are accurately reflected, attracting top commercial clients.”</p>
              </div>
              <div className="testimonial-author">— Kebede Haile Mariam, Federal Supreme Court Advocate</div>
            </div>

            <div className="testimonial-card">
              <div>
                <span className="testimonial-role consumer">Litigant</span>
                <p className="testimonial-quote">“I needed an expert in municipal land lease disputes in Hawassa. Finding Dawit's verified MoJ profile and courtroom track record gave me complete peace of mind.”</p>
              </div>
              <div className="testimonial-author">— Meseret A., Business Owner</div>
            </div>

            <div className="testimonial-card">
              <div>
                <span className="testimonial-role attorney">Advocate</span>
                <p className="testimonial-quote">“Answering questions on the legal Q&amp;A forum allows us to give back to the community while demonstrating our specialized expertise in Ethiopian commercial law.”</p>
              </div>
              <div className="testimonial-author">— Tigist Alemu Bekele, Corporate Law Specialist</div>
            </div>

            <div className="testimonial-card">
              <div>
                <span className="testimonial-role consumer">Litigant</span>
                <p className="testimonial-quote">“The free legal Q&amp;A gave me clear constitutional answers within hours. I then retained a verified advocate directly through the directory.”</p>
              </div>
              <div className="testimonial-author">— Dawit T., Litigant</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Action Links & Resources ────────────────────────────────── */}
      <section className="about-links-section">
        <div className="about-links-grid">
          <div className="about-link-group">
            <h3>For Citizens &amp; Litigants</h3>
            <ul>
              <li><a href="#directory" onClick={(e) => { e.preventDefault(); onNavigate('directory'); }}>Find a Verified Advocate</a></li>
              <li><a href="#qa" onClick={(e) => { e.preventDefault(); onNavigate('qa'); }}>Ask a Free Legal Question</a></li>
              <li><a href="#guides" onClick={(e) => { e.preventDefault(); onNavigate('guides'); }}>Browse Federal Legal Guides</a></li>
              <li><a href="#directory" onClick={(e) => { e.preventDefault(); onNavigate('directory'); }}>Search Advocates by City</a></li>
            </ul>
          </div>

          <div className="about-link-group">
            <h3>For Licensed Advocates</h3>
            <ul>
              <li><a href="#auth" onClick={(e) => { e.preventDefault(); onOpenAuth(); }}>Claim or Register Profile</a></li>
              <li><a href="#auth" onClick={(e) => { e.preventDefault(); onOpenAuth(); }}>MoJ License Verification</a></li>
              <li><a href="#qa" onClick={(e) => { e.preventDefault(); onNavigate('qa'); }}>Answer Legal Questions</a></li>
              <li><a href="#directory" onClick={(e) => { e.preventDefault(); onNavigate('directory'); }}>View Leaderboard Rankings</a></li>
            </ul>
          </div>

          <div className="about-link-group">
            <h3>Platform &amp; Legal Framework</h3>
            <ul>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About LEX-RATING &amp; Lawyer Experience</a></li>
              <li><a href="#guides" onClick={(e) => { e.preventDefault(); onNavigate('guides'); }}>Federal Proclamations &amp; Civil Code</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>How the ELO Algorithm Works</a></li>
              <li><a href="#support" onClick={(e) => { e.preventDefault(); alert('Support portal: support@lexrating.et'); }}>MoJ Verification Support</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Browse Locations & Practice Areas ──────────────────────── */}
      <section className="about-browse-strip">
        <div className="about-browse-container">
          <div className="about-browse-block">
            <h4>Popular Regional Locations</h4>
            <div className="about-browse-tags">
              {ETHIOPIAN_CITIES.map(c => (
                <span
                  key={c}
                  className="about-browse-tag"
                  onClick={() => {
                    if (onSearch) onSearch('', c);
                    onNavigate('directory');
                  }}
                >
                  {c} Advocates
                </span>
              ))}
            </div>
          </div>

          <div className="about-browse-block">
            <h4>Practice Areas &amp; Specializations</h4>
            <div className="about-browse-tags">
              {[
                'Criminal Defense', 'Corporate & Commercial', 'Family & Inheritance', 'Civil Litigation',
                'Labor & Employment', 'Land & Property Rights', 'Taxation & Customs', 'Constitutional Law'
              ].map(p => (
                <span
                  key={p}
                  className="about-browse-tag"
                  onClick={() => {
                    const sp = p.split(' ')[0];
                    if (onSearch) onSearch(sp, '');
                    onNavigate('directory');
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
