export type CompressionLevel = 'STORE' | 'FAST' | 'BALANCED' | 'MAXIMUM';
export type DuplicateStrategy = 'auto-rename' | 'keep-folders' | 'ask';
export type FileCategory = 'all' | 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'spreadsheet' | 'archive' | 'code' | 'other';
export type SortOption = 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'type' | 'date';

export interface ZipFileItem {
  id: string;
  file: File;
  name: string;             // current filename inside zip (e.g. "photo.jpg")
  originalName: string;     // original uploaded filename
  folderPath: string;       // relative path e.g. "" for root or "images/subfolder"
  size: number;
  type: string;             // MIME type
  category: FileCategory;
  lastModified: number;
  status: 'ready' | 'processing' | 'error';
  error?: string;
}

export interface ZipFolderItem {
  path: string;             // normalized relative folder path, e.g. "documents" or "assets/icons"
  name: string;             // basename e.g. "icons"
  isExplicit: boolean;      // explicitly created by user (persisted even if empty)
}

export interface ZipCreatorConfig {
  zipName: string;
  compressionLevel: CompressionLevel;
  includeEmptyFolders: boolean;
  comment: string;
  duplicateStrategy: DuplicateStrategy;
}

export interface BulkRenameConfig {
  pattern: string;          // e.g. "project-{number}" or "{name}-{date}"
  startNumber: number;
  padding: number;          // e.g. 3 -> "001"
  targetScope: 'all' | 'selected';
}

export interface ZipProgressInfo {
  percent: number;
  currentFile: string;
  processedCount: number;
  totalCount: number;
  currentBytes?: number;
}

export interface ZipResult {
  blob: Blob;
  filename: string;
  originalTotalSize: number;
  zipSize: number;
  savedPercentage: number;
  fileCount: number;
  folderCount: number;
  downloadUrl: string;
}

export interface FolderTreeNode {
  path: string;             // "" for root
  name: string;             // "Root" or folder name
  fileCount: number;
  totalSize: number;
  isExplicit: boolean;
  children: FolderTreeNode[];
}

export interface HistorySnapshot {
  files: ZipFileItem[];
  folders: ZipFolderItem[];
  description: string;
}
