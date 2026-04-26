import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { createBusiness, createUserProfile } from "./businessService";

const mapFirebaseError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado en Firebase.";
};

export const registerUser = async (name: string, email: string, password: string, businessName: string) => {
  if (!name.trim()) throw new Error("El nombre es obligatorio.");
  if (!businessName.trim()) throw new Error("El nombre del negocio es obligatorio.");
  const credential = await createUserWithEmailAndPassword(auth, email, password).catch((err) => {
    throw new Error(mapFirebaseError(err));
  });
  await createUserProfile(credential.user.uid, name.trim(), email.trim());
  await createBusiness(credential.user.uid, businessName.trim());
  return credential.user;
};

export const loginUser = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password).catch((err) => {
    throw new Error(mapFirebaseError(err));
  });
  return credential.user;
};

export const logoutUser = async () => signOut(auth);

export const getCurrentUser = (): User | null => auth.currentUser;

export const listenAuthState = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);
