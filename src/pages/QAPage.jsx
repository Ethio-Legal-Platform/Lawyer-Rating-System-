import React from 'react';

export default function QAPage({
  user,
  questions = [],
  privateInquiries = [],
  loadingQuestions = false,
  loadingInquiries = false,
  qaTab = 'public',
  qaCatFilter = 'All',
  qaSearchTerm = '',
  onSetQaTab,
  onSetQaCatFilter,
  onSetQaSearchTerm,
  onSelectQuestion,
  onOpenAskModal,
  onOpenAuth
}) {
  return (
    <div className="lex-qa-page">
      <div className="lex-qa-container">
        {/* Page Header */}
        <div className="lex-qa-header">
          <div>
            <span className="lex-guide-tag">Public & Private Legal Forum</span>
            <h1 className="lex-qa-title">Legal Q&A & Consultations</h1>
            <p className="lex-qa-sub">
              Ask legal questions publicly or submit private inquiries to nearby Ministry of Justice-verified advocates.
            </p>
          </div>
          <button
            type="button"
            className="lex-btn-dark-lg"
            onClick={() => {
              if (!user) onOpenAuth();
              else onOpenAskModal();
            }}
          >
            Ask a Legal Question +
          </button>
        </div>

        {/* Q&A Tab Switcher: Public Forum vs My Private Inquiries */}
        <div className="lex-drawer-tabs" style={{ background: 'transparent', padding: '0', marginBottom: '2.4rem' }}>
          <button
            type="button"
            className={`lex-drawer-tab${qaTab === 'public' ? ' active' : ''}`}
            onClick={() => onSetQaTab('public')}
          >
            Public Q&A Forum
          </button>
          <button
            type="button"
            className={`lex-drawer-tab${qaTab === 'private' ? ' active' : ''}`}
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                onSetQaTab('private');
              }
            }}
          >
            My Private Inquiries {user && privateInquiries.length > 0 ? `(${privateInquiries.length})` : ''}
          </button>
        </div>

        {qaTab === 'public' && (
          <>
            {/* Search & Category Filter Bar */}
            <div className="lex-dir-search-card" style={{ marginBottom: '2.4rem' }}>
              <div className="lex-input-icon-wrap" style={{ marginBottom: '1.6rem' }}>
                <svg className="lex-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="lex-search-input"
                  placeholder="Search questions by topic, statute, or legal keyword (e.g. bail, divorce, land lease, salary)…"
                  value={qaSearchTerm}
                  onChange={e => onSetQaSearchTerm(e.target.value)}
                />
                {qaSearchTerm && (
                  <button type="button" className="lex-search-clear-btn" onClick={() => onSetQaSearchTerm('')}>✕</button>
                )}
              </div>

              <div className="lex-filter-chips-wrap">
                {['All', 'Criminal', 'Family', 'Corporate', 'Civil', 'Labour', 'Land', 'Tax', 'Banking', 'Immigration'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`lex-chip${qaCatFilter === cat ? ' active' : ''}`}
                    onClick={() => onSetQaCatFilter(cat)}
                  >
                    {cat} {cat !== 'All' ? 'Law' : 'Questions'}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {loadingQuestions ? (
              <div className="lex-loading-box">
                Loading legal questions from forum...
              </div>
            ) : questions.length > 0 ? (
              <div className="lex-qa-cards-list">
                {questions.map(q => {
                  const lawyerAns = (q.answers || []).find(a => a.isLawyer);
                  return (
                    <div
                      key={q.id}
                      className="lex-qa-card"
                      onClick={() => onSelectQuestion(q.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelectQuestion(q.id); }}
                    >
                      <div className="lex-qa-card-header">
                        <span className="lex-guide-cat-badge">{q.category} Law</span>
                        {lawyerAns ? (
                          <span className="lex-qa-badge-verified">
                            Advocate Response Available
                          </span>
                        ) : (
                          <span className="lex-qa-badge-open">
                            Open Discussion
                          </span>
                        )}
                      </div>

                      <h3 className="lex-qa-card-title">{q.title}</h3>
                      <p className="lex-qa-card-desc">{q.description}</p>

                      {/* Advocate Response Preview Box */}
                      {lawyerAns && (
                        <div className="lex-info-card" style={{ margin: '1.6rem 0', background: '#F8FAFC' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>Verified Advocate Response</span>
                            <span style={{ fontSize: '1.25rem', color: '#475569' }}>
                              <strong>{lawyerAns.authorName}</strong> {lawyerAns.authorUsername ? `(@${lawyerAns.authorUsername})` : ''}
                              {lawyerAns.elo ? ` · ELO ${lawyerAns.elo}` : ''}
                            </span>
                          </div>
                          <p style={{ fontSize: '1.35rem', color: '#334155', fontStyle: 'italic', margin: 0 }}>
                            “{lawyerAns.content}”
                          </p>
                        </div>
                      )}

                      <div className="lex-qa-card-footer">
                        <span className="lex-qa-footer-count">
                          <strong>{(q.answers || []).length}</strong> {(q.answers || []).length === 1 ? 'response' : 'responses'}
                        </span>
                        <span className="lex-qa-footer-meta">
                          Location: {q.city || 'Ethiopia'} • {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                        <span className="lex-qa-footer-action">View Full Legal Analysis →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="lex-empty-box">
                <h3 className="lex-empty-title">No questions found</h3>
                <p className="lex-empty-sub">Be the first to ask a question in this practice area or search query.</p>
                <button
                  type="button"
                  className="lex-btn-dark-lg"
                  onClick={() => {
                    if (!user) onOpenAuth();
                    else onOpenAskModal();
                  }}
                >
                  Ask a Question Now
                </button>
              </div>
            )}
          </>
        )}

        {qaTab === 'private' && (
          <div>
            {loadingInquiries ? (
              <div className="lex-loading-box">
                Loading private inquiries...
              </div>
            ) : privateInquiries.length > 0 ? (
              <div className="lex-qa-cards-list">
                {privateInquiries.map(q => (
                  <div
                    key={q.id}
                    className="lex-qa-card private"
                    onClick={() => onSelectQuestion(q.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="lex-qa-card-header">
                      <span className="lex-guide-cat-badge">{q.category} Law</span>
                      <span className="lex-qa-badge-private">Private Consultation</span>
                    </div>
                    <h3 className="lex-qa-card-title">{q.title}</h3>
                    <p className="lex-qa-card-desc">{q.description}</p>
                    <div className="lex-qa-card-footer">
                      <span className="lex-qa-footer-count">
                        <strong>{(q.answers || []).length}</strong> Advocate Responses
                      </span>
                      <span>Target: {q.targetLawyerName || 'Nearby Advocates'}</span>
                      <span className="lex-qa-footer-action">Open Consultation →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lex-empty-box">
                <h3 className="lex-empty-title">No private inquiries</h3>
                <p className="lex-empty-sub">Send a direct confidential inquiry to any advocate from their profile.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
