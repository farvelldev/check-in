'use client';

import { useEffect, useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Checkin {
  id: string;
  created_at: string;
  room_number: string;
  booking_reference: string;
  full_name: string;
  street: string;
  street_number: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const formatDateToISO = (date: Date) => date.toISOString().split('T')[0];

export default function AdminDashboardPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Checkin, 'id' | 'created_at'>>({
    room_number: '',
    booking_reference: '',
    full_name: '',
    street: '',
    street_number: '',
    postal_code: '',
    city: '',
    country: '',
    phone: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const router = useRouter();
  const todayStr = formatDateToISO(new Date());
  const [workDay, setWorkDay] = useState(todayStr);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      setLoading(false);
      fetchCheckins();
    };

    checkAuthAndFetch();

    const channel = supabase
      .channel('checkins-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'checkins' },
        (payload) => {
          const newCheckin = payload.new as Checkin;
          setCheckins((prev) => [newCheckin, ...prev]);
          showToast(`Nuevo check-in: ${newCheckin.full_name}`, 'success');
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'checkins' },
        (payload) => {
          const updated = payload.new as Checkin;
          setCheckins((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const fetchCheckins = async () => {
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCheckins(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const startEditing = (checkin: Checkin) => {
    setEditingId(checkin.id);
    setEditForm({
      room_number: checkin.room_number || '',
      booking_reference: checkin.booking_reference || '',
      full_name: checkin.full_name || '',
      street: checkin.street || '',
      street_number: checkin.street_number || '',
      postal_code: checkin.postal_code || '',
      city: checkin.city || '',
      country: checkin.country || '',
      phone: checkin.phone || '',
      email: checkin.email || '',
    });
  };

  const handleSave = async (id: string, name: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('checkins')
      .update(editForm)
      .eq('id', id);

    if (!error) {
      setCheckins((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...editForm } : c))
      );
      setEditingId(null);
      showToast(`Registro de ${editForm.full_name || name} actualizado`);
    } else {
      showToast(`Error al actualizar: ${error.message}`, 'error');
    }
    setSaving(false);
  };

  const handleKeyDown = (e: KeyboardEvent, id: string, name: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(id, name);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const exportToCSV = () => {
    const selectedDayCheckins = checkins.filter(
      (c) => formatDateToISO(new Date(c.created_at)) === workDay
    );
    if (selectedDayCheckins.length === 0) {
      showToast(`No hay registros para exportar en la fecha ${workDay}`, 'error');
      return;
    }

    const headers = [
      'Fecha/Hora',
      'Nº Reserva',
      'Habitacion',
      'Nombre',
      'Calle',
      'Numero',
      'Codigo Postal',
      'Poblacion',
      'Pais',
      'Telefono',
      'Email'
    ];

    const rows = selectedDayCheckins.map((c) => [
      new Date(c.created_at).toLocaleString('es-ES'),
      `"${c.booking_reference || ''}"`,
      `"${c.room_number || ''}"`,
      `"${c.full_name || ''}"`,
      `"${c.street || ''}"`,
      `"${c.street_number || ''}"`,
      `"${c.postal_code || ''}"`,
      `"${c.city || ''}"`,
      `"${c.country || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `checkins_${workDay}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedDayCheckins = checkins.filter(
    (c) => formatDateToISO(new Date(c.created_at)) === workDay
  );

  const pendingCount = selectedDayCheckins.filter((c) => !c.room_number).length;
  const assignedCount = selectedDayCheckins.filter((c) => Boolean(c.room_number)).length;

  const filteredCheckins = selectedDayCheckins.filter((c) => {
    const matchesSearch =
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.booking_reference?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase()) ||
      c.street?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'pending') return !c.room_number;
    if (activeFilter === 'assigned') return Boolean(c.room_number);
    return true;
  });

  if (loading) {
    return <div className="p-8 text-center text-white">Cargando panel de administración...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Realtime Sync Activo
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">Panel de Recepción</h1>
            <p className="text-xs text-slate-400">Control de check-ins y asignación de habitaciones</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <span className="text-xs font-bold text-slate-400">Día de Trabajo:</span>
              <input
                type="date"
                value={workDay}
                onChange={(e) => setWorkDay(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              Exportar CSV ({workDay})
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes Hab. ({workDay})</p>
            <p className="text-3xl font-black text-rose-400 mt-1">{pendingCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asignadas ({workDay})</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{assignedCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Entradas ({workDay})</p>
            <p className="text-3xl font-black text-white mt-1">{selectedDayCheckins.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Buscar por nombre, reserva, hab., calle o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({selectedDayCheckins.length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeFilter === 'pending' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sin Habitación ({pendingCount})
              </button>
              <button
                onClick={() => setActiveFilter('assigned')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeFilter === 'assigned' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Asignadas ({assignedCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/90 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 whitespace-nowrap">Fecha / Hora</th>
                  <th className="p-4 whitespace-nowrap">Nº Reserva</th>
                  <th className="p-4 whitespace-nowrap">Hab.</th>
                  <th className="p-4 whitespace-nowrap">Huésped</th>
                  <th className="p-4 whitespace-nowrap">Calle</th>
                  <th className="p-4 whitespace-nowrap">Nº / Piso</th>
                  <th className="p-4 whitespace-nowrap">C.P.</th>
                  <th className="p-4 whitespace-nowrap">Población</th>
                  <th className="p-4 whitespace-nowrap">País</th>
                  <th className="p-4 whitespace-nowrap">Teléfono</th>
                  <th className="p-4 whitespace-nowrap">Email</th>
                  <th className="p-4 whitespace-nowrap text-center sticky right-0 bg-slate-950/95 backdrop-blur-md border-l border-slate-800 w-16 shadow-lg">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCheckins.map((c) => {
                  const isEditing = editingId === c.id;

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleString('es-ES')}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.booking_reference}
                            onChange={(e) => setEditForm({ ...editForm, booking_reference: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            placeholder="Reserva"
                            className="w-28 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-mono text-amber-300 focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono text-xs text-amber-300 font-semibold">
                            {c.booking_reference || 'Sin Asignar'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.room_number}
                            onChange={(e) => setEditForm({ ...editForm, room_number: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            placeholder="Hab."
                            className="w-20 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-bold text-amber-400 focus:outline-none"
                          />
                        ) : (
                          <span
                            className={`font-black text-xs px-2 py-1 rounded-md ${
                              c.room_number
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {c.room_number ? `Hab. ${c.room_number}` : 'S/A'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.full_name}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-36 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-white focus:outline-none"
                          />
                        ) : (
                          c.full_name
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-300 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.street}
                            onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-32 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                          />
                        ) : (
                          c.street
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-300 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.street_number}
                            onChange={(e) => setEditForm({ ...editForm, street_number: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-16 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                          />
                        ) : (
                          c.street_number
                        )}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.postal_code}
                            onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-20 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-mono text-slate-200 focus:outline-none"
                          />
                        ) : (
                          c.postal_code
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-300 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.city}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-28 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                          />
                        ) : (
                          c.city
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.country}
                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-24 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                          />
                        ) : (
                          c.country
                        )}
                      </td>
                      <td className="p-4 text-xs font-mono whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-28 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-mono text-slate-200 focus:outline-none"
                          />
                        ) : (
                          c.phone
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, c.id, editForm.full_name)}
                            className="w-40 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                          />
                        ) : (
                          c.email
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap sticky right-0 bg-slate-900 group-hover:bg-slate-850/90 border-l border-slate-800 shadow-md">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSave(c.id, editForm.full_name)}
                              disabled={saving}
                              title="Guardar cambios (Enter)"
                              className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              title="Cancelar (Esc)"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(c)}
                            title="Editar fila completa"
                            className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700/80 hover:border-amber-500/50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredCheckins.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-12 text-center text-slate-500 text-sm">
                      No hay registros de check-in para el día seleccionado ({workDay}).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}