import React, { useState, useEffect } from 'react';
import LawyerCard from '../features/directory/LawyerCard';
import { ETHIOPIAN_CITIES, SPECIALIZATION_LIST } from '../data/constants';

export default function DirectoryPage({
  lawyers = [],
  loading = false,
  searchSpec = '',
  searchCity = '',
  onSearch,
  onSelectLawyer
}) {
  const [specInput, setSpecInput] = useState(searchSpec);
  const [cityInput, setCityInput] = useState(searchCity);

  useEffect(() => {
    setSpecInput(searchSpec);
  }, [searchSpec]);

  useEffect(() => {
    setCityInput(searchCity);
  }, [searchCity]);

  const hasFilter = Boolean(searchSpec || searchCity || specInput || cityInput);

  const clearFilters = () => {
    setSpecInput('');
    setCityInput('');
    if (onSearch) onSearch('', '');
  };

  const handleSpecChip = (spec) => {
    const next = searchSpec === spec ? '' : spec;
    setSpecInput(next);
    if (onSearch) onSearch(next, searchCity);
  };

  const handleCityChip = (city) => {
    const next = searchCity === city ? '' : city;
    setCityInput(next);
    if (onSearch) onSearch(searchSpec, next);
  };

  return (
    <div className="lex-directory-page">
      <div className="lex-directory-container">
        {/* Sidebar Filters */}
        <aside className="lex-dir-sidebar">
          <h3 className="lex-sidebar-title">Practice Area</h3>
          <ul className="lex-sidebar-list">
            <li
              className={`lex-sidebar-item${!searchSpec ? ' active' : ''}`}
              onClick={() => {
                setSpecInput('');
                if (onSearch) onSearch('', searchCity);
              }}
            >
              All Practice Areas
            </li>
            {SPECIALIZATION_LIST.map(spec => (
              <li
                key={spec}
                className={`lex-sidebar-item${searchSpec === spec ? ' active' : ''}`}
                onClick={() => {
                  setSpecInput(spec);
                  if (onSearch) onSearch(spec, searchCity);
                }}
              >
                {spec} Law
              </li>
            ))}
          </ul>

          <h3 className="lex-sidebar-title" style={{ marginTop: '2.4rem' }}>City / Location</h3>
          <div className="lex-sidebar-radio-group">
            {['', ...ETHIOPIAN_CITIES].map(city => (
              <label
                key={city}
                className={`lex-sidebar-radio-label${searchCity === city ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="city"
                  checked={searchCity === city}
                  onChange={() => {
                    setCityInput(city);
                    if (onSearch) onSearch(searchSpec, city);
                  }}
                  className="lex-radio-input"
                />
                {city || 'All Cities'}
              </label>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lex-dir-main">
          {/* Search Inputs */}
          <div className="lex-dir-search-card">
            <div className="lex-dir-search-row">
              <div className="lex-dir-search-field">
                <label className="lex-search-label">Advocate / Practice Area</label>
                <input
                  type="text"
                  className="lex-search-input"
                  placeholder="Practice area or advocate name…"
                  value={specInput}
                  list="dir-spec-list"
                  onChange={e => {
                    const val = e.target.value;
                    setSpecInput(val);
                    if (onSearch) onSearch(val, cityInput);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && onSearch) onSearch(specInput, cityInput);
                  }}
                />
                <datalist id="dir-spec-list">
                  {SPECIALIZATION_LIST.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="lex-dir-search-field">
                <label className="lex-search-label">Location</label>
                <input
                  type="text"
                  className="lex-search-input"
                  placeholder="City…"
                  value={cityInput}
                  list="dir-city-list"
                  onChange={e => {
                    const val = e.target.value;
                    setCityInput(val);
                    if (onSearch) onSearch(specInput, val);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && onSearch) onSearch(specInput, cityInput);
                  }}
                />
                <datalist id="dir-city-list">
                  {ETHIOPIAN_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              {hasFilter && (
                <button type="button" className="lex-btn-outline-sm-dark" onClick={clearFilters}>
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="lex-filter-chips-wrap">
              {SPECIALIZATION_LIST.map(s => (
                <button
                  key={s}
                  type="button"
                  className={`lex-chip${searchSpec === s ? ' active' : ''}`}
                  onClick={() => handleSpecChip(s)}
                >
                  {s}
                </button>
              ))}
              <span className="lex-chip-divider" />
              {ETHIOPIAN_CITIES.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`lex-chip city${searchCity === c ? ' active' : ''}`}
                  onClick={() => handleCityChip(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Results Bar */}
          <div className="lex-results-bar">
            <p className="lex-results-text">
              <strong>{lawyers.length}</strong> advocates found{searchCity ? ` in ${searchCity}` : ''}{searchSpec ? ` · ${searchSpec}` : ''}
            </p>
            {hasFilter && (
              <button type="button" className="lex-link-btn" onClick={clearFilters}>
                Clear all filters
              </button>
            )}
          </div>

          {/* Advocates Grid */}
          {loading ? (
            <div className="lex-loading-box">
              Loading advocates from database...
            </div>
          ) : lawyers.length > 0 ? (
            <div className="lex-lawyers-list-grid">
              {lawyers.map(lawyer => (
                <LawyerCard
                  key={lawyer.id}
                  lawyer={lawyer}
                  variant="horizontal"
                  onClick={() => onSelectLawyer(lawyer)}
                />
              ))}
            </div>
          ) : (
            <div className="lex-empty-box">
              <h3 className="lex-empty-title">No advocates found</h3>
              <p className="lex-empty-sub">Try broadening your search query or clearing city/practice area filters.</p>
              <button type="button" className="lex-btn-dark-lg" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
