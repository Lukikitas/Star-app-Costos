import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Business } from "../types";

export const createUserProfile = async (userId: string, name: string, email: string) => {
  await setDoc(doc(db, "users", userId), {
    name,
    email,
    createdAt: serverTimestamp(),
  });
};

export const createBusiness = async (userId: string, businessName: string) => {
  if (!businessName.trim()) throw new Error("El nombre del negocio es obligatorio.");
  const businessRef = await addDoc(collection(db, "businesses"), {
    name: businessName,
    ownerId: userId,
    members: { [userId]: "owner" },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return businessRef.id;
};

export const getUserBusinesses = async (userId: string): Promise<Business[]> => {
  const q = query(collection(db, "businesses"), where(`members.${userId}`, "in", ["owner", "editor", "viewer"]));
  const snap = await getDocs(q);
  return snap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Business, "id">) }));
};

export const listenUserBusinesses = (userId: string, callback: (businesses: Business[]) => void) => {
  const q = query(collection(db, "businesses"), where(`members.${userId}`, "in", ["owner", "editor", "viewer"]));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Business, "id">) })));
    },
    (error) => {
      console.error("[listenUserBusinesses] Firestore snapshot error", error);
      callback([]);
    },
  );
};

export const updateBusiness = async (businessId: string, data: Partial<Pick<Business, "name" | "members">>) => {
  await updateDoc(doc(db, "businesses", businessId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBusiness = async (businessId: string) => {
  await deleteDoc(doc(db, "businesses", businessId));
};
