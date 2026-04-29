import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { PriceHistoryEntry } from "../types";

type SupplyPriceHistoryInput = {
  supplyId: string;
  supplyName: string;
  previousUnitCost: number;
  nextUnitCost: number;
  previousPackageCost: number;
  nextPackageCost: number;
};

type RecipePriceHistoryInput = {
  recipeId: string;
  recipeName: string;
  triggerSupplyId?: string;
  triggerSupplyName?: string;
  previousSuggestedPrice: number;
  nextSuggestedPrice: number;
  previousProductionCost: number;
  nextProductionCost: number;
  previousEstimatedProfit: number;
  nextEstimatedProfit: number;
  previousRealMargin: number;
  nextRealMargin: number;
};

const historyCollection = (businessId: string) => collection(db, "businesses", businessId, "priceHistory");

export const logSupplyPriceChange = async (businessId: string, payload: SupplyPriceHistoryInput) => {
  await addDoc(historyCollection(businessId), {
    kind: "supply",
    ...payload,
    createdAt: serverTimestamp(),
  });
};

export const logRecipePriceChange = async (businessId: string, payload: RecipePriceHistoryInput) => {
  await addDoc(historyCollection(businessId), {
    kind: "recipe",
    ...payload,
    createdAt: serverTimestamp(),
  });
};

export const listenPriceHistory = (businessId: string, cb: (items: PriceHistoryEntry[]) => void) => {
  const q = query(historyCollection(businessId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PriceHistoryEntry, "id">) })));
    },
    (error) => {
      console.error("[listenPriceHistory] Firestore snapshot error", error);
      cb([]);
    },
  );
};

