export type ImageOwnerKind = "supplies" | "recipes";

/**
 * IMPORTANTE: NO usamos Firebase Storage.
 * Guardamos la imagen como dataURL (base64) directamente en Firestore (campo `imageUrl`).
 *
 * Nota: Firestore tiene límites de tamaño de documento. Para evitar problemas,
 * comprimimos (re-escala + JPEG) antes de guardar.
 */
export const uploadCoverImage = async (
  _businessId: string,
  _kind: ImageOwnerKind,
  _ownerId: string,
  file: File,
) => {
  const imageUrl = await fileToCompressedDataUrl(file, { maxSidePx: 900, quality: 0.85 });
  return { imageUrl, imagePath: null as string | null };
};

export const deleteImageByPath = async (_imagePath: string) => {
  // No-op: sin Storage no existe una ruta para borrar.
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo de imagen."));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
    img.src = src;
  });

const fileToCompressedDataUrl = async (
  file: File,
  { maxSidePx, quality }: { maxSidePx: number; quality: number },
): Promise<string> => {
  const originalDataUrl = await fileToDataUrl(file);

  // Si por algún motivo no podemos cargar/comprimir, usamos el dataURL original.
  try {
    const img = await loadImage(originalDataUrl);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return originalDataUrl;

    const scale = Math.min(1, maxSidePx / Math.max(w, h));
    const targetW = Math.max(1, Math.round(w * scale));
    const targetH = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return originalDataUrl;

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
    );
    if (!blob) return originalDataUrl;

    return await fileToDataUrl(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }));
  } catch {
    return originalDataUrl;
  }
};

