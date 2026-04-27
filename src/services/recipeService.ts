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
import { CreateRecipeInput, Recipe, RecipeIngredient, Supply } from "../types";
import {
  applyWaste,
  calculateEstimatedProfit,
  calculateIngredientCost,
  calculateMarkup,
  calculateRealMargin,
  calculateRecipeProductionCost,
  calculateSuggestedPrice,
  normalizeQuantity,
  roundPrice,
} from "../utils/costCalculations";

const buildIngredients = (input: CreateRecipeInput, supplies: Supply[]): RecipeIngredient[] => {
  if (!input.ingredients.length) throw new Error("La receta debe tener al menos un ingrediente.");

  return input.ingredients.map((item, idx) => {
    const supply = supplies.find((s) => s.id === item.supplyId);
    if (!supply) throw new Error("Hay ingredientes con insumo eliminado o inexistente.");
    const cost = calculateIngredientCost(supply, item.quantity, item.unit);
    return {
      id: `${item.supplyId}-${idx}`,
      supplyId: item.supplyId,
      supplyName: supply.name,
      quantity: item.quantity,
      unit: item.unit,
      normalizedQuantity: normalizeQuantity(item.quantity, item.unit),
      unitCostAtMoment: supply.unitCost,
      cost,
    };
  });
};

const buildRecipeData = (input: CreateRecipeInput, supplies: Supply[]) => {
  if (!input.name.trim()) throw new Error("El nombre es obligatorio.");
  if (input.desiredMargin >= 100) throw new Error("El margen deseado debe ser menor a 100.");
  const ingredients = buildIngredients(input, supplies);
  const productionCost = calculateRecipeProductionCost(ingredients);
  const finalCost = applyWaste(productionCost + input.extraCosts, input.wastePercentage);
  const suggestedRaw = calculateSuggestedPrice(finalCost, input.desiredMargin);
  const suggestedPrice = roundPrice(suggestedRaw, input.roundingMode);
  const estimatedProfit = calculateEstimatedProfit(suggestedPrice, finalCost);
  const realMargin = calculateRealMargin(suggestedPrice, finalCost);
  const markup = calculateMarkup(suggestedPrice, finalCost);

  return {
    name: input.name.trim(),
    category: input.category,
    ingredients,
    wastePercentage: input.wastePercentage,
    desiredMargin: input.desiredMargin,
    extraCosts: input.extraCosts,
    roundingMode: input.roundingMode,
    productionCost,
    finalCost,
    suggestedPrice,
    estimatedProfit,
    realMargin,
    markup,
  };
};

export const createRecipe = async (businessId: string, input: CreateRecipeInput, supplies: Supply[]) => {
  await addDoc(collection(db, "businesses", businessId, "recipes"), {
    ...buildRecipeData(input, supplies),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateRecipe = async (businessId: string, recipeId: string, input: CreateRecipeInput, supplies: Supply[]) => {
  await updateDoc(doc(db, "businesses", businessId, "recipes", recipeId), {
    ...buildRecipeData(input, supplies),
    updatedAt: serverTimestamp(),
  });
};

export const deleteRecipe = async (businessId: string, recipeId: string) => {
  await deleteDoc(doc(db, "businesses", businessId, "recipes", recipeId));
};

export const duplicateRecipe = async (businessId: string, recipe: Recipe) => {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = recipe;
  await addDoc(collection(db, "businesses", businessId, "recipes"), {
    ...rest,
    name: `${recipe.name} (copia)`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const listenRecipes = (businessId: string, callback: (recipes: Recipe[]) => void) => {
  const q = query(collection(db, "businesses", businessId, "recipes"), orderBy("name", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Recipe, "id">) })));
    },
    (error) => {
      console.error("[listenRecipes] Firestore snapshot error", error);
      callback([]);
    },
  );
};

export const getRecipesOnce = async (businessId: string): Promise<Recipe[]> => {
  const q = query(collection(db, "businesses", businessId, "recipes"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Recipe, "id">) }));
};
