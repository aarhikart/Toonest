import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZIP Extractor - Extract ZIP Files Online',
  description:
    'Open and extract ZIP files directly in your browser. Browse folders, preview files, select what you need, and download extracted files without uploading your archive.',
  keywords: [
    'zip extractor',
    'extract zip online',
    'unzip online',
    'open zip file',
    'preview zip contents',
    'in-browser unzip',
    'selective zip extraction',
  ],
};

export default function ZipExtractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
