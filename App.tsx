import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Language, FontSize, Translation, Course } from './types';
import { LANGUAGES, TRANSLATIONS, COURSES } from './constants';
import SearchInput, { SearchInputHandle } from './components/SearchInput';

// Helper for highlighting search matches
const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
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

const CodeBlock: React.FC<{ code: string; category: string; query: string; title: string; t: Translation }> = ({ code, category, query, title, t }) => {
  const codeRef = useRef<HTMLElement>(null);
  
  const prismLang = useMemo(() => {
    const map: Record<string, string> = {
      JS: 'javascript', TS: 'typescript', GO: 'go', PY: 'python', QT: 'python', RB: 'ruby', NODE: 'javascript'
    };
    return map[category] || 'clike';
  }, [category]);

  useEffect(() => {
    if (codeRef.current && (window as any).Prism) {
      (window as any).Prism.highlightElement(codeRef.current);
    }
  }, [code, prismLang]);

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prismLang}</span>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="has-tooltip p-1 text-slate-400 hover:text-white transition-colors"
            aria-label={t.copyLabel}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            <span className="tooltip">{t.copyLabel}</span>
          </button>
        </div>
      </div>
      <div className="bg-slate-950">
        <pre className={`language-${prismLang}`}>
          <code ref={codeRef} className={`language-${prismLang}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const LogicGame: React.FC<{ t: Translation }> = ({ t }) => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [paused, setPaused] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  const move = (dir: 'w' | 'a' | 's' | 'd') => {
    if (paused) return;
    setPos(p => {
      let { x, y } = p;
      if (dir === 'w') y = Math.max(0, y - 5);
      if (dir === 's') y = Math.min(100, y + 5);
      if (dir === 'a') x = Math.max(0, x - 5);
      if (dir === 'd') x = Math.min(100, x + 5);
      return { x, y };
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) move(e.key.toLowerCase() as any);
      if (e.key === ' ') setPaused(p => !p);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [paused]);

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-12">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold">Logic Lab: Interactive WASD Controls</h4>
        <div className="flex gap-2">
          <button onClick={() => setPaused(!paused)} className="p-2 px-4 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={() => setPos({ x: 50, y: 50 })} className="p-2 px-4 bg-slate-400 dark:bg-slate-600 text-white rounded-lg text-xs font-bold hover:bg-slate-500 transition-colors">Reset</button>
        </div>
      </div>
      <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-700" ref={gameRef}>
        <div 
          className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 transition-all duration-75"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
        />
        <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 font-mono">Use Keyboard WASD or Buttons Below</div>
      </div>
      <div className="flex flex-col items-center mt-4 gap-1">
        <button onClick={() => move('w')} className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold w-12 hover:bg-slate-300 dark:hover:bg-slate-600">W</button>
        <div className="flex gap-1">
          <button onClick={() => move('a')} className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold w-12 hover:bg-slate-300 dark:hover:bg-slate-600">A</button>
          <button onClick={() => move('s')} className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold w-12 hover:bg-slate-300 dark:hover:bg-slate-600">S</button>
          <button onClick={() => move('d')} className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold w-12 hover:bg-slate-300 dark:hover:bg-slate-600">D</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as any) || 'dark');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem('fontSize') as FontSize) || 'medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const searchInputRef = useRef<SearchInputHandle>(null);

  const t = TRANSLATIONS[lang];
  const currentLangData = LANGUAGES.find(l => l.code === lang)!;

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    localStorage.setItem('fontSize', fontSize);
    document.documentElement.dir = currentLangData.dir;
    document.documentElement.lang = lang;
  }, [lang, fontSize, currentLangData]);

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

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COURSES;
    return COURSES.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q) ||
      c.modules.some(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const fontSizeClass = fontSize === 'small' ? 'font-size-small' : fontSize === 'large' ? 'font-size-large' : 'font-size-medium';

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-300 ${fontSizeClass} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
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
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              aria-label="Switch Language"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>

            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1" role="group" aria-label="Adjust Font Size">
              {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${fontSize === size ? 'bg-white dark:bg-slate-700 shadow-sm font-bold' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  aria-pressed={fontSize === size}
                >
                  {size.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Dark Mode"
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

      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 pt-16 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            {t.subtitle}
          </h2>
          <SearchInput ref={searchInputRef} t={t} onSearch={setSearchQuery} suggestions={[]} />
          <p className="text-xs text-slate-400 font-mono mt-4">{t.shortcutsInfo}</p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12" role="main">
        <LogicGame t={t} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <article key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-xl transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 uppercase">
                  {course.category}
                </span>
                <button 
                  onClick={() => speakText(course.title)}
                  className="p-1 text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Speak Title"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 5v14l-6.293-6.293H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.707L12 5z" /></svg>
                </button>
              </div>
              <h3 className="text-xl font-bold mb-4">
                <Highlight text={course.title} query={searchQuery} />
              </h3>
              <div className="space-y-6 flex-grow">
                {course.modules.map(mod => (
                  <div key={mod.id}>
                    <h4 className="font-semibold text-sm mb-1">
                      <Highlight text={mod.title} query={searchQuery} />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <Highlight text={mod.description} query={searchQuery} />
                    </p>
                    {mod.code && <CodeBlock code={mod.code} category={course.category} query={searchQuery} title={mod.title} t={t} />}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>

      {isAccessibilityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4">{t.accessibilityTitle}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {t.accessibilityContent}
            </p>
            <button 
              onClick={() => setIsAccessibilityOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              {t.closeLabel}
            </button>
          </div>
        </div>
      )}

      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-4" role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <p className="font-bold text-lg">DevLearning Hub</p>
            <p className="text-slate-500 text-sm">© {t.footerRights}</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <button 
              onClick={() => setIsAccessibilityOpen(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 underline mb-2 hover:text-blue-700 transition-colors"
            >
              {t.accessibilityTitle}
            </button>
            <a href="mailto:goldnoamai@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
              {t.feedback}: goldnoamai@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;