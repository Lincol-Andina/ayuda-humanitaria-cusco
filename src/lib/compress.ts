"use client";

import imageCompression from "browser-image-compression";

/**
 * Compresses an evidence photo in the browser before uploading it,
 * keeping the storage of photos efficient.
 */
export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1280,
    initialQuality: 0.72,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const safeName = file.name.replace(/\.[^.]+$/, "").slice(0, 40);
  return new File([compressed], `${safeName || "evidencia"}.jpg`, {
    type: "image/jpeg",
  });
}
