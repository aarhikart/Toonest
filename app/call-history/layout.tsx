import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Call History Analyzer — View, Search & Analyze Call Logs | ToolNest',
  description:
    'Securely view, search, filter and analyze your authorized call history data completely client-side in your browser. 100% private, no server upload, no carrier scraping.',
};

export default function CallHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
