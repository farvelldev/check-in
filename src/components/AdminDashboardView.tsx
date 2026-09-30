'use client';

import type { KeyboardEvent } from 'react';
import type {
  AdminToast,
  Checkin,
  CheckinEditForm,
  CheckinFilter,
} from '@/types/checkin';

interface AdminDashboardViewProps {
  workDay: string;
  onWorkDayChange: (value: string) => void;
  onExport: () => void;
  onLogout: () => void;
  toasts: AdminToast[];
  pendingCount: number;
  assignedCount: number;
  totalCount: number;
  loadError: string | null;
  onRetry: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: CheckinFilter;
  onFilterChange: (filter: CheckinFilter) => void;
  checkins: Checkin[];
  editingId: string | null;
  editForm: CheckinEditForm;
  onEditFormChange: (field: keyof CheckinEditForm, value: string) => void;
  saving: boolean;
  onSave: (id: string, name: string) => void;
  onCancelEditing: () => void;
  onStartEditing: (checkin: Checkin) => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    id: string,
    name: string,
  ) => void;
}

interface EditableInputProps {
  checkin: Checkin;
  field: keyof CheckinEditForm;
  editForm: CheckinEditForm;
  onEditFormChange: AdminDashboardViewProps['onEditFormChange'];
  onKeyDown: AdminDashboardViewProps['onKeyDown'];
  className: string;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

function EditableInput({
  checkin,
  field,
  editForm,
  onEditFormChange,
  onKeyDown,
  className,
  type = 'text',
  placeholder,
  autoFocus,
}: EditableInputProps) {
  return (
    <input
      type={type}
      value={editForm[field]}
      onChange={(event) => onEditFormChange(field, event.target.value)}
      onKeyDown={(event) => onKeyDown(event, checkin.id, editForm.full_name)}
      placeholder={placeholder}
      className={className}
      autoFocus={autoFocus}
    />
  );
}

function ToastStack({ toasts }: { toasts: AdminToast[] }) {
  return (
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
  );
}

function DashboardHeader({
  workDay,
  onWorkDayChange,
  onExport,
  onLogout,
}: Pick<AdminDashboardViewProps, 'workDay' | 'onWorkDayChange' | 'onExport' | 'onLogout'>) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
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
        <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
          <span className="text-xs font-bold text-slate-400">Día de Trabajo:</span>
          <input
            type="date"
            value={workDay}
            onChange={(event) => onWorkDayChange(event.target.value)}
            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
          />
        </label>

        <button
          type="button"
          onClick={onExport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          Exportar CSV ({workDay})
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

function DashboardStats({
  workDay,
  pendingCount,
  assignedCount,
  totalCount,
}: Pick<
  AdminDashboardViewProps,
  'workDay' | 'pendingCount' | 'assignedCount' | 'totalCount'
>) {
  const stats = [
    { label: `Pendientes Hab. (${workDay})`, value: pendingCount, className: 'text-rose-400' },
    { label: `Asignadas (${workDay})`, value: assignedCount, className: 'text-emerald-400' },
    { label: `Total Entradas (${workDay})`, value: totalCount, className: 'text-white' },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
          <p className={`text-3xl font-black mt-1 ${stat.className}`}>{stat.value}</p>
        </div>
      ))}
    </section>
  );
}

