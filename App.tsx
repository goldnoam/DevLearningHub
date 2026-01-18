
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Language, FontSize, Translation, Course } from './types';
import { LANGUAGES, TRANSLATIONS, COURSES } from './constants';
import SearchInput, { SearchInputHandle } from './components/SearchInput';
import { askGemini } from './services/geminiService';

// Helper component for keyword highlighting in text
const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="highlight-match">{part}</span> 
          : part
      )}
    </>
  );
};

// Fuzzy match helper
const isFuzzyMatch = (text: string, query: string): boolean => {
  let i = 0, j = 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  while (i < t.length && j < q.length) {
    if (t[i] === q[j]) j++;
    i++;
  }
  return j === q.length;
};

// Syntax Highlighting Component
interface CodeBlockProps {
  code: string;
  category: string;
  query: string;
  title: string;
  t: Translation;
  lang: string;
  onShare: (code: string, title: string) => void;
  onExport: (code: string, filename: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, category, query, title, t, lang, onShare, onExport }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const prismLang = useMemo(() => {
    switch (category) {
      case 'JS': return 'javascript';
      case 'TS': return 'typescript';
      case 'GO': return 'go';
      case 'PY': return 'python';
      case 'QT': return 'python'; 
      case 'RB': return 'ruby';
      case 'NODE': return 'javascript';
      default: return 'clike';
    }
  }, [category]);

  useEffect(() => {
    if (codeRef.current && (window as any).Prism) {
      (window as any).Prism.highlightElement(codeRef.current);
    }
  }, [code, prismLang]);

