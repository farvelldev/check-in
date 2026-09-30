'use client';

import { useLanguage } from '../context/LanguageContext';

interface ThankYouCardProps {
  onReset?: () => void;
}

export default function ThankYouCard({ onReset }: ThankYouCardProps) {
  const { t } = useLanguage();

  return (
    <div className="py-6 text-center space-y-5">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {t.thankYouTag}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2">
          {t.thankYouTitle}
        </h2>
        <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
          {t.thankYouDesc}
        </p>
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition-colors pt-2"
        >
          {t.resetButton}
        </button>
      )}
    </div>
  );
}