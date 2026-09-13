export interface ImageFileItem {
  id: string;
  file: File;
  previewUrl: string;
  originalName: string;
  originalBaseName: string;
  extension: string;
  size: number;
  lastModified: number;
  dimensions?: {
    width: number;
    height: number;
  };
  newName: string;
  status: 'ready' | 'duplicate' | 'error';
  errorMessage?: string;
  selected: boolean;
}

export type RenameMode = 'standard' | 'pattern';

export type SeparatorType = '-' | '_' | ' ' | '' | '.' | 'custom';

export type CaseTransform = 'none' | 'lowercase' | 'uppercase' | 'titlecase';

export interface RenameConfig {
  mode: RenameMode;
  // Standard mode options
  baseName: string;
  startNumber: number;
  numberPadding: number; // e.g. 1, 2, 3, 4 -> 1, 01, 001, 0001
  separator: string;
  
  // Custom Pattern mode
  pattern: string; // e.g. "{name}-{number}", "{date}_{name}"

  // Advanced options
  prefix: string;
  suffix: string;
  findText: string;
  replaceText: string;
  caseTransform: CaseTransform;
  removeSpaces: boolean;
  removeSpecialChars: boolean;
  preserveExtension: boolean;
  customExtension: string;
  autoResolveDuplicates: boolean;
}

export type SortField = 'order' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'type';

export interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}
