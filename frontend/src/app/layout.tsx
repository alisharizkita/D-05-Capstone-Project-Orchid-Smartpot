import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orchid Monitoring System',
  description: 'Sistem monitoring anggrek otomatis dengan sensor IoT',
  keywords: 'orchid, monitoring, IoT, sensor, anggrek',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}