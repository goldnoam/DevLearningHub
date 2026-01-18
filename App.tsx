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

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; t: Translation; title: string }> = ({ isOpen, onClose, t, title }) => {
  if (!isOpen) return null;
  const shareUrl = window.location.href;

  const shareOptions = [
    { 
      name: 'X / Twitter', 
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', 
      color: 'bg-black', 
      link: `https://twitter.com/intent/tweet?text=Mastering ${title} on DevLearning Hub!&url=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: 'LinkedIn', 
      icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', 
      color: 'bg-[#0077b5]', 
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: 'Facebook', 
      icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', 
      color: 'bg-[#1877f2]', 
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` 
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight">{t.shareLabel}</h3>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {shareOptions.map(opt => (
            <a key={opt.name} href={opt.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group">
              <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform ring-4 ring-transparent group-hover:ring-blue-500/20`}>
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d={opt.icon} /></svg>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{opt.name}</span>
            </a>
          ))}
        </div>
        <div className="relative group">
          <input readOnly value={shareUrl} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-4 pl-5 pr-14 text-xs font-mono text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          <button 
            onClick={() => { navigator.clipboard.writeText(shareUrl); alert('URL Copied!'); }}
            className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md active:scale-90"
            title="Copy URL"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; category: string; query: string; title: string; t: Translation; lang: Language }> = ({ code, category, query, title, t, lang }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
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

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    const btn = document.getElementById(`copy-${title}`);
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      setTimeout(() => btn.innerHTML = original, 2000);
    }
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(code);
    
    const langMap: Record<string, string> = { 
      he: 'he-IL', 
      zh: 'zh-CN', 
      hi: 'hi-IN', 
      de: 'de-DE', 
      es: 'es-ES', 
      fr: 'fr-FR' 
    };
    utterance.lang = langMap[lang] || 'en-US';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = prismLang === 'javascript' ? 'js' : prismLang === 'typescript' ? 'ts' : prismLang === 'python' ? 'py' : prismLang === 'go' ? 'go' : 'txt';
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800/80 border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prismLang}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleSpeak}
              className={`has-tooltip p-1.5 transition-all hover:bg-slate-700 rounded-md ${isSpeaking ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}
              aria-label={t.ttsEnable}
            >
              {isSpeaking ? (
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 5v14l-6.293-6.293H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.707L12 5z" /></svg>
              )}
              <span className="tooltip">{t.ttsEnable}</span>
            </button>
            <button 
              id={`copy-${title}`}
              onClick={handleCopy}
              className="has-tooltip p-1.5 text-slate-400 hover:text-white transition-all hover:bg-slate-700 rounded-md"
              aria-label={t.copyLabel}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              <span className="tooltip">{t.copyLabel}</span>
            </button>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="has-tooltip p-1.5 text-slate-400 hover:text-white transition-all hover:bg-slate-700 rounded-md"
              aria-label={t.shareLabel}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 7.342m0 9.316a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0-9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              <span className="tooltip">{t.shareLabel}</span>
            </button>
            <button 
              onClick={handleExport}
              className="has-tooltip p-1.5 text-slate-400 hover:text-white transition-all hover:bg-slate-700 rounded-md"
              aria-label={t.exportCodeLabel}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="tooltip">{t.exportCodeLabel}</span>
            </button>
          </div>
        </div>
        <div className="bg-slate-950 overflow-x-auto custom-scrollbar">
          <pre className={`language-${prismLang}`}>
            <code ref={codeRef} className={`language-${prismLang}`}>{code}</code>
          </pre>
        </div>
      </div>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} t={t} title={title} />
    </>
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
      if (dir === 'w') y = Math.max(2, y - 8);
      if (dir === 's') y = Math.min(98, y + 8);
      if (dir === 'a') x = Math.max(2, x - 8);
      if (dir === 'd') x = Math.min(98, x + 8);
      return { x, y };
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        move(key as any);
      }
      if (e.key === ' ') {
        e.preventDefault();
        setPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [paused]);

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 mb-12 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h4 className="font-bold text-xl tracking-tight">Logic Lab: Interactive Playground</h4>
          <p className="text-sm text-slate-500">Master movement logic & state management</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setPaused(!paused)} 
            className={`p-2.5 px-6 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${paused ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={() => setPos({ x: 50, y: 50 })} 
            className="p-2.5 px-6 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="relative h-72 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner group" ref={gameRef}>
          <div 
            className={`absolute w-7 h-7 rounded-xl shadow-2xl transition-all duration-200 ease-out ${paused ? 'bg-slate-600' : 'bg-blue-500 animate-pulse'}`}
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`, 
              transform: 'translate(-50%, -50%)',
              boxShadow: paused ? 'none' : '0 0 25px rgba(59, 130, 246, 0.7)'
            }}
          />
          {paused && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white font-black tracking-widest text-2xl uppercase">Paused</span>
            </div>
          )}
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            X: {Math.round(pos.x)} Y: {Math.round(pos.y)}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="text-center w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Mobile Visual Controls (WASD)</p>
            <div className="flex flex-col items-center gap-3">
              <button 
                onMouseDown={() => move('w')} 
                className="p-6 bg-white dark:bg-slate-700 rounded-2xl shadow-lg active:scale-90 transition-all border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center"
                aria-label="Move Up (W)"
              >
                <span className="text-xs font-black mb-1">W</span>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
              </button>
              <div className="flex gap-3">
                <button 
                  onMouseDown={() => move('a')} 
                  className="p-6 bg-white dark:bg-slate-700 rounded-2xl shadow-lg active:scale-90 transition-all border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center"
                  aria-label="Move Left (A)"
                >
                  <span className="text-xs font-black mb-1">A</span>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onMouseDown={() => move('s')} 
                  className="p-6 bg-white dark:bg-slate-700 rounded-2xl shadow-lg active:scale-90 transition-all border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center"
                  aria-label="Move Down (S)"
                >
                  <span className="text-xs font-black mb-1">S</span>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button 
                  onMouseDown={() => move('d')} 
                  className="p-6 bg-white dark:bg-slate-700 rounded-2xl shadow-lg active:scale-90 transition-all border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center"
                  aria-label="Move Right (D)"
                >
                  <span className="text-xs font-black mb-1">D</span>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
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

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 't': setTheme(prev => prev === 'dark' ? 'light' : 'dark'); break;
          case 'l': 
            const nextLangIdx = (LANGUAGES.findIndex(l => l.code === lang) + 1) % LANGUAGES.length;
            setLang(LANGUAGES[nextLangIdx].code);
            break;
          case 'f':
            const sizes: FontSize[] = ['small', 'medium', 'large'];
            const nextSizeIdx = (sizes.indexOf(fontSize) + 1) % sizes.length;
            setFontSize(sizes[nextSizeIdx]);
            break;
          case 's':
            searchInputRef.current?.focus();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [lang, fontSize]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = { he: 'he-IL', zh: 'zh-CN', hi: 'hi-IN', de: 'de-DE', es: 'es-ES', fr: 'fr-FR' };
    utterance.lang = langMap[lang] || 'en-US';
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
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4" role="banner">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20" aria-hidden="true">D</div>
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              {t.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t.offlineMode}
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>

            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              aria-label="Switch Language"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>

            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1" role="group" aria-label="Adjust Font Size">
              {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-1.5 rounded-xl text-xs transition-all duration-300 ${fontSize === size ? 'bg-white dark:bg-slate-700 shadow-lg font-black text-blue-600 dark:text-white' : 'text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-300'}`}
                  aria-pressed={fontSize === size}
                >
                  {size.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent active:scale-95 shadow-sm"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800/30 dark:to-slate-900 pt-20 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 leading-tight tracking-tighter">
            {t.subtitle}
          </h2>
          <SearchInput ref={searchInputRef} t={t} onSearch={setSearchQuery} suggestions={['TypeScript', 'JavaScript', 'Golang', 'Python', 'Node.js', 'Closure', 'Channels', 'Generators']} />
          <p className="text-xs text-slate-400 font-mono mt-6 tracking-wide uppercase opacity-80">{t.shortcutsInfo}</p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16" role="main">
        <LogicGame t={t} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map(course => (
            <article key={course.id} className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-full hover:shadow-2xl hover:border-blue-500/40 transition-all group backdrop-blur-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 uppercase tracking-widest border border-blue-200/50 dark:border-blue-700/30">
                  {course.category}
                </span>
                <button 
                  onClick={() => speakText(course.title)}
                  className="p-3 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-700/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  aria-label="Speak Title"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 5v14l-6.293-6.293H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.707L12 5z" /></svg>
                </button>
              </div>
              <h3 className="text-3xl font-black mb-8 tracking-tight">
                <Highlight text={course.title} query={searchQuery} />
              </h3>
              <div className="space-y-10 flex-grow">
                {course.modules.map(mod => (
                  <div key={mod.id} className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                      <h4 className="font-black text-base tracking-tight">
                        <Highlight text={mod.title} query={searchQuery} />
                      </h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                      <Highlight text={mod.description} query={searchQuery} />
                    </p>
                    {mod.code && <CodeBlock code={mod.code} category={course.category} query={searchQuery} title={mod.title} t={t} lang={lang} />}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <section className="mt-28 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white text-center shadow-3xl shadow-blue-500/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
          <h3 className="text-4xl font-black mb-6 relative z-10">Stay Ahead of the Curve</h3>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10 font-medium">
            {t.surveyLinkText}
          </p>
          <a 
            href="https://survey.stackoverflow.co/2024/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-2xl active:scale-95 relative z-10"
          >
            Explore the 2024 Survey
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </section>
      </main>

      {isAccessibilityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl" role="dialog" aria-modal="true" onClick={() => setIsAccessibilityOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 max-w-xl w-full shadow-3xl relative border border-slate-200 dark:border-slate-700 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-black tracking-tight">{t.accessibilityTitle}</h2>
              <button onClick={() => setIsAccessibilityOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-10 text-lg font-medium">
              {t.accessibilityContent}
            </p>
            <div className="grid grid-cols-2 gap-5 mb-10">
              <div className="p-6 bg-slate-50 dark:bg-slate-700/40 rounded-3xl border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Theme</span>
                <span className="text-sm font-bold">Alt + Shift + T</span>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-700/40 rounded-3xl border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Search</span>
                <span className="text-sm font-bold">Alt + Shift + S</span>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-700/40 rounded-3xl border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Language</span>
                <span className="text-sm font-bold">Alt + Shift + L</span>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-700/40 rounded-3xl border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Font</span>
                <span className="text-sm font-bold">Alt + Shift + F</span>
              </div>
            </div>
            <button 
              onClick={() => setIsAccessibilityOpen(false)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] text-lg uppercase tracking-widest"
            >
              {t.closeLabel}
            </button>
          </div>
        </div>
      )}

      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-20 px-6" role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <p className="font-black text-3xl tracking-tighter mb-3">DevLearning Hub</p>
            <p className="text-slate-500 text-sm font-bold">© {t.footerRights}</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsAccessibilityOpen(true)}
                className="text-xs font-black text-slate-500 hover:text-blue-600 transition-all bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 uppercase tracking-widest active:scale-95"
              >
                {t.accessibilityTitle}
              </button>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs font-black text-slate-500 hover:text-blue-600 transition-all bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 uppercase tracking-widest active:scale-95"
              >
                Back to Top
              </button>
            </div>
            <a href="mailto:goldnoamai@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline text-base font-black flex items-center gap-2 group">
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {t.feedback}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;