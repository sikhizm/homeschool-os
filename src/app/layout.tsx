import '@neondatabase/auth-ui/css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppNavigation from '@/components/app-navigation';
import { PwaRegistration } from '@/components/pwa-tools';

export const metadata: Metadata = {
  title: 'Homeschool OS',
  description: 'A calm, parent-guided learning space for your family.',
  applicationName: 'Homeschool OS',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Homeschool OS',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#16664b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegistration />
        <AppNavigation />
        {children}
      </body>
    </html>
  );
}
