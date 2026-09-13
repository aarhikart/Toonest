import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG Converter - Convert PDF Pages to JPG Online',
  description:
    'Convert PDF pages to high-quality JPG images online. Convert all pages or selected pages directly in your browser.',
  keywords: [
    'pdf to jpg',
    'convert pdf to jpg',
    'pdf to jpg converter',
    'pdf to image',
    'convert pdf pages to jpg',
    'extract images from pdf',
    'pdf to jpg high quality',
    'online pdf converter',
    'free pdf to jpg',
  ],
};

export default function PdfToJpgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
