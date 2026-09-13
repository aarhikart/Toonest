import ExifReader from 'exifreader';
import {
  ImageMetadataItem,
  MetadataField,
  GpsMetadata,
  PhotoCaptureSettings,
} from './metadataTypes';
import { formatBytes, getImageDimensions, parseFileName } from './renameEngine';

/**
 * Calculates Greatest Common Divisor for aspect ratio
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function calculateAspectRatio(w: number, h: number): string {
  if (!w || !h) return 'Unknown';
  const divisor = gcd(w, h);
  const rw = w / divisor;
  const rh = h / divisor;

  const decimal = w / h;
  if (Math.abs(decimal - 16 / 9) < 0.02) return '16:9';
  if (Math.abs(decimal - 9 / 16) < 0.02) return '9:16';
  if (Math.abs(decimal - 4 / 3) < 0.02) return '4:3';
  if (Math.abs(decimal - 3 / 4) < 0.02) return '3:4';
  if (Math.abs(decimal - 3 / 2) < 0.02) return '3:2';
  if (Math.abs(decimal - 2 / 3) < 0.02) return '2:3';
  if (Math.abs(decimal - 1) < 0.02) return '1:1';

  return `${rw}:${rh}`;
}

/**
 * Converts decimal coordinates to Degrees, Minutes, Seconds (DMS) string
 */
function toDms(coordinate: number, isLatitude: boolean): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  let direction = '';
  if (isLatitude) {
    direction = coordinate >= 0 ? 'N' : 'S';
  } else {
    direction = coordinate >= 0 ? 'E' : 'W';
  }

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Parses all available metadata from a user-uploaded image file
 */
