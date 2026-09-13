export type FileCategory =
  | 'all'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'pdf'
  | 'spreadsheet'
  | 'archive'
  | 'code'
  | 'other';

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'size-asc'
  | 'size-desc'
  | 'type'
  | 'folder'
  | 'original';

export interface ZipEntryItem {
  id: string;
  name: string;             // clean base filename (e.g. "report.pdf")
  path: string;             // normalized relative path (e.g. "docs/report.pdf")
  folderPath: string;       // parent folder (e.g. "docs" or "" for root)
  isDirectory: boolean;
  uncompressedSize: number;
  compressedSize?: number;
  date: Date;
  category: FileCategory;
  isEncrypted: boolean;
  comment?: string;
}

export interface ArchiveMetadata {
  filename: string;
  archiveSize: number;
  fileCount: number;
  folderCount: number;
  totalUncompressedSize: number;
  compressionRatio: number; // percentage saved
  isEncrypted: boolean;
  isSuspiciousBomb: boolean;
  comment?: string;
}

export interface ExtractionProgress {
  percent: number;
  currentFile: string;
  completedCount: number;
  totalCount: number;
}

export interface FolderNode {
  path: string;             // "" for root
  name: string;
  fileCount: number;
  folderCount: number;
  totalSize: number;
  children: FolderNode[];
}
