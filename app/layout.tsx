import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://toonest.vercel.app'),
  title: {
    default: 'ToolNest — High-Speed WhatsApp Marketing, Tools & Automation Suite',
    template: '%s | ToolNest',
  },
  description:
    'ToolNest provides ultra-fast WhatsApp Web marketing, auto-campaign delivery, media attachments, direct link previews, and free online productivity tools.',
  keywords: [
    'whatsapp marketing',
    'whatsapp web automation',
    'bulk message sender',
    'whatsapp tools',
    'toolnest',
    'bulk image rename',
    'online tools',
  ],
  authors: [{ name: 'ToolNest' }],
  openGraph: {
    title: 'ToolNest — High-Speed WhatsApp Marketing & Online Tools Suite',
    description: 'Send high-speed WhatsApp messages with rich clickable links, media attachments, and automated campaigns with ToolNest.',
    url: 'https://toonest.vercel.app',
    siteName: 'ToolNest',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolNest — WhatsApp Marketing & Online Tools',
    description: 'Send high-speed WhatsApp messages with rich clickable links and automated campaigns.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-loader"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('toolnest_theme');
                const isDefaultDarkPage = window.location.pathname.startsWith('/whatsapp-marketing') || window.location.pathname.startsWith('/whatsapp-number-checker') || window.location.pathname.startsWith('/video-cutter') || window.location.pathname === '/';
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (storedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  // Default is dark on /whatsapp-marketing, /video-cutter, etc., light on other pages
                  if (isDefaultDarkPage) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FBFBFC] text-[#1E2028] dark:bg-[#0c0e14] dark:text-[#E2E5EC] transition-colors duration-200 selection:bg-[#5722AF]/20 selection:text-[#5722AF] dark:selection:bg-[#7B45D1]/30 dark:selection:text-[#9B6BE8]">
        {children}
      </body>
    </html>
  );
}
