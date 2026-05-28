/** Fit images into a bounding box preserving aspect ratio (print + PDF). */

export interface ImageNaturalSize {
  width: number;
  height: number;
}

export function fitDimensionsInBox(
  natW: number,
  natH: number,
  maxW: number,
  maxH: number
): { w: number; h: number } {
  if (natW <= 0 || natH <= 0) return { w: maxW, h: maxH };
  const scale = Math.min(maxW / natW, maxH / natH);
  return { w: natW * scale, h: natH * scale };
}

/** Browser-only: read intrinsic dimensions from a data URL. */
export function loadImageNaturalSize(dataUrl: string): Promise<ImageNaturalSize> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = dataUrl;
  });
}
