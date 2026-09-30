export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-sm">
            H
          </div>
          <div>
            <span className="font-semibold text-sm tracking-wide block leading-none">
              Gestión de Recepción
            </span>
            <span className="text-[10px] text-slate-400">Sistema Independiente de Captura</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En línea (HTTPS)
          </span>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}