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
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CreateRecipeInput, Recipe, RecipeIngredient, Supply } from "../types";
import { deleteImageByPath, uploadCoverImage } from "./imageService";
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

export const recalculateRecipePricing = (recipe: Recipe, supplies: Supply[]) => {
  // Recalcula los costos y precios sugeridos manteniendo el margen deseado y la lógica existente.
  // No toca campos de imagen (imageUrl / imagePath).
  const input: CreateRecipeInput = {
    name: recipe.name,
    category: recipe.category,
    ingredients: recipe.ingredients.map((i) => ({ supplyId: i.supplyId, quantity: i.quantity, unit: i.unit })),
    wastePercentage: recipe.wastePercentage,
    desiredMargin: recipe.desiredMargin,
    extraCosts: recipe.extraCosts,
    roundingMode: recipe.roundingMode,
  };

  const next = buildRecipeData(input, supplies);

  return {
    ingredients: next.ingredients,
    productionCost: next.productionCost,
    finalCost: next.finalCost,
    suggestedPrice: next.suggestedPrice,
    estimatedProfit: next.estimatedProfit,
    realMargin: next.realMargin,
    markup: next.markup,
  };
};

export const createRecipe = async (businessId: string, input: CreateRecipeInput, supplies: Supply[]) => {
  const ref = doc(collection(db, "businesses", businessId, "recipes"));
  await setDoc(ref, {
    ...buildRecipeData(input, supplies),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
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

export const setRecipeCoverImage = async (businessId: string, recipeId: string, file: File) => {
  const { imageUrl, imagePath } = await uploadCoverImage(businessId, "recipes", recipeId, file);
  await updateDoc(doc(db, "businesses", businessId, "recipes", recipeId), {
    imageUrl,
    imagePath,
    updatedAt: serverTimestamp(),
  });
};

export const removeRecipeCoverImage = async (businessId: string, recipeId: string, imagePath?: string | null) => {
  if (imagePath) {
    try {
      await deleteImageByPath(imagePath);
    } catch (e) {
      console.warn("[removeRecipeCoverImage] delete failed", e);
    }
  }
  await updateDoc(doc(db, "businesses", businessId, "recipes", recipeId), {
    imageUrl: null,
    imagePath: null,
    updatedAt: serverTimestamp(),
  });
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

export const applyRecipePricingRecalculation = async (
  businessId: string,
  recipeId: string,
  recipe: Recipe,
  supplies: Supply[],
) => {
  const recalculated = recalculateRecipePricing(recipe, supplies);
  await updateDoc(doc(db, "businesses", businessId, "recipes", recipeId), {
    ...recalculated,
    updatedAt: serverTimestamp(),
  });
};
