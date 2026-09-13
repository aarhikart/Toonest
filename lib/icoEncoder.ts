/**
 * Pure TypeScript Microsoft ICO Binary Encoder
 * Encodes multi-resolution icons into a valid binary .ico container.
 * Uses PNG-compressed image streams (standard since Windows Vista, supported by all modern browsers).
 */

export interface IcoImageEntry {
  width: number;
  height: number;
  pngData: Uint8Array;
}

/**
 * Creates a valid multi-resolution Microsoft .ico file Blob
 */
export function encodeIco(images: IcoImageEntry[]): Blob {
  if (images.length === 0) {
    throw new Error('At least one image is required to generate an ICO file.');
  }

  const numImages = images.length;
  const HEADER_SIZE = 6; // ICONDIR
  const DIRECTORY_ENTRY_SIZE = 16; // ICONDIRENTRY

  const directoryTotalSize = HEADER_SIZE + numImages * DIRECTORY_ENTRY_SIZE;

  // Calculate total file size and assign offsets
  let currentOffset = directoryTotalSize;
  const offsets: number[] = [];

  for (let i = 0; i < numImages; i++) {
    offsets.push(currentOffset);
    currentOffset += images[i].pngData.byteLength;
  }

  const totalFileSize = currentOffset;
  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // 1. Write ICONDIR (Header)
  view.setUint16(0, 0, true); // idReserved = 0
  view.setUint16(2, 1, true); // idType = 1 (Icon)
  view.setUint16(4, numImages, true); // idCount

  // 2. Write ICONDIRENTRY for each image
  for (let i = 0; i < numImages; i++) {
    const img = images[i];
    const entryOffset = HEADER_SIZE + i * DIRECTORY_ENTRY_SIZE;

    // bWidth: 0 represents 256
    view.setUint8(entryOffset + 0, img.width >= 256 ? 0 : img.width);
    // bHeight: 0 represents 256
    view.setUint8(entryOffset + 1, img.height >= 256 ? 0 : img.height);
    // bColorCount: 0 if no palette
    view.setUint8(entryOffset + 2, 0);
    // bReserved: 0
    view.setUint8(entryOffset + 3, 0);
    // wPlanes: 1
    view.setUint16(entryOffset + 4, 1, true);
    // wBitCount: 32 (ARGB)
    view.setUint16(entryOffset + 6, 32, true);
    // dwBytesInRes: length of PNG byte payload
    view.setUint32(entryOffset + 8, img.pngData.byteLength, true);
    // dwImageOffset: byte offset from start of file
    view.setUint32(entryOffset + 12, offsets[i], true);

    // 3. Copy PNG byte stream to allocated offset
    bytes.set(img.pngData, offsets[i]);
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}
