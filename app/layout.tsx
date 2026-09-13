import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Image Bulk Rename Images — Fast, Private Bulk Image Renaming in Your Browser',
  description:
    'Rename hundreds of images in seconds directly in your browser. Complete privacy with 100% client-side file processing, custom patterns, live preview, duplicate protection, and instant ZIP download.',
  keywords: [
    'bulk image rename',
    'image rename online',
    'rename images in bulk',
    'batch image rename',
    'photo renamer',
    'client side image rename',
    'fast image rename',
  ],
  authors: [{ name: 'ToolNest' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('toolnest_theme');
                // Default is light unless explicitly set to dark
                if (storedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
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
