import { useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { useAuthContext } from "../context/AuthContext";
import { listenRecipes } from "../services/recipeService";
import { Recipe } from "../types";

const getStatus = (margin: number) => {
  if (margin >= 35) return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300";
  if (margin >= 20) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-200";
  return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300";
};

export const ComparePage = () => {
  const { business } = useAuthContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!business) return;
    return listenRecipes(business.id, setRecipes);
  }, [business]);

  if (!recipes.length) return <EmptyState title="Sin datos" description="No hay recetas para comparar." />;

  return (
    <div className="overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
          <tr>
            {['Nombre','Categoría','Costo prod.','Costo final','Margen deseado','Precio sugerido','Ganancia','Margen real','Estado'].map((h) => (
              <th key={h} className="p-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-900 dark:text-slate-100">
          {recipes.map((r) => (
            <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
              <td className="p-3">{r.name}</td><td className="p-3">{r.category}</td><td className="p-3">${r.productionCost.toFixed(2)}</td><td className="p-3">${r.finalCost.toFixed(2)}</td><td className="p-3">{r.desiredMargin}%</td><td className="p-3">${r.suggestedPrice.toFixed(2)}</td><td className="p-3">${r.estimatedProfit.toFixed(2)}</td><td className="p-3">{r.realMargin.toFixed(2)}%</td>
              <td className="p-3"><span className={`px-2 py-1 rounded ${getStatus(r.realMargin)}`}>{r.realMargin >= 35 ? 'Óptimo' : r.realMargin >= 20 ? 'Medio' : 'Bajo'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
