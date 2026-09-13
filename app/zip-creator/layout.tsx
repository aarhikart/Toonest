import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZIP Creator - Create ZIP Files Online',
  description:
    'Create ZIP files from multiple files and folders. Organize, rename, compress, and download your files as a single ZIP archive directly in your browser.',
  keywords: [
    'zip creator',
    'create zip online',
    'make zip file',
    'compress folder online',
    'bulk zip',
    'deflate compression',
    'browser zip archive',
  ],
};

export default function ZipCreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