export async function parseImageMetadata(file: File): Promise<ImageMetadataItem> {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const previewUrl = URL.createObjectURL(file);
  const { extension } = parseFileName(file.name);

  // Fallback dimensions from image decoding
  let imageW = 0;
  let imageH = 0;
  try {
    const dims = await getImageDimensions(previewUrl);
    imageW = dims.width;
    imageH = dims.height;
  } catch (e) {}

  let rawTags: any = {};
  let expandedTags: any = {};

  try {
    const buffer = await file.arrayBuffer();
    // Load with expanded: true to get categorized groups
    expandedTags = await ExifReader.load(buffer, { expanded: true });
    // Also load flat tags for fast lookups
    rawTags = await ExifReader.load(buffer);
  } catch (err: any) {
    // Some files (like plain SVGs or stripped images) may not contain EXIF
  }

  const getTagDesc = (name: string): string | undefined => {
    if (rawTags[name]) {
      return String(rawTags[name].description || rawTags[name].value || '');
    }
    return undefined;
  };

  // Dimensions & Pixels
  const parsedW =
    Number(getTagDesc('Image Width') || getTagDesc('PixelXDimension')) || imageW;
  const parsedH =
    Number(getTagDesc('Image Height') || getTagDesc('PixelYDimension')) || imageH;

  const totalPixels = parsedW * parsedH;
  const pixelCountStr =
    totalPixels > 0 ? `${(totalPixels / 1_000_000).toFixed(1)} MP` : 'Unknown';
  const ratioStr = calculateAspectRatio(parsedW, parsedH);

  // Categorized Arrays
  const fileInfo: MetadataField[] = [
    { key: 'Filename', label: 'Filename', value: file.name },
    { key: 'Extension', label: 'File Extension', value: extension ? `.${extension}` : 'Unknown' },
    { key: 'MimeType', label: 'MIME Type', value: file.type || `image/${extension}` },
    { key: 'FileSizeFormatted', label: 'File Size', value: formatBytes(file.size) },
    { key: 'FileSizeBytes', label: 'Size in Bytes', value: `${file.size.toLocaleString()} bytes` },
    {
      key: 'LastModified',
      label: 'File Last Modified',
      value: new Date(file.lastModified).toLocaleString(),
    },
  ];

  const imageInfo: MetadataField[] = [
    { key: 'Dimensions', label: 'Dimensions', value: `${parsedW} × ${parsedH} px` },
    { key: 'Width', label: 'Width', value: `${parsedW} px` },
    { key: 'Height', label: 'Height', value: `${parsedH} px` },
    { key: 'AspectRatio', label: 'Aspect Ratio', value: ratioStr },
    { key: 'PixelCount', label: 'Pixel Count', value: pixelCountStr },
  ];

  if (getTagDesc('Color Space')) {
    imageInfo.push({ key: 'ColorSpace', label: 'Color Space', value: getTagDesc('Color Space')! });
  }
  if (getTagDesc('Bits Per Sample')) {
    imageInfo.push({ key: 'BitDepth', label: 'Bit Depth', value: `${getTagDesc('Bits Per Sample')} bits` });
  }
  if (getTagDesc('Color Components')) {
    imageInfo.push({ key: 'Channels', label: 'Color Channels', value: getTagDesc('Color Components')! });
  }
  if (getTagDesc('Orientation')) {
    imageInfo.push({ key: 'Orientation', label: 'EXIF Orientation', value: getTagDesc('Orientation')! });
  }
  if (getTagDesc('Compression')) {
    imageInfo.push({ key: 'Compression', label: 'Compression Method', value: getTagDesc('Compression')! });
  }

  // EXIF Metadata
  const exifData: MetadataField[] = [];
  const captureSettings: PhotoCaptureSettings = {};
  const privacyNotices: string[] = [];

  // Photography Capture Settings
  const isoVal = getTagDesc('ISOSpeedRatings') || getTagDesc('PhotographicSensitivity') || getTagDesc('ISO');
  if (isoVal) {
    captureSettings.iso = `ISO ${isoVal}`;
    exifData.push({ key: 'ISO', label: 'ISO Sensitivity', value: `ISO ${isoVal}` });
  }

  const shutterVal = getTagDesc('ExposureTime') || getTagDesc('ShutterSpeedValue');
  if (shutterVal) {
    const formattedShutter = shutterVal.includes('sec') ? shutterVal : `${shutterVal} sec`;
    captureSettings.shutterSpeed = formattedShutter;
    exifData.push({ key: 'ShutterSpeed', label: 'Shutter Speed', value: formattedShutter });
  }

  const apertureVal = getTagDesc('FNumber') || getTagDesc('ApertureValue');
  if (apertureVal) {
    const formattedAperture = apertureVal.startsWith('f/') ? apertureVal : `f/${apertureVal}`;
    captureSettings.aperture = formattedAperture;
    exifData.push({ key: 'Aperture', label: 'Aperture (F-Stop)', value: formattedAperture });
  }

  const focalVal = getTagDesc('FocalLength');
  if (focalVal) {
    captureSettings.focalLength = focalVal.includes('mm') ? focalVal : `${focalVal} mm`;
    exifData.push({ key: 'FocalLength', label: 'Focal Length', value: captureSettings.focalLength });
  }

  const focal35Val = getTagDesc('FocalLengthIn35mmFilm');
  if (focal35Val) {
    captureSettings.focalLength35mm = `${focal35Val} mm`;
    exifData.push({ key: 'FocalLength35mm', label: '35mm Equivalent', value: `${focal35Val} mm` });
  }

  const expBias = getTagDesc('ExposureBiasValue');
  if (expBias) {
    captureSettings.exposureCompensation = `${expBias} EV`;
    exifData.push({ key: 'ExposureBias', label: 'Exposure Bias', value: `${expBias} EV` });
  }

  const expProgram = getTagDesc('ExposureProgram');
  if (expProgram) {
    captureSettings.exposureProgram = expProgram;
    exifData.push({ key: 'ExposureProgram', label: 'Exposure Program', value: expProgram });
  }

  const meterMode = getTagDesc('MeteringMode');
  if (meterMode) {
    captureSettings.meteringMode = meterMode;
    exifData.push({ key: 'MeteringMode', label: 'Metering Mode', value: meterMode });
  }

  const whiteBalance = getTagDesc('WhiteBalance');
  if (whiteBalance) {
    captureSettings.whiteBalance = whiteBalance;
    exifData.push({ key: 'WhiteBalance', label: 'White Balance', value: whiteBalance });
  }

  const flash = getTagDesc('Flash');
  if (flash) {
    captureSettings.flash = flash;
    exifData.push({ key: 'Flash', label: 'Flash', value: flash });
  }

  const digitalZoom = getTagDesc('DigitalZoomRatio');
  if (digitalZoom && digitalZoom !== '1' && digitalZoom !== '0') {
    captureSettings.digitalZoom = `${digitalZoom}x`;
    exifData.push({ key: 'DigitalZoom', label: 'Digital Zoom Ratio', value: `${digitalZoom}x` });
  }

  // Camera fields
  const camera: MetadataField[] = [];
  const make = getTagDesc('Make');
  const model = getTagDesc('Model');
  if (make) camera.push({ key: 'Make', label: 'Manufacturer', value: make });
  if (model) camera.push({ key: 'Model', label: 'Camera Model', value: model });

  const serialNumber =
    getTagDesc('SerialNumber') ||
    getTagDesc('BodySerialNumber') ||
    getTagDesc('CameraSerialNumber');
  if (serialNumber) {
    camera.push({
      key: 'SerialNumber',
      label: 'Camera Serial Number',
      value: serialNumber,
      isSensitive: true,
    });
    privacyNotices.push('Camera serial number detected');
  }

  // Lens fields
  const lens: MetadataField[] = [];
  const lensMake = getTagDesc('LensMake');
  const lensModel = getTagDesc('LensModel') || getTagDesc('LensInfo');
  const lensSerial = getTagDesc('LensSerialNumber');

  if (lensMake) lens.push({ key: 'LensMake', label: 'Lens Manufacturer', value: lensMake });
  if (lensModel) lens.push({ key: 'LensModel', label: 'Lens Model', value: lensModel });
  if (lensSerial) {
    lens.push({
      key: 'LensSerialNumber',
      label: 'Lens Serial Number',
      value: lensSerial,
      isSensitive: true,
    });
    privacyNotices.push('Lens serial number detected');
  }

  // Date & Time fields
  const dateTime: MetadataField[] = [];
  const captureDate =
    getTagDesc('DateTimeOriginal') || getTagDesc('DateTimeDigitized') || getTagDesc('DateTime');
  if (captureDate) {
    dateTime.push({ key: 'CaptureDate', label: 'Original Capture Date', value: captureDate });
  }
  dateTime.push({
    key: 'FileModifiedDate',
    label: 'File Modified Date',
    value: new Date(file.lastModified).toLocaleString(),
  });

  const tz = getTagDesc('OffsetTimeOriginal') || getTagDesc('OffsetTime');
  if (tz) {
    dateTime.push({ key: 'TimeZone', label: 'Time Zone Offset', value: tz });
  }

  // GPS / Location fields
  let gps: GpsMetadata = { hasGps: false };
  let latNum: number | undefined;
  let lngNum: number | undefined;

  // Check expanded gps first
  if (expandedTags?.gps?.Latitude !== undefined && expandedTags?.gps?.Longitude !== undefined) {
    latNum = Number(expandedTags.gps.Latitude);
    lngNum = Number(expandedTags.gps.Longitude);
  } else if (rawTags['GPSLatitude'] && rawTags['GPSLongitude']) {
    latNum = Number(rawTags['GPSLatitude'].description || rawTags['GPSLatitude'].value);
    lngNum = Number(rawTags['GPSLongitude'].description || rawTags['GPSLongitude'].value);
  }

  if (latNum !== undefined && !isNaN(latNum) && lngNum !== undefined && !isNaN(lngNum)) {
    const latDms = toDms(latNum, true);
    const lngDms = toDms(lngNum, false);
    const altitude = getTagDesc('GPSAltitude');
    const direction = getTagDesc('GPSImgDirection');
    const timestamp = getTagDesc('GPSTimeStamp') || getTagDesc('GPSDateStamp');

    gps = {
      hasGps: true,
      latitude: Number(latNum.toFixed(6)),
      longitude: Number(lngNum.toFixed(6)),
      latDms,
      lngDms,
      altitude: altitude ? `${altitude} m` : undefined,
      direction: direction ? `${direction}°` : undefined,
      timestamp,
      mapUrl: `https://www.openstreetmap.org/?mlat=${latNum}&mlon=${lngNum}#map=16/${latNum}/${lngNum}`,
    };
    privacyNotices.push('Precise GPS location coordinates detected');
  }

  // Author / Copyright / Artist
  const artist = getTagDesc('Artist') || getTagDesc('Creator') || getTagDesc('By-line');
  if (artist) {
    exifData.push({ key: 'Artist', label: 'Author / Photographer', value: artist, isSensitive: true });
    privacyNotices.push('Author / Creator information detected');
  }

  const copyright = getTagDesc('Copyright') || getTagDesc('Rights');
  if (copyright) {
    exifData.push({ key: 'Copyright', label: 'Copyright', value: copyright, isSensitive: true });
    privacyNotices.push('Copyright statement detected');
  }

  // Software & Editor
  const software: MetadataField[] = [];
  const swName = getTagDesc('Software') || getTagDesc('ProcessingSoftware') || getTagDesc('CreatorTool');
  if (swName) {
    software.push({ key: 'Software', label: 'Software / Editor', value: swName });
  }

  // Color Info & Profiles
  const colorInfo: MetadataField[] = [];
  const profileDesc = getTagDesc('ProfileDescription') || getTagDesc('DeviceManufacturer');
  if (profileDesc) {
    colorInfo.push({ key: 'ICCProfile', label: 'ICC Color Profile', value: profileDesc });
  }

  // Advanced metadata (any remaining standard tags)
  const advanced: MetadataField[] = [];
  const otherKeys = [
    'SceneCaptureType',
    'Contrast',
    'Saturation',
    'Sharpness',
    'SubjectDistanceRange',
    'CustomRendered',
    'MaxApertureValue',
    'SensingMethod',
    'FileSource',
  ];
  for (const k of otherKeys) {
    const desc = getTagDesc(k);
    if (desc) {
      advanced.push({ key: k, label: k.replace(/([A-Z])/g, ' $1').trim(), value: desc });
    }
  }

  // Calculate total fields count
  const allFieldCount =
    fileInfo.length +
    imageInfo.length +
    exifData.length +
    camera.length +
    lens.length +
    dateTime.length +
    software.length +
    colorInfo.length +
    advanced.length +
    (gps.hasGps ? 3 : 0);

  let status: 'loading' | 'success' | 'limited' | 'none' | 'error' = 'none';
  if (allFieldCount > 8 && (camera.length > 0 || exifData.length > 3 || gps.hasGps)) {
    status = 'success';
  } else if (allFieldCount > 5) {
    status = 'limited';
  }

  return {
    id,
    file,
    previewUrl,
    name: file.name,
    size: file.size,
    type: file.type || `image/${extension}`,
    lastModified: file.lastModified,
    width: parsedW,
    height: parsedH,
    aspectRatio: ratioStr,
    pixelCount: pixelCountStr,
    format: (extension || 'JPG').toUpperCase(),
    status,
    fileInfo,
    imageInfo,
    exifData,
    camera,
    lens,
    captureSettings,
    dateTime,
    gps,
    software,
    colorInfo,
    advanced,
    rawTags,
    counts: {
      totalFields: allFieldCount,
      exifFields: exifData.length,
      hasGps: gps.hasGps,
      hasCamera: camera.length > 0,
    },
    privacyNotices,
    selected: false,
  };
}

