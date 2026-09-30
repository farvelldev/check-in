'use client';

import { useState } from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import RegisterForm from '../components/RegisterForm';
import ThankYouCard from '../components/ThankYouCard';

function ClientApp() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    // Fondo oscuro completo en toda la pantalla
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:py-8">
      
      {/* Selector de idioma arriba flotante o centrado */}
      <div className="w-full max-w-lg flex justify-end mb-4">
        <LanguageSelector />
      </div>

      {/* Tarjeta Blanca Centrada */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
        {!isSubmitted ? (
          <RegisterForm onSuccess={() => setIsSubmitted(true)} />
        ) : (
          <ThankYouCard onReset={() => setIsSubmitted(false)} />
        )}
      </div>

    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <ClientApp />
    </LanguageProvider>
  );
}