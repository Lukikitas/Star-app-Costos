import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CreateSupplyInput, Supply } from "../types";
import { calculateUnitCost, getBaseUnit, normalizeQuantity } from "../utils/costCalculations";
import { deleteImageByPath, uploadCoverImage } from "./imageService";
import { logSupplyPriceChange } from "./priceHistoryService";

const validate = (input: CreateSupplyInput) => {
  if (!input.name.trim()) throw new Error("El nombre del insumo es obligatorio.");
  if (input.packageCost < 0) throw new Error("El costo no puede ser negativo.");
  if (input.packageQuantity <= 0) throw new Error("La cantidad debe ser mayor a cero.");
};

const buildData = (input: CreateSupplyInput) => ({
  name: input.name.trim(),
  category: input.category,
  packageCost: input.packageCost,
  packageQuantity: input.packageQuantity,
  packageUnit: input.packageUnit,
  baseUnit: getBaseUnit(input.packageUnit),
  normalizedQuantity: normalizeQuantity(input.packageQuantity, input.packageUnit),
  unitCost: calculateUnitCost(input.packageCost, input.packageQuantity, input.packageUnit),
});

export const createSupply = async (businessId: string, input: CreateSupplyInput) => {
  validate(input);
  const ref = doc(collection(db, "businesses", businessId, "supplies"));
  await setDoc(ref, {
    ...buildData(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateSupply = async (businessId: string, supplyId: string, input: CreateSupplyInput) => {
  validate(input);
  const ref = doc(db, "businesses", businessId, "supplies", supplyId);
  const prevSnap = await getDoc(ref);
  const prev = prevSnap.exists() ? (prevSnap.data() as Omit<Supply, "id">) : undefined;

  const next = buildData(input);
  await updateDoc(ref, { ...next, updatedAt: serverTimestamp() });

  if (prev && (prev.unitCost !== next.unitCost || prev.packageCost !== next.packageCost)) {
    await logSupplyPriceChange(businessId, {
      supplyId,
      supplyName: prev.name ?? next.name,
      previousUnitCost: prev.unitCost ?? 0,
      nextUnitCost: next.unitCost,
      previousPackageCost: prev.packageCost ?? 0,
      nextPackageCost: next.packageCost,
    });
  }
};

export const deleteSupply = async (businessId: string, supplyId: string) => {
  await deleteDoc(doc(db, "businesses", businessId, "supplies", supplyId));
};

export const setSupplyCoverImage = async (businessId: string, supplyId: string, file: File) => {
  const { imageUrl, imagePath } = await uploadCoverImage(businessId, "supplies", supplyId, file);
  await updateDoc(doc(db, "businesses", businessId, "supplies", supplyId), {
    imageUrl,
    imagePath,
    updatedAt: serverTimestamp(),
  });
};

export const removeSupplyCoverImage = async (businessId: string, supplyId: string, imagePath?: string | null) => {
  if (imagePath) {
    try {
      await deleteImageByPath(imagePath);
    } catch (e) {
      console.warn("[removeSupplyCoverImage] delete failed", e);
    }
  }
  await updateDoc(doc(db, "businesses", businessId, "supplies", supplyId), {
    imageUrl: null,
    imagePath: null,
    updatedAt: serverTimestamp(),
  });
};

export const listenSupplies = (businessId: string, callback: (supplies: Supply[]) => void) => {
  const q = query(collection(db, "businesses", businessId, "supplies"), orderBy("name", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Supply, "id">) })));
    },
    (error) => {
      console.error("[listenSupplies] Firestore snapshot error", error);
      callback([]);
    },
  );
};

export const getSuppliesOnce = async (businessId: string): Promise<Supply[]> => {
  const q = query(collection(db, "businesses", businessId, "supplies"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Supply, "id">) }));
};
