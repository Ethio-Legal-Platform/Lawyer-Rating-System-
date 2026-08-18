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
    <section className="avvo-section avvo-section-gray" style={{ minHeight: '60vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.6rem', marginBottom: '2rem' }}>
          <div>
            <h1 className="avvo-section-title" style={{ marginBottom: '0.4rem' }}>Legal Q&A & Consultations</h1>
            <p className="avvo-section-sub" style={{ marginBottom: 0 }}>
              Ask questions publicly or privately to nearby Ethiopian advocates.
            </p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              if (!user) onOpenAuth();
              else onOpenAskModal();
            }}
          >
            Ask a Legal Question +
          </button>
        </div>

        {/* Q&A Tab Switcher: Public Forum vs My Private Inquiries */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)', marginBottom: '2.4rem' }}>
          <button
            className={`btn btn-sm ${qaTab === 'public' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', padding: '1rem 2rem', fontSize: '1.4rem', fontWeight: 700 }}
            onClick={() => onSetQaTab('public')}
          >
            Public Q&A Forum
          </button>
          <button
            className={`btn btn-sm ${qaTab === 'private' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', padding: '1rem 2rem', fontSize: '1.4rem', fontWeight: 700 }}
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
            {/* Q&A Search & Category Filter Bar */}
            <div className="dir-search-wrap" style={{ marginBottom: '2.4rem' }}>
              <div className="dir-search-row">
                <div className="dir-search-field" style={{ flex: 3 }}>
                  <input
                    type="text"
                    placeholder="Search legal questions, terms, or topics (e.g. bail, divorce, lease, employment)…"
                    value={qaSearchTerm}
                    onChange={e => onSetQaSearchTerm(e.target.value)}
                  />
                </div>
                {qaSearchTerm && (
                  <button className="btn btn-ghost btn-sm" onClick={() => onSetQaSearchTerm('')}>Clear</button>
                )}
              </div>

              <div className="filter-chips">
                {['All', 'Criminal', 'Family', 'Corporate', 'Civil', 'Labour', 'Immigration', 'Land'].map(cat => (
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

            {/* Questions Grid */}
            {loadingQuestions ? (
              <div className="loading-state">
                Loading questions <span className="loading-dots"><span/><span/><span/></span>
              </div>
            ) : questions.length > 0 ? (
              <div className="qa-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {questions.map(q => {
                  const hasLawyer = (q.answers || []).some(a => a.isLawyer);
                  return (
                    <div
                      key={q.id}
                      className="qa-card"
                      onClick={() => onSelectQuestion(q.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') onSelectQuestion(q.id); }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '0.6rem' }}>
                        <span className="qa-tag">{q.category} Law</span>
                        {hasLawyer ? (
                          <span style={{ fontSize: '1.15rem', color: '#c2410c', background: '#fff4f0', border: '1px solid #ffd0b0', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 700 }}>
                            Advocate Verified
                          </span>
                        ) : (
                          <span style={{ fontSize: '1.15rem', color: '#555', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: 99 }}>
                            Community
                          </span>
                        )}
                      </div>
                      <p className="qa-question">{q.title}</p>
                      <p style={{ fontSize: '1.35rem', color: 'var(--gray-700)', lineHeight: 1.45, marginBottom: '1.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {q.description}
                      </p>
                      <div className="qa-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                        <span className="qa-answers">{(q.answers || []).length} responses</span>
                        <span>Location: {q.city || 'Ethiopia'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-title">No questions found</p>
                <p className="empty-sub">Be the first to ask a legal question in this category or search term.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!user) onOpenAuth();
                    else onOpenAskModal();
                  }}
                >
                  Ask a Free Question
                </button>
              </div>
            )}
          </>
        )}

        {qaTab === 'private' && (
          <div>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '1.6rem 2rem', marginBottom: '2rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0369a1', marginBottom: '0.4rem' }}>
                Private Inquiries & Consultations
              </div>
              <div style={{ fontSize: '1.35rem', color: '#0284c7', lineHeight: 1.5 }}>
                {user?.role === 'lawyer'
                  ? `Incoming private inquiries from citizens in ${user.city || 'Ethiopia'} seeking legal consultation. You can provide verified private guidance.`
                  : 'Your private inquiries sent to nearby advocates. Review their verified answers and click "Publish to Public Forum" inside any thread to share with the community whenever you wish!'}
              </div>
            </div>

            {loadingInquiries ? (
              <div className="loading-state">
                Loading your inquiries <span className="loading-dots"><span/><span/><span/></span>
              </div>
            ) : privateInquiries.length > 0 ? (
              <div className="qa-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {privateInquiries.map(q => {
                  const hasLawyer = (q.answers || []).some(a => a.isLawyer);
                  return (
                    <div
                      key={q.id}
                      className="qa-card"
                      onClick={() => onSelectQuestion(q.id)}
                      style={{ borderLeft: '4px solid #0284c7' }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') onSelectQuestion(q.id); }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '0.6rem' }}>
                        <span className="qa-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>{q.category} Law</span>
                        {hasLawyer ? (
                          <span style={{ fontSize: '1.15rem', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 700 }}>
                            Advocate Responded
                          </span>
                        ) : (
                          <span style={{ fontSize: '1.15rem', color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 600 }}>
                            Pending Response
                          </span>
                        )}
                      </div>
                      <p className="qa-question">{q.title}</p>
                      <p style={{ fontSize: '1.35rem', color: 'var(--gray-700)', lineHeight: 1.45, marginBottom: '1.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {q.description}
                      </p>
                      <div className="qa-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                        <span className="qa-answers">{(q.answers || []).length} responses</span>
                        <span style={{ color: '#0284c7', fontWeight: 600 }}>Click to Review & Publish &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-title">No private inquiries found</p>
                <p className="empty-sub">
                  {user?.role === 'lawyer'
                    ? 'No private inquiries currently pending for your practice area in your city.'
                    : 'You have not submitted any private inquiries. Start a private consultation with a nearby advocate!'}
                </p>
                <button className="btn btn-primary" onClick={onOpenAskModal}>
                  Send a Private Legal Inquiry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
