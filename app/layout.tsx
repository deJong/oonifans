import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OoniFans. The gallery.',
  description: 'Exclusive pizza content from Ooni creators. 100% SFW. A Stuurmen Branding Agency project.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'OoniFans. Strictly For Wood-fire.',
    description: 'Exclusive pizza content from Ooni creators. 100% SFW. A Stuurmen Branding Agency project.',
    url: 'https://oonifans.com',
    siteName: 'OoniFans',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'OoniFans. Strictly For Wood-fire.',
    description: 'Exclusive pizza content from Ooni creators. 100% SFW. A Stuurmen Branding Agency project.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Cloudflare Web Analytics — free, no cookies, no GDPR issues */}
        {/* Replace TOKEN with your Cloudflare analytics token after adding the site at dash.cloudflare.com/web-analytics */}
        {process.env.CF_ANALYTICS_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${process.env.CF_ANALYTICS_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  );
}