  const handleAiExplain = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const prompt = `Explain this ${category} code snippet in ${lang}:\n\n${code}`;
      const result = await askGemini(prompt);
      setExplanation(result);
    } catch (error) {
      console.error(error);
      setExplanation("Failed to get AI explanation. Please check your API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prismLang}</span>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleAiExplain}
            disabled={isAiLoading}
            className="has-tooltip p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            aria-label={t.aiExplainLabel}
          >
            <svg className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="tooltip">{isAiLoading ? t.aiLoadingLabel : t.aiExplainLabel}</span>
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(code);
            }}
            className="has-tooltip p-1 text-slate-400 hover:text-white transition-colors"
            aria-label={t.copyLabel}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            <span className="tooltip">{t.copyLabel}</span>
          </button>
          <button 
            onClick={() => onShare(code, title)}
            className="has-tooltip p-1 text-slate-400 hover:text-white transition-colors"
            aria-label={t.shareLabel}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            <span className="tooltip">{t.shareLabel}</span>
          </button>
          <button 
            onClick={() => onExport(code, title)}
            className="has-tooltip p-1 text-slate-400 hover:text-white transition-colors"
            aria-label={t.exportCodeLabel}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="tooltip">{t.exportCodeLabel}</span>
          </button>
        </div>
      </div>
      <div className="relative group/content bg-slate-950">
        <pre className={`language-${prismLang}`}>
          <code ref={codeRef} className={`language-${prismLang}`}>{code}</code>
        </pre>
        {query.trim() && code.toLowerCase().includes(query.toLowerCase()) && (
          <div className="absolute inset-0 pointer-events-none p-4 overflow-hidden whitespace-pre font-mono text-[10px] leading-[1.5] opacity-25 select-none">
             <Highlight text={code} query={query} />
          </div>
        )}
      </div>
      {explanation && (
        <div className="p-4 bg-slate-800 border-t border-slate-700 text-sm text-slate-200 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2 font-bold text-blue-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.243 14.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6.464 14.657l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414z" /></svg>
            AI Insight
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{explanation}</p>
          <button 
            onClick={() => setExplanation(null)}
            className="mt-2 text-xs text-slate-400 hover:text-slate-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  // Load initial states from localStorage if available
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem('fontSize') as FontSize) || 'medium');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const searchInputRef = useRef<SearchInputHandle>(null);

  const t = TRANSLATIONS[lang];
  const currentLangData = LANGUAGES.find(l => l.code === lang)!;

  // Persist states to localStorage
  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('fontSize', fontSize); }, [fontSize]);

  // Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey) {
        switch (e.key.toUpperCase()) {
          case 'T':
            setTheme(prev => prev === 'dark' ? 'light' : 'dark');
            break;
          case 'L': {
            const currentIndex = LANGUAGES.findIndex(l => l.code === lang);
            const nextIndex = (currentIndex + 1) % LANGUAGES.length;
            setLang(LANGUAGES[nextIndex].code);
            break;
          }
          case 'F': {
            const sizes: FontSize[] = ['small', 'medium', 'large'];
            const currentIndex = sizes.indexOf(fontSize);
            const nextIndex = (currentIndex + 1) % sizes.length;
            setFontSize(sizes[nextIndex]);
            break;
          }
          case 'S':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'A':
            setShowAccessibility(true);
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lang, fontSize]);

  // Theme, Direction and Language Sync
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    html.dir = currentLangData.dir;
    html.lang = lang;
  }, [theme, currentLangData, lang]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'he' ? 'he-IL' : 
                     lang === 'zh' ? 'zh-CN' : 
                     lang === 'hi' ? 'hi-IN' : 
                     lang === 'de' ? 'de-DE' : 
                     lang === 'es' ? 'es-ES' : 
                     lang === 'fr' ? 'fr-FR' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = (code: string, title: string) => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - DevLearning Hub`,
        text: `Check out this ${title} example from DevLearning Hub:\n\n${code}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(code);
      alert('Code snippet copied to clipboard!');
    }
  };

  const handleExportCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCourses = useMemo(() => {
    const trimmedQuery = searchQuery.toLowerCase().trim();
    if (!trimmedQuery) return COURSES;

    const words = trimmedQuery.split(/\s+/);
    
    const scored = COURSES.map(course => {
      let score = 0;
      const cTitle = course.title.toLowerCase();
      const cCat = course.category.toLowerCase();

      words.forEach(w => {
        if (cTitle.includes(w)) score += 100;
        if (cCat.includes(w)) score += 50;

        course.modules.forEach(m => {
          const mTitle = m.title.toLowerCase();
          const mDesc = m.description.toLowerCase();
          const mCode = (m.code || '').toLowerCase();

          if (mTitle.includes(w)) score += 30;
          if (mDesc.includes(w)) score += 10;
          if (mCode.includes(w)) score += 5;

          if (!mTitle.includes(w) && isFuzzyMatch(mTitle, w)) score += 10;
          if (!mDesc.includes(w) && isFuzzyMatch(mDesc, w)) score += 5;
          if (mCode && !mCode.includes(w) && isFuzzyMatch(mCode, w)) score += 2;
        });

        if (!cTitle.includes(w) && isFuzzyMatch(cTitle, w)) score += 20;
      });

      return { course, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.course);
  }, [searchQuery]);

  const searchSuggestions = useMemo(() => {
    const suggestionsSet = new Set<string>();
    COURSES.forEach(c => {
      suggestionsSet.add(c.title);
      c.modules.forEach(m => suggestionsSet.add(m.title));
    });
    return Array.from(suggestionsSet);
  }, []);

  const fontSizeClass = fontSize === 'small' ? 'font-size-small' : fontSize === 'large' ? 'font-size-large' : 'font-size-medium';

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-300 ${fontSizeClass} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4" role="banner">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl" aria-hidden="true">D</div>
            <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {t.offlineMode}
            </span>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              aria-label="Select Language (Alt+Shift+L)"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1" role="group" aria-label="Font Size Toggle (Alt+Shift+F)">
              {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${fontSize === size ? 'bg-white dark:bg-slate-700 shadow-sm font-bold' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  aria-pressed={fontSize === size}
                >
                  {size.toUpperCase()[0]}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Theme (Alt+Shift+T)"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>

            <button 
              onClick={() => speakText(`${t.title}. ${t.subtitle}`)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              title={t.ttsEnable}
              aria-label={t.ttsEnable}
            >
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 pt-16 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            {t.subtitle}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 max-w-2xl mx-auto">
            {t.offlineMode} - Comprehensive scripting tutorials with accessibility and AI insights.
          </p>

          <div className="mb-8 p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto shadow-sm">
             <p className="text-sm font-medium mb-2">{t.surveyLinkText}</p>
             <a 
               href="https://survey.stackoverflow.co/2024/technology#most-popular-technologies" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
             >
               Stack Overflow Developer Survey - Most Popular Technologies
             </a>
          </div>

          <div className="text-xs text-slate-400 mb-8 font-mono">
            {t.shortcutsInfo}
          </div>
          <SearchInput ref={searchInputRef} t={t} onSearch={setSearchQuery} suggestions={searchSuggestions} />
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12" id="main-content" role="main">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredCourses.map(course => (
            <article 
              key={course.id} 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  course.category === 'JS' ? 'bg-yellow-100 text-yellow-800' : 
                  course.category === 'TS' ? 'bg-blue-100 text-blue-800' : 
                  course.category === 'GO' ? 'bg-teal-100 text-teal-800' :
                  course.category === 'PY' ? 'bg-indigo-100 text-indigo-800' :
                  course.category === 'QT' ? 'bg-green-100 text-green-800' :
                  course.category === 'NODE' ? 'bg-lime-100 text-lime-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.category}
                </span>
                <button 
                  onClick={() => speakText(`${course.title}. Category ${course.category}`)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-opacity"
                  aria-label={t.ttsEnable}
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 5v14l-6.293-6.293H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.707L12 5z" /></svg>
                </button>
              </div>
              <h3 className="text-xl font-bold mb-4">
                <Highlight text={course.title} query={searchQuery} />
              </h3>
              <div className="space-y-4 flex-grow">
                {course.modules.map(mod => (
                  <section key={mod.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <h4 className="font-semibold text-sm mb-1">
                      <Highlight text={mod.title} query={searchQuery} />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <Highlight text={mod.description} query={searchQuery} />
                    </p>
                    {mod.code && (
                      <CodeBlock 
                        code={mod.code} 
                        category={course.category} 
                        query={searchQuery} 
                        title={mod.title}
                        t={t}
                        lang={lang}
                        onShare={handleShare}
                        onExport={handleExportCode}
                      />
                    )}
                  </section>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-blue-200 dark:shadow-none">
                {t.startLearning}
              </button>
            </article>
          ))}
        </div>
      </main>

      {/* Accessibility Modal */}
      {showAccessibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAccessibility(false)} role="dialog" aria-modal="true" aria-labelledby="accessibility-modal-title">
          <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h2 id="accessibility-modal-title" className="text-2xl font-bold mb-4">{t.accessibilityTitle}</h2>
            <div className="text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed mb-8">
              <p>{t.accessibilityContent}</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Keyboard Navigation:</strong> Fully operable via keyboard. Use TAB to navigate.</li>
                <li><strong>Shortcuts:</strong> Alt+Shift+T (Theme), Alt+Shift+L (Language), Alt+Shift+F (Font), Alt+Shift+S (Search), Alt+Shift+A (Accessibility).</li>
                <li><strong>RTL Support:</strong> Seamlessly switches interface direction for languages like Hebrew.</li>
                <li><strong>Visual Comfort:</strong> Contrast-compliant dark mode and adjustable font scaling.</li>
                <li><strong>Screen Readers:</strong> Comprehensive ARIA attributes and semantic HTML tags.</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowAccessibility(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl focus:ring-4 focus:ring-blue-500 focus:outline-none"
            >
              {t.closeLabel}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-4" role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-lg mb-2">DevLearning Hub</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">© {t.footerRights}</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <button 
              onClick={() => setShowAccessibility(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 underline mb-2 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            >
              {t.accessibilityTitle} (Alt+Shift+A)
            </button>
            <a href="mailto:goldnoamai@gmail.com" className="flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {t.feedback}: goldnoamai@gmail.com
            </a>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-xs text-slate-400 mt-2">
              <span>Node.js</span>
              <span>TypeScript</span>
              <span>JavaScript</span>
              <span>Go</span>
              <span>Python</span>
              <span>Qt</span>
              <span>Ruby</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
