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
    const avgCost = recipes.length ? recipes.reduce((a, r) => a + r.productionCost, 0) / recipes.length : 0;
    const maxCost = [...recipes].sort((a, b) => b.productionCost - a.productionCost)[0];
    const maxMargin = [...recipes].sort((a, b) => b.realMargin - a.realMargin)[0];
    const minMargin = [...recipes].sort((a, b) => a.realMargin - b.realMargin)[0];
    return { avgCost, maxCost, maxMargin, minMargin };
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
        <StatCard label="Costo promedio" value={`$${stats.avgCost.toFixed(2)}`} />
        <StatCard label="Productos cargados" value={recipes.length} />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Receta más cara" value={stats.maxCost?.name ?? "-"} />
        <StatCard label="Mayor margen" value={stats.maxMargin?.name ?? "-"} />
        <StatCard label="Menor margen" value={stats.minMargin?.name ?? "-"} />
      </div>
    </div>
  );
};
