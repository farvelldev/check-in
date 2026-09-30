'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage('Credenciales incorrectas. Verifique correo y contraseña.');
        return;
      }

      router.replace('/admin');
    } catch {
      setErrorMessage('No se pudo iniciar sesión. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg shadow-amber-500/20 mb-3">
            H
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Panel de Recepción</h1>
          <p className="text-xs text-slate-400 mt-1">Acceso privado para el personal de administración</p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              placeholder="recepcion@hotel.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
