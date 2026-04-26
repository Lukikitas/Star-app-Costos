import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { BusinessExportData, Recipe, Supply } from "../types";

export const validateImportData = (data: unknown): data is BusinessExportData => {
  const parsed = data as BusinessExportData;
  return Boolean(parsed?.business && Array.isArray(parsed.supplies) && Array.isArray(parsed.recipes));
};

export const exportBusinessData = async (businessId: string): Promise<BusinessExportData> => {
  const [suppliesSnap, recipesSnap] = await Promise.all([
    getDocs(collection(db, "businesses", businessId, "supplies")),
    getDocs(collection(db, "businesses", businessId, "recipes")),
  ]);

  const supplies = suppliesSnap.docs.map((d) => d.data() as Omit<Supply, "id">);
  const recipes = recipesSnap.docs.map((d) => d.data() as Omit<Recipe, "id">);

  return {
    business: {
      name: "Export",
      ownerId: "",
      members: {},
    },
    supplies,
    recipes,
  };
};

export const importBusinessData = async (businessId: string, data: BusinessExportData) => {
  if (!validateImportData(data)) throw new Error("Formato de importación inválido.");
  const batch = writeBatch(db);

  for (const supply of data.supplies) {
    const ref = doc(collection(db, "businesses", businessId, "supplies"));
    batch.set(ref, { ...supply, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }

  for (const recipe of data.recipes) {
    const ref = doc(collection(db, "businesses", businessId, "recipes"));
    batch.set(ref, { ...recipe, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }

  await batch.commit();
};

export const resetBusinessData = async (businessId: string) => {
  const [suppliesSnap, recipesSnap] = await Promise.all([
    getDocs(collection(db, "businesses", businessId, "supplies")),
    getDocs(collection(db, "businesses", businessId, "recipes")),
  ]);

  await Promise.all([
    ...suppliesSnap.docs.map((d) => deleteDoc(doc(db, "businesses", businessId, "supplies", d.id))),
    ...recipesSnap.docs.map((d) => deleteDoc(doc(db, "businesses", businessId, "recipes", d.id))),
  ]);
};
