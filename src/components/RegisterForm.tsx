'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '@/lib/supabase'; // Importación de tu cliente de Supabase

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    street: '',
    street_number: '',
    postal_code: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    gdpr_accepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // El esquema del proyecto no declara una columna de consentimiento, así que se omite del insert.
      const payload = {
        room_number: null, // Viene vacío porque lo asigna el admin después
        booking_reference: null, // Si no pides referencia en el cliente, se manda como null
        full_name: formData.full_name,
        street: formData.street,
        street_number: formData.street_number,
        postal_code: formData.postal_code,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      };

      const { error } = await supabase
        .from('checkins')
        .insert([payload]);

      if (error) {
        throw error;
      }

      onSuccess();
    } catch (error: unknown) {
      console.error('Error enviando registro a Supabase:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Hubo un error al registrar tus datos. Inténtalo de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Banner Superior */}
      <div className="relative h-36 bg-slate-900 rounded-2xl overflow-hidden flex items-end p-4 shadow-md">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative z-10">
          <span className="px-2.5 py-0.5 bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
            {t.tag}
          </span>
          <h1 className="text-xl font-black text-white mt-1">{t.title}</h1>
          <p className="text-[11px] text-slate-300">{t.subtitle}</p>
        </div>
      </div>

      {/* Mensaje de Error si falla la inserción */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t.fullName}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              type="text"
              required
              value={formData.full_name}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
        </div>

        {/* Bloque Dirección */}
        <div className="space-y-2.5 pt-1">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {t.addressSection}
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{t.street}</label>
              <input
                type="text"
                required
                value={formData.street}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{t.streetNumber}</label>
              <input
                type="text"
                required
                value={formData.street_number}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{t.postalCode}</label>
              <input
                type="text"
                required
                value={formData.postal_code}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{t.city}</label>
              <input
                type="text"
                required
                value={formData.city}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{t.country}</label>
              <input
                type="text"
                required
                value={formData.country}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{t.phone}</label>
            <input
              type="tel"
              required
              value={formData.phone}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{t.email}</label>
            <input
              type="email"
              required
              value={formData.email}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* RGPD */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/80 transition-colors">
            <input
              type="checkbox"
              required
              checked={formData.gdpr_accepted}
              className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
              onChange={(e) => setFormData({ ...formData, gdpr_accepted: e.target.checked })}
            />
            <span className="text-[11px] text-slate-600 leading-tight">
              {t.gdpr}
            </span>
          </label>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-sm shadow-md shadow-amber-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}