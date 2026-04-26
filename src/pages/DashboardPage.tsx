import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { useAuthContext } from "../context/AuthContext";
import { listenRecipes } from "../services/recipeService";
import { listenSupplies } from "../services/supplyService";
import { Recipe, Supply } from "../types";

export const DashboardPage = () => {
  const { business } = useAuthContext();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!business) return;
    const unsubS = listenSupplies(business.id, setSupplies);
    const unsubR = listenRecipes(business.id, setRecipes);
    return () => { unsubS(); unsubR(); };
  }, [business]);

  const stats = useMemo(() => {
    const avgCost = recipes.length ? recipes.reduce((a, r) => a + r.productionCost, 0) / recipes.length : 0;
    const maxCost = [...recipes].sort((a, b) => b.productionCost - a.productionCost)[0];
    const maxMargin = [...recipes].sort((a, b) => b.realMargin - a.realMargin)[0];
    const minMargin = [...recipes].sort((a, b) => a.realMargin - b.realMargin)[0];
    return { avgCost, maxCost, maxMargin, minMargin };
  }, [recipes]);

  if (!business) return <EmptyState title="Sin negocio" description="Registrate para crear tu negocio." />;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="Insumos" value={supplies.length} />
        <StatCard label="Recetas" value={recipes.length} />
        <StatCard label="Costo promedio" value={`$${stats.avgCost.toFixed(2)}`} />
        <StatCard label="Productos cargados" value={recipes.length} />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Receta más cara" value={stats.maxCost?.name ?? "-"} />
        <StatCard label="Mayor margen" value={stats.maxMargin?.name ?? "-"} />
        <StatCard label="Menor margen" value={stats.minMargin?.name ?? "-"} />
      </div>
      <div className="flex gap-2">
        <Link to="/supplies" className="px-4 py-2 rounded bg-blue-600 text-white">Crear insumo</Link>
        <Link to="/recipes" className="px-4 py-2 rounded bg-slate-900 text-white">Crear receta</Link>
      </div>
    </div>
  );
};