/**
 * Exports metadata for an item as a formatted JSON file
 */
export function exportMetadataAsJson(item: ImageMetadataItem): void {
  const exportData = {
    file: {
      name: item.name,
      size: item.size,
      sizeFormatted: formatBytes(item.size),
      type: item.type,
      width: item.width,
      height: item.height,
      aspectRatio: item.aspectRatio,
      pixelCount: item.pixelCount,
    },
    camera: Object.fromEntries(item.camera.map((f) => [f.label, f.value])),
    lens: Object.fromEntries(item.lens.map((f) => [f.label, f.value])),
    captureSettings: item.captureSettings,
    dateTime: Object.fromEntries(item.dateTime.map((f) => [f.label, f.value])),
    gps: item.gps.hasGps
      ? {
          latitude: item.gps.latitude,
          longitude: item.gps.longitude,
          latDms: item.gps.latDms,
          lngDms: item.gps.lngDms,
          altitude: item.gps.altitude,
        }
      : null,
    exif: Object.fromEntries(item.exifData.map((f) => [f.label, f.value])),
    software: Object.fromEntries(item.software.map((f) => [f.label, f.value])),
    allFields: Object.fromEntries(
      [
        ...item.fileInfo,
        ...item.imageInfo,
        ...item.exifData,
        ...item.camera,
        ...item.lens,
        ...item.dateTime,
        ...item.software,
        ...item.colorInfo,
        ...item.advanced,
      ].map((f) => [f.label, f.value])
    ),
  };

  const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(jsonBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${item.name.replace(/\.[^/.]+$/, '')}-metadata.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports metadata for an item as a formatted text document
 */
export function exportMetadataAsTxt(item: ImageMetadataItem): void {
  const lines: string[] = [
    '====================================================',
    `IMAGE METADATA REPORT: ${item.name}`,
    'Generated by ToolNest Image Metadata Viewer',
    '====================================================\n',
    '--- FILE & IMAGE PROPERTIES ---',
    `Filename: ${item.name}`,
    `Dimensions: ${item.width} × ${item.height} px (${item.aspectRatio}, ${item.pixelCount})`,
    `File Size: ${formatBytes(item.size)} (${item.size} bytes)`,
    `Format: ${item.format}`,
    `Modified Date: ${new Date(item.lastModified).toLocaleString()}\n`,
  ];

  if (item.camera.length > 0) {
    lines.push('--- CAMERA INFORMATION ---');
    item.camera.forEach((f) => lines.push(`${f.label}: ${f.value}`));
    lines.push('');
  }

  if (item.lens.length > 0) {
    lines.push('--- LENS INFORMATION ---');
    item.lens.forEach((f) => lines.push(`${f.label}: ${f.value}`));
    lines.push('');
  }

  if (Object.keys(item.captureSettings).length > 0) {
    lines.push('--- PHOTOGRAPHY CAPTURE SETTINGS ---');
    Object.entries(item.captureSettings).forEach(([k, v]) => {
      if (v) lines.push(`${k}: ${v}`);
    });
    lines.push('');
  }

  if (item.gps.hasGps) {
    lines.push('--- GPS LOCATION ---');
    lines.push(`Latitude: ${item.gps.latitude} (${item.gps.latDms})`);
    lines.push(`Longitude: ${item.gps.longitude} (${item.gps.lngDms})`);
    if (item.gps.altitude) lines.push(`Altitude: ${item.gps.altitude}`);
    lines.push('');
  }

  if (item.exifData.length > 0) {
    lines.push('--- EXIF DETAILS ---');
    item.exifData.forEach((f) => lines.push(`${f.label}: ${f.value}`));
    lines.push('');
  }

  const txtBlob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(txtBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${item.name.replace(/\.[^/.]+$/, '')}-metadata.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates and downloads a bulk metadata CSV spreadsheet
 */
export function exportBulkMetadataAsCsv(items: ImageMetadataItem[]): void {
  const headers = [
    'Filename',
    'Format',
    'File Size',
    'Width',
    'Height',
    'Aspect Ratio',
    'Camera Make',
    'Camera Model',
    'Date Taken',
    'ISO',
    'Aperture',
    'Shutter Speed',
    'Focal Length',
    'GPS Latitude',
    'GPS Longitude',
    'Status',
  ];

  const rows = items.map((it) => {
    const make = it.camera.find((c) => c.key === 'Make')?.value || '';
    const model = it.camera.find((c) => c.key === 'Model')?.value || '';
    const dateTaken = it.dateTime.find((d) => d.key === 'CaptureDate')?.value || '';

    return [
      `"${it.name.replace(/"/g, '""')}"`,
      `"${it.format}"`,
      `"${formatBytes(it.size)}"`,
      it.width,
      it.height,
      `"${it.aspectRatio}"`,
      `"${String(make).replace(/"/g, '""')}"`,
      `"${String(model).replace(/"/g, '""')}"`,
      `"${String(dateTaken).replace(/"/g, '""')}"`,
      `"${it.captureSettings.iso || ''}"`,
      `"${it.captureSettings.aperture || ''}"`,
      `"${it.captureSettings.shutterSpeed || ''}"`,
      `"${it.captureSettings.focalLength || ''}"`,
      it.gps.hasGps ? it.gps.latitude : '',
      it.gps.hasGps ? it.gps.longitude : '',
      `"${it.status}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `toolnest-metadata-overview-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Formats a clean summary string for the clipboard
 */
export function formatClipboardSummary(item: ImageMetadataItem): string {
  const lines: string[] = [
    `File: ${item.name} (${formatBytes(item.size)}, ${item.width}×${item.height} px, ${item.aspectRatio})`,
  ];

  const cameraModel = item.camera.find((c) => c.key === 'Model')?.value;
  if (cameraModel) lines.push(`Camera: ${cameraModel}`);

  const lensModel = item.lens.find((l) => l.key === 'LensModel')?.value;
  if (lensModel) lines.push(`Lens: ${lensModel}`);

  const cs = item.captureSettings;
  const settingsPart = [cs.focalLength, cs.aperture, cs.shutterSpeed, cs.iso]
    .filter(Boolean)
    .join(' • ');
  if (settingsPart) lines.push(`Settings: ${settingsPart}`);

  if (item.gps.hasGps) {
    lines.push(`GPS: ${item.gps.latitude}, ${item.gps.longitude} (${item.gps.latDms}, ${item.gps.lngDms})`);
  }

  return lines.join('\n');
}
