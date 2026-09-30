'use client';

import {
  useEffect,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardView from '@/components/AdminDashboardView';
import { formatLocalDate, serializeCsv } from '@/lib/checkinCsv';
import { filterCheckins, getCheckinsForDay } from '@/lib/checkinFilters';
import { supabase } from '@/lib/supabase';
import type {
  AdminToast,
  Checkin,
  CheckinEditForm,
  CheckinFilter,
} from '@/types/checkin';

type ToastSetter = Dispatch<SetStateAction<AdminToast[]>>;

const fetchCheckins = async (): Promise<Checkin[]> => {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

const addToast = (
  setToasts: ToastSetter,
  message: string,
  type: AdminToast['type'] = 'success',
) => {
  const id = Date.now();
  setToasts((previous) => [...previous, { id, message, type }]);
  window.setTimeout(() => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, 4000);
};

const createEmptyEditForm = (): CheckinEditForm => ({
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

const loadErrorMessage = 'No se pudieron cargar los registros. Revisa la conexión e inténtalo de nuevo.';

export default function AdminDashboardController() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<CheckinFilter>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CheckinEditForm>(createEmptyEditForm);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const router = useRouter();
  const [workDay, setWorkDay] = useState(() => formatLocalDate(new Date()));

  const showToast = (message: string, type: AdminToast['type'] = 'success') => {
    addToast(setToasts, message, type);
  };

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const initializeDashboard = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          router.replace('/admin/login');
          return;
        }
      } catch (error) {
        console.error('Error comprobando la sesión:', error);
        if (isMounted) router.replace('/admin/login');
        return;
      }

      if (!isMounted) return;

      try {
        setCheckins(await fetchCheckins());
        setLoadError(null);
      } catch (error) {
        console.error('Error cargando check-ins:', error);
        if (isMounted) setLoadError(loadErrorMessage);
      } finally {
        if (isMounted) setLoading(false);
      }

      if (!isMounted) return;

      channel = supabase
        .channel('checkins-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'checkins' },
          (payload) => {
            const newCheckin = payload.new as Checkin;
            setCheckins((previous) => [
              newCheckin,
              ...previous.filter((checkin) => checkin.id !== newCheckin.id),
            ]);
            addToast(setToasts, `Nuevo check-in: ${newCheckin.full_name}`);
          },
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'checkins' },
          (payload) => {
            const updatedCheckin = payload.new as Checkin;
            setCheckins((previous) =>
              previous.map((checkin) =>
                checkin.id === updatedCheckin.id ? updatedCheckin : checkin,
              ),
            );
          },
        )
        .subscribe();
    };

    void initializeDashboard();

    return () => {
      isMounted = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [router]);

  const retryFetchCheckins = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      setCheckins(await fetchCheckins());
    } catch (error) {
      console.error('Error cargando check-ins:', error);
      setLoadError(loadErrorMessage);
    } finally {
      setLoading(false);
    }
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

    try {
      const { error } = await supabase
        .from('checkins')
        .update(editForm)
        .eq('id', id);

      if (error) throw error;
      setCheckins((previous) =>
        previous.map((checkin) =>
          checkin.id === id ? { ...checkin, ...editForm } : checkin,
        ),
      );
      setEditingId(null);
      showToast(`Registro de ${editForm.full_name || name} actualizado`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      showToast(`Error al actualizar: ${message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    id: string,
    name: string,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave(id, name);
    } else if (event.key === 'Escape') {
      setEditingId(null);
    }
  };

  const exportToCSV = () => {
    const selectedDayCheckins = getCheckinsForDay(checkins, workDay);
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
      'Email',
    ];

    const rows = selectedDayCheckins.map((checkin) => [
      new Date(checkin.created_at).toLocaleString('es-ES'),
      checkin.booking_reference || '',
      checkin.room_number || '',
      checkin.full_name || '',
      checkin.street || '',
      checkin.street_number || '',
      checkin.postal_code || '',
      checkin.city || '',
      checkin.country || '',
      checkin.phone || '',
      checkin.email || '',
    ]);
    const csvContent = `\uFEFF${serializeCsv(headers, rows)}`;
    const fileUrl = URL.createObjectURL(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.setAttribute('href', fileUrl);
    link.setAttribute('download', `checkins_${workDay}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 0);
  };

  const selectedDayCheckins = getCheckinsForDay(checkins, workDay);
  const pendingCount = selectedDayCheckins.filter((checkin) => !checkin.room_number).length;
  const assignedCount = selectedDayCheckins.length - pendingCount;
  const filteredCheckins = filterCheckins(selectedDayCheckins, search, activeFilter);

  if (loading) {
    return <div className="p-8 text-center text-white">Cargando panel de administración...</div>;
  }

  return (
    <AdminDashboardView
      workDay={workDay}
      onWorkDayChange={setWorkDay}
      onExport={exportToCSV}
      onLogout={handleLogout}
      toasts={toasts}
      pendingCount={pendingCount}
      assignedCount={assignedCount}
      totalCount={selectedDayCheckins.length}
      loadError={loadError}
      onRetry={retryFetchCheckins}
      search={search}
      onSearchChange={setSearch}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      checkins={filteredCheckins}
      editingId={editingId}
      editForm={editForm}
      onEditFormChange={(field, value) =>
        setEditForm((currentForm) => ({ ...currentForm, [field]: value }))
      }
      saving={saving}
      onSave={handleSave}
      onCancelEditing={() => setEditingId(null)}
      onStartEditing={startEditing}
      onKeyDown={handleKeyDown}
    />
  );
}
