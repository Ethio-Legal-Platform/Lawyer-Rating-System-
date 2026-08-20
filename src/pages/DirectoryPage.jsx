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
          {SPECIALIZATION_LIST.map(spec => (
            <li
              key={spec}
              className={`sidebar-spec-item${searchSpec === spec ? ' active' : ''}`}
              onClick={() => {
                setSpecInput(spec);
                if (onSearch) onSearch(spec, searchCity);
              }}
            >
              {spec} Law
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: '2rem' }}>City</h3>
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

