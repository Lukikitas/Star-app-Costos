import { CreateRecipeInput, Supply } from "../types";
import {
  applyWaste,
  calculateEstimatedProfit,
  calculateIngredientCost,
  calculateRealMargin,
  calculateSuggestedPrice,
  roundPrice,
} from "../utils/costCalculations";

export const RecipeCostSummary = ({ input, supplies }: { input: CreateRecipeInput; supplies: Supply[] }) => {
  const production = input.ingredients.reduce((acc, ing) => {
    const supply = supplies.find((s) => s.id === ing.supplyId);
    if (!supply) return acc;
    try {
      return acc + calculateIngredientCost(supply, ing.quantity, ing.unit);
    } catch {
      return acc;
    }
  }, 0);

  const finalCost = applyWaste(production + input.extraCosts, input.wastePercentage);
  const suggested = roundPrice(calculateSuggestedPrice(finalCost, Math.min(input.desiredMargin, 99.99)), input.roundingMode);
  const profit = calculateEstimatedProfit(suggested, finalCost);
  const margin = calculateRealMargin(suggested, finalCost);

  return (
    <div className="bg-slate-50 border rounded p-3 text-sm space-y-1">
      <p>Costo producción: <strong>${production.toFixed(2)}</strong></p>
      <p>Costo final: <strong>${finalCost.toFixed(2)}</strong></p>
      <p>Precio sugerido: <strong>${suggested.toFixed(2)}</strong></p>
      <p>Ganancia estimada: <strong>${profit.toFixed(2)}</strong></p>
      <p>Margen real: <strong>{margin.toFixed(2)}%</strong></p>
    </div>
  );
};
