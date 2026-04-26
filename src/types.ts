import { Timestamp } from "firebase/firestore";

export type Unit = "g" | "kg" | "ml" | "l" | "unit";
export type BaseUnit = "g" | "ml" | "unit";
export type Role = "owner" | "editor" | "viewer";
export type RoundingMode = "none" | "10" | "50" | "100" | "up10" | "up50" | "up100";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: Timestamp;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  members: Record<string, Role>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Supply {
  id: string;
  name: string;
  category: string;
  packageCost: number;
  packageQuantity: number;
  packageUnit: Unit;
  baseUnit: BaseUnit;
  normalizedQuantity: number;
  unitCost: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface RecipeIngredient {
  id: string;
  supplyId: string;
  supplyName: string;
  quantity: number;
  unit: Unit;
  normalizedQuantity: number;
  unitCostAtMoment: number;
  cost: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
  wastePercentage: number;
  desiredMargin: number;
  extraCosts: number;
  roundingMode: RoundingMode;
  productionCost: number;
  finalCost: number;
  suggestedPrice: number;
  estimatedProfit: number;
  realMargin: number;
  markup: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CreateSupplyInput {
  name: string;
  category: string;
  packageCost: number;
  packageQuantity: number;
  packageUnit: Unit;
}

export interface RecipeIngredientInput {
  supplyId: string;
  quantity: number;
  unit: Unit;
}

export interface CreateRecipeInput {
  name: string;
  category: string;
  ingredients: RecipeIngredientInput[];
  wastePercentage: number;
  desiredMargin: number;
  extraCosts: number;
  roundingMode: RoundingMode;
}

export interface BusinessExportData {
  business: Omit<Business, "id">;
  supplies: Omit<Supply, "id">[];
  recipes: Omit<Recipe, "id">[];
}
