// Watch photos are shrunk in the browser before upload so each one downloads
// quickly for visitors and keeps Supabase download usage low.
export const MAX_PHOTO_SIDE = 1400;
export const PHOTO_QUALITY = 0.82;
// Small copy used where photos appear as cards or in the homepage loop.
export const THUMB_SIDE = 720;
export const THUMB_QUALITY = 0.78;

export function thumbPath(storagePath: string) {
  return `${storagePath}.thumb.jpg`;
}
// Long cache: each upload gets a unique path, so a stored photo never changes.
export const PHOTO_CACHE_SECONDS = "31536000";

export function fitWithin(width: number, height: number, max = MAX_PHOTO_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Returns a JPEG no larger than `max` on its longest side. */
export async function compressImage(file: File, max = MAX_PHOTO_SIDE, quality = PHOTO_QUALITY): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't prepare photos for upload");
  // Transparent areas become the site's ivory instead of black.
  ctx.fillStyle = "#F9F6F0";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Couldn't prepare this photo");
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

export const makeThumbnail = (file: File) => compressImage(file, THUMB_SIDE, THUMB_QUALITY);

/** Full photo plus its small preview copy, ready to upload side by side. */
export async function preparePhoto(file: File) {
  const [photo, thumb] = await Promise.all([compressImage(file), makeThumbnail(file)]);
  return { photo, thumb };
}
