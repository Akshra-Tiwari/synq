import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider }   from '../providers/AuthProvider';
import { SocketProvider } from '../providers/SocketProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono  = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title:       { default: 'Synq', template: '%s · Synq' },
  description: 'Synq — the professional network built exclusively for developers.',
  keywords:    ['developers', 'networking', 'programming', 'projects', 'career'],
  authors:     [{ name: 'Synq' }],
  icons: {
    icon:     [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple:    '/favicon.svg',
  },
  openGraph: {
    title:       'Synq',
    description: 'The professional network built exclusively for developers.',
    type:        'website',
    siteName:    'Synq',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Synq',
    description: 'The professional network built exclusively for developers.',
  },
};

export const viewport: Viewport = {
  themeColor:    '#01796F',
  width:         'device-width',
  initialScale:  1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans" style={{ background: '#0E1A13', color: '#E2EBE4' }}>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
