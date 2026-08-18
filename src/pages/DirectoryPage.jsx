import React, { useState, useEffect } from 'react';
import LawyerCard from '../features/directory/LawyerCard';
import { ETHIOPIAN_CITIES } from '../data/constants';

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
    <div className="directory-layout container">
      {/* Sidebar */}
      <aside className="dir-sidebar">
        <h3>Practice Area</h3>
        <ul className="sidebar-spec-list">
          <li
            className={`sidebar-spec-item${!searchSpec ? ' active' : ''}`}
            onClick={() => {
              setSpecInput('');
              if (onSearch) onSearch('', searchCity);
            }}
          >
            All Practice Areas
          </li>
          {[
            { spec: 'Criminal' },
            { spec: 'Corporate' },
            { spec: 'Family' },
            { spec: 'Civil' },
          ].map(item => (
            <li
              key={item.spec}
              className={`sidebar-spec-item${searchSpec === item.spec ? ' active' : ''}`}
              onClick={() => {
                setSpecInput(item.spec);
                if (onSearch) onSearch(item.spec, searchCity);
              }}
            >
              {item.spec}
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: '1.6rem' }}>City</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {['', ...ETHIOPIAN_CITIES].map(city => (
            <label
              key={city}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '1.35rem',
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                borderRadius: 4,
                background: searchCity === city && city ? '#fff4f0' : 'transparent',
                color: searchCity === city && city ? '#f55d25' : '#555',
                fontWeight: searchCity === city && city ? 700 : 400
              }}
            >
              <input
                type="radio"
                name="city"
                checked={searchCity === city}
                onChange={() => {
                  setCityInput(city);
                  if (onSearch) onSearch(searchSpec, city);
                }}
                style={{ accentColor: '#f55d25' }}
              />
              {city || 'All Cities'}
            </label>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="dir-main-content">
        {/* Search bar */}
        <div className="dir-search-wrap">
          <div className="dir-search-row">
            <div className="dir-search-field" style={{ flex: 2 }}>
              <input
                type="text"
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
                {['Criminal', 'Corporate', 'Family', 'Civil'].map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div className="dir-search-field" style={{ flex: 2 }}>
              <input
                type="text"
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
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          <div className="filter-chips">
            {['Criminal', 'Corporate', 'Family', 'Civil'].map(s => (
              <button
                key={s}
                className={`filter-chip${searchSpec === s ? ' active' : ''}`}
                onClick={() => handleSpecChip(s)}
              >
                {s}
              </button>
            ))}
            <span style={{ borderLeft: '1px solid #e0e0e0', margin: '0 0.4rem', alignSelf: 'stretch' }} />
            {ETHIOPIAN_CITIES.map(c => (
              <button
                key={c}
                className={`filter-chip city${searchCity === c ? ' active' : ''}`}
                onClick={() => handleCityChip(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="results-header">
          <p className="results-count">
            <strong>{lawyers.length}</strong> advocates found{searchCity ? ` in ${searchCity}` : ''}{searchSpec ? ` · ${searchSpec}` : ''}
          </p>
          {hasFilter && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            Loading advocates <span className="loading-dots"><span/><span/><span/></span>
          </div>
        ) : lawyers.length > 0 ? (
          <div className="lawyers-grid">
            {lawyers.map(lawyer => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} onClick={() => onSelectLawyer(lawyer)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-title">No advocates found</p>
            <p className="empty-sub">Try broadening your search or clearing filters.</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
