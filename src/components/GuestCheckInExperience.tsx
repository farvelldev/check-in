'use client';

import { useState } from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import RegisterForm from '@/components/RegisterForm';
import ThankYouCard from '@/components/ThankYouCard';

export default function GuestCheckInExperience() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:py-8">
      <div className="w-full max-w-lg flex justify-end mb-4">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
        {isSubmitted ? (
          <ThankYouCard onReset={() => setIsSubmitted(false)} />
        ) : (
          <RegisterForm onSuccess={() => setIsSubmitted(true)} />
        )}
      </div>
    </main>
  );
}
