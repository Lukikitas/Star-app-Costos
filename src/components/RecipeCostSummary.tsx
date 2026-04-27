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
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm space-y-1">
      <p className="text-slate-600 dark:text-slate-300">
        Costo de producción (ingredientes): <strong className="text-slate-900 dark:text-slate-100">${production.toFixed(2)}</strong>
      </p>
      <p className="text-slate-600 dark:text-slate-300">
        Costo final (con merma + extras): <strong className="text-slate-900 dark:text-slate-100">${finalCost.toFixed(2)}</strong>
      </p>
      <p className="text-slate-600 dark:text-slate-300">
        Precio sugerido (según margen y redondeo): <strong className="text-slate-900 dark:text-slate-100">${suggested.toFixed(2)}</strong>
      </p>
      <p className="text-slate-600 dark:text-slate-300">
        Ganancia estimada: <strong className="text-slate-900 dark:text-slate-100">${profit.toFixed(2)}</strong>
      </p>
      <p className="text-slate-600 dark:text-slate-300">
        Margen real: <strong className="text-slate-900 dark:text-slate-100">{margin.toFixed(2)}%</strong>
      </p>
    </div>
  );
};
