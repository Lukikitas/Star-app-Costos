import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export type ImageOwnerKind = "supplies" | "recipes";

const buildCoverPath = (businessId: string, kind: ImageOwnerKind, ownerId: string) =>
  `businesses/${businessId}/${kind}/${ownerId}/cover.jpg`;

export const uploadCoverImage = async (businessId: string, kind: ImageOwnerKind, ownerId: string, file: File) => {
  const imagePath = buildCoverPath(businessId, kind, ownerId);
  const r = ref(storage, imagePath);
  await uploadBytes(r, file, { contentType: file.type || "image/jpeg" });
  const imageUrl = await getDownloadURL(r);
  return { imageUrl, imagePath };
};

export const deleteImageByPath = async (imagePath: string) => {
  const r = ref(storage, imagePath);
  await deleteObject(r);
};

