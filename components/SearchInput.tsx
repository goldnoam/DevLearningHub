
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Translation } from '../types';

interface SearchInputProps {
  t: Translation;
  onSearch: (query: string) => void;
  suggestions: string[];
}

export interface SearchInputHandle {
  focus: () => void;
}

const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(({ t, onSearch, suggestions }, ref) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputElementRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputElementRef.current?.focus();
    }
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text');
    if (text) {
      const newQuery = query + text;
      setQuery(newQuery);
      onSearch(newQuery);
    }
  };

  const handleExport = () => {
    const blob = new Blob([query], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-query-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(query.toLowerCase()) && query.length > 0
  );

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto mb-8">
      <div 
        className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner border border-transparent focus-within:border-blue-500 transition-all"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <svg className="w-5 h-5 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputElementRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder={t.searchPlaceholder}
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-lg py-2"
          aria-label={t.searchPlaceholder}
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); onSearch(''); }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-bold"
            title={t.clearInput}
          >
            {t.clearInput}
          </button>
        )}
        <button 
          onClick={handleExport}
          className="p-1 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
          title={t.exportSearch}
        >
          {t.exportSearch}
        </button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filteredSuggestions.map((s, i) => (
            <li 
              key={i}
              onClick={() => { setQuery(s); onSearch(s); setShowSuggestions(false); }}
              className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b last:border-0 border-slate-100 dark:border-slate-700"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default SearchInput;
