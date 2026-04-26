import { BaseUnit, RecipeIngredient, RoundingMode, Supply, Unit } from "../types";

export const getBaseUnit = (unit: Unit): BaseUnit => {
  if (unit === "kg" || unit === "g") return "g";
  if (unit === "l" || unit === "ml") return "ml";
  return "unit";
};

export const normalizeQuantity = (quantity: number, unit: Unit): number => {
  if (quantity <= 0) throw new Error("La cantidad debe ser mayor a cero.");
  if (unit === "kg" || unit === "l") return quantity * 1000;
  return quantity;
};

export const calculateUnitCost = (packageCost: number, packageQuantity: number, packageUnit: Unit): number => {
  if (packageCost < 0) throw new Error("El costo no puede ser negativo.");
  const normalized = normalizeQuantity(packageQuantity, packageUnit);
  return packageCost / normalized;
};

const isCompatible = (baseUnit: BaseUnit, usedUnit: Unit): boolean => {
  if (baseUnit === "g") return usedUnit === "g" || usedUnit === "kg";
  if (baseUnit === "ml") return usedUnit === "ml" || usedUnit === "l";
  return usedUnit === "unit";
};

export const calculateIngredientCost = (supply: Supply, quantity: number, unit: Unit): number => {
  if (!isCompatible(supply.baseUnit, unit)) {
    throw new Error(`Unidad incompatible para ${supply.name}.`);
  }
  const normalized = normalizeQuantity(quantity, unit);
  return normalized * supply.unitCost;
};

export const calculateRecipeProductionCost = (ingredients: RecipeIngredient[]): number => {
  return ingredients.reduce((acc, item) => acc + item.cost, 0);
};

export const applyWaste = (cost: number, wastePercentage: number): number => {
  if (cost < 0) throw new Error("El costo no puede ser negativo.");
  return cost * (1 + wastePercentage / 100);
};

export const calculateSuggestedPrice = (finalCost: number, desiredMargin: number): number => {
  if (desiredMargin >= 100) throw new Error("El margen debe ser menor a 100.");
  return finalCost / (1 - desiredMargin / 100);
};

export const calculateEstimatedProfit = (suggestedPrice: number, finalCost: number): number => suggestedPrice - finalCost;

export const calculateRealMargin = (suggestedPrice: number, finalCost: number): number => {
  if (suggestedPrice <= 0) return 0;
  return ((suggestedPrice - finalCost) / suggestedPrice) * 100;
};

export const calculateMarkup = (suggestedPrice: number, finalCost: number): number => {
  if (finalCost <= 0) return 0;
  return ((suggestedPrice - finalCost) / finalCost) * 100;
};

export const roundPrice = (price: number, roundingMode: RoundingMode): number => {
  if (roundingMode === "none") return price;
  const value = Number(roundingMode.replace("up", ""));
  if (roundingMode.startsWith("up")) return Math.ceil(price / value) * value;
  return Math.round(price / value) * value;
};
