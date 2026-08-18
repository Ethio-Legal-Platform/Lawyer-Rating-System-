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
    <div className="qa-page-wrap">
      <div className="container">
        {/* Page Header */}
        <div className="qa-page-header">
          <div>
            <span className="xtra-section-tag">Public & Private Legal Forum</span>
            <h1 className="qa-page-title">Legal Q&A & Consultations</h1>
            <p className="qa-page-sub">
              Ask legal questions publicly or submit private inquiries to nearby Ministry of Justice-verified advocates.
            </p>
          </div>
          <button
            className="btn btn-gold btn-lg"
            onClick={() => {
              if (!user) onOpenAuth();
              else onOpenAskModal();
            }}
          >
            Ask a Legal Question +
          </button>
        </div>

        {/* Q&A Tab Switcher: Public Forum vs My Private Inquiries */}
        <div className="qa-tab-bar">
          <button
            className={`qa-tab-btn${qaTab === 'public' ? ' active' : ''}`}
            onClick={() => onSetQaTab('public')}
          >
            Public Q&A Forum
          </button>
          <button
            className={`qa-tab-btn${qaTab === 'private' ? ' active' : ''}`}
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
            <div className="dir-search-wrap">
              <div className="dir-search-row">
                <div className="dir-search-field" style={{ flex: 3 }}>
                  <input
                    type="text"
                    placeholder="Search questions by topic, statute, or legal keyword (e.g. bail, divorce, land lease, salary)…"
                    value={qaSearchTerm}
                    onChange={e => onSetQaSearchTerm(e.target.value)}
                  />
                </div>
                {qaSearchTerm && (
                  <button className="btn btn-ghost btn-sm" onClick={() => onSetQaSearchTerm('')}>Clear</button>
                )}
              </div>

              <div className="filter-chips">
                {['All', 'Criminal', 'Family', 'Corporate', 'Civil', 'Labour', 'Land', 'Tax', 'Banking', 'Immigration'].map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip${qaCatFilter === cat ? ' active' : ''}`}
                    onClick={() => onSetQaCatFilter(cat)}
                  >
                    {cat} {cat !== 'All' ? 'Law' : 'Questions'}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {loadingQuestions ? (
              <div className="loading-state">
                <div className="loading-dots"><span/><span/><span/></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading legal questions…</p>
              </div>
            ) : questions.length > 0 ? (
              <div className="qa-cards-list">
                {questions.map(q => {
                  const lawyerAns = (q.answers || []).find(a => a.isLawyer);
                  return (
                    <div
                      key={q.id}
                      className="qa-post-card"
                      onClick={() => onSelectQuestion(q.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') onSelectQuestion(q.id); }}
                    >
                      <div className="qa-post-header">
                        <span className="qa-tag gold">{q.category} Law</span>
                        {lawyerAns ? (
                          <span className="qa-badge-verified">
                            Advocate Response Available
                          </span>
                        ) : (
                          <span className="qa-badge-community">
                            Open Discussion
                          </span>
                        )}
                      </div>

                      <h3 className="qa-post-title">{q.title}</h3>
                      <p className="qa-post-desc">{q.description}</p>

                      {/* Advocate Response Preview Box */}
                      {lawyerAns && (
                        <div className="qa-card-response-preview">
                          <div className="qa-preview-header">
                            <span className="qa-preview-badge">Verified Advocate Response</span>
                            <span className="qa-preview-author">
                              <strong>{lawyerAns.authorName}</strong> {lawyerAns.authorUsername ? `(@${lawyerAns.authorUsername})` : ''}
                              {lawyerAns.elo ? ` · ELO ${lawyerAns.elo}` : ''}
                              {lawyerAns.specialization ? ` · ${lawyerAns.specialization} Law` : ''}
                            </span>
                          </div>
                          <p className="qa-preview-text">
                            “{lawyerAns.content}”
                          </p>
                        </div>
                      )}

                      <div className="qa-post-footer">
                        <span className="qa-responses-count">
                          <strong>{(q.answers || []).length}</strong> {(q.answers || []).length === 1 ? 'response' : 'responses'}
                        </span>
                        <span className="qa-post-meta">
                          Location: {q.city || 'Ethiopia'} · {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                        <span className="qa-post-action">View Full Legal Analysis &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-title">No questions found</p>
                <p className="empty-sub">Be the first to ask a question in this practice area or search query.</p>
                <button
                  className="btn btn-gold"
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
              <div className="loading-state">
                <div className="loading-dots"><span/><span/><span/></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading private inquiries…</p>
              </div>
            ) : privateInquiries.length > 0 ? (
              <div className="qa-cards-list">
                {privateInquiries.map(q => (
                  <div
                    key={q.id}
                    className="qa-post-card private-card"
                    onClick={() => onSelectQuestion(q.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="qa-post-header">
                      <span className="qa-tag gold">{q.category} Law</span>
                      <span className="qa-pill-private">Private Consultation</span>
                    </div>
                    <h3 className="qa-post-title">{q.title}</h3>
                    <p className="qa-post-desc">{q.description}</p>
                    <div className="qa-post-footer">
                      <span className="qa-responses-count">
                        <strong>{(q.answers || []).length}</strong> Advocate Responses
                      </span>
                      <span>Target: {q.targetLawyerName || 'Nearby Advocates'}</span>
                      <span className="qa-post-action">Open Consultation &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-title">No private inquiries</p>
                <p className="empty-sub">Send a direct confidential inquiry to any advocate from their profile.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
