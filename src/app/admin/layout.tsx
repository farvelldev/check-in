import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Recepción | Gestión de Check-ins',
  description: 'Acceso privado para el personal de recepción.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}