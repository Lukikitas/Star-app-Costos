import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
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
    const count = recipes.length;
    const avgProductionCost = count ? recipes.reduce((a, r) => a + r.productionCost, 0) / count : 0;
    const avgPublicCost = count ? recipes.reduce((a, r) => a + r.suggestedPrice, 0) / count : 0;
    const avgEstimatedProfit = count ? recipes.reduce((a, r) => a + r.estimatedProfit, 0) / count : 0;
    const avgRealMargin = count ? recipes.reduce((a, r) => a + r.realMargin, 0) / count : 0;

    const bestByProfit = count ? [...recipes].sort((a, b) => b.estimatedProfit - a.estimatedProfit)[0] : undefined;
    const worstByProfit = count ? [...recipes].sort((a, b) => a.estimatedProfit - b.estimatedProfit)[0] : undefined;
    const bestByMargin = count ? [...recipes].sort((a, b) => b.realMargin - a.realMargin)[0] : undefined;
    const worstByMargin = count ? [...recipes].sort((a, b) => a.realMargin - b.realMargin)[0] : undefined;

    const profitableCount = recipes.filter((r) => r.estimatedProfit > 0).length;

    const categoryCounts = new Map<string, number>();
    for (const r of recipes) categoryCounts.set(r.category, (categoryCounts.get(r.category) ?? 0) + 1);
    const top = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const topCategory = top?.[0];
    const topCategoryCount = top?.[1] ?? 0;

    return {
      avgProductionCost,
      avgPublicCost,
      avgEstimatedProfit,
      avgRealMargin,
      bestByProfit,
      worstByProfit,
      bestByMargin,
      worstByMargin,
      profitableCount,
      topCategory,
      topCategoryCount,
    };
  }, [recipes]);

  if (!business) return <EmptyState title="Sin negocio" description="Registrate para crear tu negocio." />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Resumen"
          description="Tu flujo recomendado: cargá insumos → creá recetas → compará márgenes y precios sugeridos."
        />
        <CardBody className="flex flex-wrap gap-2">
          <Link to="/supplies"><Button variant="primary">Cargar insumos</Button></Link>
          <Link to="/recipes"><Button variant="secondary">Crear receta</Button></Link>
          <Link to="/compare"><Button variant="ghost">Comparar</Button></Link>
        </CardBody>
      </Card>
      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="Insumos" value={supplies.length} />
        <StatCard label="Recetas" value={recipes.length} />
        <StatCard label="Costo prod. prom." value={`$${stats.avgProductionCost.toFixed(2)}`} />
        <StatCard label="Costo público prom." value={`$${stats.avgPublicCost.toFixed(2)}`} />
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="Ganancia neta prom." value={`$${stats.avgEstimatedProfit.toFixed(2)}`} />
        <StatCard label="% ganancia prom." value={`${stats.avgRealMargin.toFixed(2)}%`} />
        <StatCard label="Recetas con ganancia" value={stats.profitableCount} />
        <StatCard label="Categoría más usada" value={stats.topCategory ? `${stats.topCategory} (${stats.topCategoryCount})` : "-"} />
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="Mejor ganancia neta" value={stats.bestByProfit?.name ?? "-"} />
        <StatCard label="Peor ganancia neta" value={stats.worstByProfit?.name ?? "-"} />
        <StatCard label="Mayor % ganancia" value={stats.bestByMargin?.name ?? "-"} />
        <StatCard label="Menor % ganancia" value={stats.worstByMargin?.name ?? "-"} />
      </div>
    </div>
  );
};
