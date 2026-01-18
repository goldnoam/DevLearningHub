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
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const text = e.dataTransfer.getData('text');
    if (text) {
      const newQuery = query + text;
      setQuery(newQuery);
      onSearch(newQuery);
      setShowSuggestions(true);
      inputElementRef.current?.focus();
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
        className={`flex items-center gap-2 p-2 rounded-2xl shadow-inner border transition-all duration-300 ${
          isDragging 
            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 ring-4 ring-blue-500/20 scale-[1.02]' 
            : 'bg-slate-100 dark:bg-slate-800 border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-blue-500/10'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className="w-5 h-5 text-slate-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-lg py-3 dark:placeholder:text-slate-500"
          aria-label={t.searchPlaceholder}
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); onSearch(''); }}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors mr-1"
            title={t.clearInput}
          >
            {t.clearInput}
          </button>
        )}
        <button 
          onClick={handleExport}
          className="has-tooltip p-2 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {t.exportSearch}
          <span className="tooltip">{t.exportSearch}</span>
        </button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-72 overflow-y-auto animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
          {filteredSuggestions.map((s, i) => (
            <li 
              key={i}
              onClick={() => { setQuery(s); onSearch(s); setShowSuggestions(false); }}
              className="px-5 py-3.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b last:border-0 border-slate-100 dark:border-slate-700 transition-colors flex items-center justify-between group"
            >
              <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">{s}</span>
              <svg className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" /></svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default SearchInput;