function CheckinsTable({
  workDay,
  pendingCount,
  assignedCount,
  totalCount,
  loadError,
  onRetry,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  checkins,
  editingId,
  editForm,
  onEditFormChange,
  saving,
  onSave,
  onCancelEditing,
  onStartEditing,
  onKeyDown,
}: Pick<
  AdminDashboardViewProps,
  | 'workDay'
  | 'pendingCount'
  | 'assignedCount'
  | 'totalCount'
  | 'loadError'
  | 'onRetry'
  | 'search'
  | 'onSearchChange'
  | 'activeFilter'
  | 'onFilterChange'
  | 'checkins'
  | 'editingId'
  | 'editForm'
  | 'onEditFormChange'
  | 'saving'
  | 'onSave'
  | 'onCancelEditing'
  | 'onStartEditing'
  | 'onKeyDown'
>) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {loadError && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-rose-900/70 bg-rose-950/40 text-sm text-rose-200">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={onRetry}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-rose-700 hover:bg-rose-900/60 font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Buscar por nombre, reserva, hab., calle o ciudad..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full md:w-80 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          <FilterButton
            filter="all"
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            activeClass="bg-amber-500 text-slate-950 shadow"
            count={totalCount}
          >
            Todos
          </FilterButton>
          <FilterButton
            filter="pending"
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            activeClass="bg-rose-500 text-white shadow"
            count={pendingCount}
          >
            Sin Habitación
          </FilterButton>
          <FilterButton
            filter="assigned"
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            activeClass="bg-emerald-500 text-slate-950 shadow"
            count={assignedCount}
          >
            Asignadas
          </FilterButton>
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
            {checkins.map((checkin) => {
              const isEditing = editingId === checkin.id;
              const inputProps = {
                checkin,
                editForm,
                onEditFormChange,
                onKeyDown,
              };

              return (
                <tr key={checkin.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {new Date(checkin.created_at).toLocaleString('es-ES')}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {isEditing ? (
                      <EditableInput
                        {...inputProps}
                        field="booking_reference"
                        placeholder="Reserva"
                        autoFocus
                        className="w-28 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-mono text-amber-300 focus:outline-none"
                      />
                    ) : (
                      <span className="font-mono text-xs text-amber-300 font-semibold">
                        {checkin.booking_reference || 'Sin Asignar'}
                      </span>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {isEditing ? (
                      <EditableInput
                        {...inputProps}
                        field="room_number"
                        placeholder="Hab."
                        className="w-20 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-bold text-amber-400 focus:outline-none"
                      />
                    ) : (
                      <span
                        className={`font-black text-xs px-2 py-1 rounded-md ${
                          checkin.room_number
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {checkin.room_number ? `Hab. ${checkin.room_number}` : 'S/A'}
                      </span>
                    )}
                  </td>
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="full_name"
                    value={checkin.full_name}
                    cellClassName="p-4 whitespace-nowrap font-bold text-white"
                    inputClassName="w-36 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-white focus:outline-none"
                  />
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="street"
                    value={checkin.street}
                    cellClassName="p-4 text-xs text-slate-300 whitespace-nowrap"
                    inputClassName="w-32 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                  />
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="street_number"
                    value={checkin.street_number}
                    cellClassName="p-4 text-xs text-slate-300 whitespace-nowrap"
                    inputClassName="w-16 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                  />
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="postal_code"
                    value={checkin.postal_code}
                    cellClassName="p-4 text-xs font-mono text-slate-400 whitespace-nowrap"
                    inputClassName="w-20 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-mono text-slate-200 focus:outline-none"
                  />
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="city"
                    value={checkin.city}
                    cellClassName="p-4 text-xs text-slate-300 whitespace-nowrap"
                    inputClassName="w-28 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                  />
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="country"
                    value={checkin.country}
                    cellClassName="p-4 text-xs text-slate-400 whitespace-nowrap"
                    inputClassName="w-24 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                  />
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="phone"
                    value={checkin.phone}
                    cellClassName="p-4 text-xs font-mono whitespace-nowrap"
                    inputClassName="w-28 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs font-mono text-slate-200 focus:outline-none"
                  />
                  <EditableCell
                    isEditing={isEditing}
                    checkin={checkin}
                    inputProps={inputProps}
                    field="email"
                    value={checkin.email}
                    cellClassName="p-4 text-xs text-slate-400 whitespace-nowrap"
                    inputClassName="w-40 px-2 py-1 bg-slate-950 border border-amber-500/80 rounded text-xs text-slate-200 focus:outline-none"
                    inputType="email"
                  />
                  <td className="p-4 text-center whitespace-nowrap sticky right-0 bg-slate-900 group-hover:bg-slate-850/90 border-l border-slate-800 shadow-md">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSave(checkin.id, editForm.full_name)}
                          disabled={saving}
                          title="Guardar cambios (Enter)"
                          className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEditing}
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
                        type="button"
                        onClick={() => onStartEditing(checkin)}
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
            {checkins.length === 0 && !loadError && (
              <tr>
                <td colSpan={12} className="p-12 text-center text-slate-500 text-sm">
                  No hay registros que coincidan con los filtros para el día seleccionado ({workDay}).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface FilterButtonProps {
  filter: CheckinFilter;
  activeFilter: CheckinFilter;
  onFilterChange: (filter: CheckinFilter) => void;
  activeClass: string;
  count: number;
  children: string;
}

function FilterButton({
  filter,
  activeFilter,
  onFilterChange,
  activeClass,
  count,
  children,
}: FilterButtonProps) {
  const isActive = activeFilter === filter;

  return (
    <button
      type="button"
      onClick={() => onFilterChange(filter)}
      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
        isActive ? activeClass : 'text-slate-400 hover:text-white'
      }`}
    >
      {children} ({count})
    </button>
  );
}

interface EditableCellProps {
  isEditing: boolean;
  checkin: Checkin;
  inputProps: Omit<EditableInputProps, 'field' | 'className' | 'type' | 'placeholder' | 'autoFocus'>;
  field: keyof CheckinEditForm;
  value: string;
  cellClassName: string;
  inputClassName: string;
  inputType?: string;
}

function EditableCell({
  isEditing,
  checkin,
  inputProps,
  field,
  value,
  cellClassName,
  inputClassName,
  inputType,
}: EditableCellProps) {
  return (
    <td className={cellClassName}>
      {isEditing ? (
        <EditableInput
          {...inputProps}
          checkin={checkin}
          field={field}
          type={inputType}
          className={inputClassName}
        />
      ) : (
        value
      )}
    </td>
  );
}

export default function AdminDashboardView(props: AdminDashboardViewProps) {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <ToastStack toasts={props.toasts} />

      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader
          workDay={props.workDay}
          onWorkDayChange={props.onWorkDayChange}
          onExport={props.onExport}
          onLogout={props.onLogout}
        />
        <DashboardStats
          workDay={props.workDay}
          pendingCount={props.pendingCount}
          assignedCount={props.assignedCount}
          totalCount={props.totalCount}
        />
        <CheckinsTable {...props} />
      </div>
    </div>
  );
}
