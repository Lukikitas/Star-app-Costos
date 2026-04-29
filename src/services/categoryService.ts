import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SUPPLY_CATEGORIES } from "../utils/constants";

export interface BusinessCategories {
  supplies: string[];
  recipes: string[];
}

const categoriesDocRef = (businessId: string) => doc(db, "businesses", businessId, "settings", "categories");

const normalize = (value: string) => value.trim();

const uniqueSorted = (items: string[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const norm = normalize(item);
    if (!norm) continue;
    const key = norm.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(norm);
  }
  return out.sort((a, b) => a.localeCompare(b, "es"));
};

const mapCategoryError = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  if (code === "permission-denied") {
    return new Error(
      "No tenés permisos para modificar categorías. Revisá que Firestore Rules esté publicado y que tu usuario figure como miembro del negocio.",
    );
  }
  return error instanceof Error ? error : new Error("No se pudo operar con categorías.");
};

export const getDefaultCategories = (): BusinessCategories => ({
  supplies: [...SUPPLY_CATEGORIES],
  recipes: [...SUPPLY_CATEGORIES],
});

export const ensureCategoriesDoc = async (businessId: string) => {
  await setDoc(
    categoriesDocRef(businessId),
    { ...getDefaultCategories(), updatedAt: serverTimestamp() },
    { merge: true },
  );
};

export const getCategoriesOnce = async (businessId: string): Promise<BusinessCategories> => {
  const snap = await getDoc(categoriesDocRef(businessId));
  if (!snap.exists()) return getDefaultCategories();
  const data = snap.data() as Partial<BusinessCategories>;
  return {
    supplies: Array.isArray(data.supplies) ? uniqueSorted(data.supplies) : getDefaultCategories().supplies,
    recipes: Array.isArray(data.recipes) ? uniqueSorted(data.recipes) : getDefaultCategories().recipes,
  };
};

export const listenCategories = (businessId: string, cb: (categories: BusinessCategories) => void) => {
  return onSnapshot(
    categoriesDocRef(businessId),
    async (snap) => {
      if (!snap.exists()) {
        await ensureCategoriesDoc(businessId);
        cb(getDefaultCategories());
        return;
      }
      const data = snap.data() as Partial<BusinessCategories>;
      cb({
        supplies: Array.isArray(data.supplies) ? uniqueSorted(data.supplies) : getDefaultCategories().supplies,
        recipes: Array.isArray(data.recipes) ? uniqueSorted(data.recipes) : getDefaultCategories().recipes,
      });
    },
    (error) => {
      console.error("[listenCategories] Firestore snapshot error", error);
      cb(getDefaultCategories());
    },
  );
};

export const addCategory = async (businessId: string, kind: keyof BusinessCategories, value: string) => {
  const next = normalize(value);
  if (!next) throw new Error("La categoría no puede estar vacía.");
  try {
    await ensureCategoriesDoc(businessId);
    const current = await getCategoriesOnce(businessId);
    await updateDoc(categoriesDocRef(businessId), {
      [kind]: uniqueSorted([...(current[kind] ?? []), next]),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapCategoryError(error);
  }
};

export const removeCategory = async (businessId: string, kind: keyof BusinessCategories, value: string) => {
  const next = normalize(value);
  try {
    await ensureCategoriesDoc(businessId);
    const current = await getCategoriesOnce(businessId);
    await updateDoc(categoriesDocRef(businessId), {
      [kind]: uniqueSorted((current[kind] ?? []).filter((x) => x.toLowerCase() !== next.toLowerCase())),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapCategoryError(error);
  }
};

export const renameCategory = async (businessId: string, kind: keyof BusinessCategories, from: string, to: string) => {
  const nextFrom = normalize(from);
  const nextTo = normalize(to);
  if (!nextTo) throw new Error("La categoría no puede estar vacía.");
  try {
    await ensureCategoriesDoc(businessId);
    const current = await getCategoriesOnce(businessId);
    const mapped = (current[kind] ?? []).map((x) => (x.toLowerCase() === nextFrom.toLowerCase() ? nextTo : x));
    await updateDoc(categoriesDocRef(businessId), {
      [kind]: uniqueSorted(mapped),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw mapCategoryError(error);
  }
};

