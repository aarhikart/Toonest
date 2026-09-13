export interface MetadataField {
  key: string;
  label: string;
  value: string | number;
  isSensitive?: boolean;
  category?: string;
  description?: string;
}

export interface GpsMetadata {
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  latDms?: string;
  lngDms?: string;
  altitude?: string;
  direction?: string;
  timestamp?: string;
  mapUrl?: string;
}

export interface PhotoCaptureSettings {
  iso?: string;
  shutterSpeed?: string;
  aperture?: string;
  focalLength?: string;
  focalLength35mm?: string;
  exposureCompensation?: string;
  exposureProgram?: string;
  meteringMode?: string;
  whiteBalance?: string;
  flash?: string;
  digitalZoom?: string;
}

export interface ImageMetadataItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  width: number;
  height: number;
  aspectRatio: string;
  pixelCount: string;
  format: string;

  // Processing state
  status: 'loading' | 'success' | 'limited' | 'none' | 'error';
  errorMessage?: string;

  // Categorized Metadata
  fileInfo: MetadataField[];
  imageInfo: MetadataField[];
  exifData: MetadataField[];
  camera: MetadataField[];
  lens: MetadataField[];
  captureSettings: PhotoCaptureSettings;
  dateTime: MetadataField[];
  gps: GpsMetadata;
  software: MetadataField[];
  colorInfo: MetadataField[];
  advanced: MetadataField[];

  // Raw parsed dictionary
  rawTags: Record<string, any>;

  // Counts & Summaries
  counts: {
    totalFields: number;
    exifFields: number;
    hasGps: boolean;
    hasCamera: boolean;
  };

  // Privacy Warnings
  privacyNotices: string[];

  // Selection for bulk operations
  selected: boolean;
}
