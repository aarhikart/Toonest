import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to PDF Converter - Convert JPG Images to PDF',
  description:
    'Convert JPG images to PDF online. Combine multiple JPG images into one PDF, arrange pages, customize page size and download instantly.',
  keywords: [
    'jpg to pdf',
    'convert jpg to pdf',
    'jpg to pdf converter',
    'jpeg to pdf',
    'combine jpg into pdf',
    'merge images to pdf',
    'photos to pdf',
    'online jpg to pdf',
    'free jpg to pdf converter',
  ],
};

export default function JpgToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
