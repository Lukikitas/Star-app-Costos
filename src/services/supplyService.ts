import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CreateSupplyInput, Supply } from "../types";
import { calculateUnitCost, getBaseUnit, normalizeQuantity } from "../utils/costCalculations";

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
  await addDoc(collection(db, "businesses", businessId, "supplies"), {
    ...buildData(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateSupply = async (businessId: string, supplyId: string, input: CreateSupplyInput) => {
  validate(input);
  await updateDoc(doc(db, "businesses", businessId, "supplies", supplyId), {
    ...buildData(input),
    updatedAt: serverTimestamp(),
  });
};

export const deleteSupply = async (businessId: string, supplyId: string) => {
  await deleteDoc(doc(db, "businesses", businessId, "supplies", supplyId));
};

export const listenSupplies = (businessId: string, callback: (supplies: Supply[]) => void) => {
  const q = query(collection(db, "businesses", businessId, "supplies"), orderBy("name", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Supply, "id">) })));
  });
};

export const getSuppliesOnce = async (businessId: string): Promise<Supply[]> => {
  const q = query(collection(db, "businesses", businessId, "supplies"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Supply, "id">) }));
};
