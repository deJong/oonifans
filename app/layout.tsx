import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OoniFans. The gallery.',
  description: 'Real Ooni pizzas, submitted by people who take this way too seriously.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
