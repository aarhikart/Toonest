import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to PNG Converter - Convert PDF Pages to PNG Online',
  description:
    'Convert PDF pages to lossless, high-quality PNG images online with transparent background support. Fast, secure, and 100% private in-browser conversion.',
  keywords: [
    'pdf to png',
    'convert pdf to png',
    'pdf to png converter',
    'pdf to png transparent',
    'convert pdf pages to png',
    'extract png from pdf',
    'pdf to png high quality',
    'lossless pdf to png',
    'online pdf to png',
  ],
};

export default function PdfToPngLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
