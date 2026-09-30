'use client';

import { useLanguage } from '../context/LanguageContext';
import { Language } from '../locales';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; svg: React.ReactNode }[] = [
    {
      code: 'es',
      label: 'Español',
      svg: (
        <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 750 500">
          <rect width="750" height="500" fill="#c60b1e" />
          <rect width="750" height="250" y="125" fill="#ffc400" />
        </svg>
      ),
    },
    {
      code: 'en',
      label: 'English',
      svg: (
        <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 60 30">
          <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
          <clipPath id="t"><path d="M0,0 L60,30 M60,0 L0,30"/></clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#012169" strokeWidth="4"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
      ),
    },
    {
      code: 'de',
      label: 'Deutsch',
      svg: (
        <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 5 3">
          <rect width="5" height="3" y="0" fill="#000" />
          <rect width="5" height="2" y="1" fill="#DD0000" />
          <rect width="5" height="1" y="2" fill="#FFCE00" />
        </svg>
      ),
    },
    {
      code: 'fr',
      label: 'Français',
      svg: (
        <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 3 2">
          <rect width="1" height="2" x="0" fill="#002395" />
          <rect width="1" height="2" x="1" fill="#FFFFFF" />
          <rect width="1" height="2" x="2" fill="#ED2939" />
        </svg>
      ),
    },
    {
      code: 'it',
      label: 'Italiano',
      svg: (
        <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 3 2">
          <rect width="1" height="2" x="0" fill="#009246" />
          <rect width="1" height="2" x="1" fill="#FFFFFF" />
          <rect width="1" height="2" x="2" fill="#CE2B37" />
        </svg>
      ),
    },
    {
      code: 'pl',
      label: 'Polski',
      svg: (
        <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 16 10">
          <rect width="16" height="10" fill="#DC143C" />
          <rect width="16" height="5" fill="#FFFFFF" />
        </svg>
      ),
    },
  ];

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg flex-wrap justify-center">
      {languages.map((lang) => {
        const isActive = language === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            title={lang.label}
            aria-label={lang.label}
            className={`relative flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer select-none ${
              isActive
                ? 'bg-slate-800 shadow-md scale-105 ring-1 ring-amber-500/50'
                : 'opacity-50 hover:opacity-100 hover:bg-slate-800/50'
            }`}
          >
            {lang.svg}
            {isActive && (
              <span className="absolute -bottom-0.5 w-1 h-1 bg-amber-400 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};