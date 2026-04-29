import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { RecipeForm } from "../components/RecipeForm";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuthContext } from "../context/AuthContext";
import { createRecipe, deleteRecipe, duplicateRecipe, listenRecipes, removeRecipeCoverImage, setRecipeCoverImage, updateRecipe } from "../services/recipeService";
import { listenSupplies } from "../services/supplyService";
import { Recipe, Supply } from "../types";

export const RecipesPage = () => {
  const { business, categories: businessCategories } = useAuthContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"productionCost" | "realMargin" | "estimatedProfit">("productionCost");
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!business) return;
    const unsubR = listenRecipes(business.id, setRecipes);
    const unsubS = listenSupplies(business.id, setSupplies);
    return () => { unsubR(); unsubS(); };
  }, [business]);

  const categoryOrder = useMemo(() => {
    const fromData = recipes.map((r) => r.category);
    const merged = new Set<string>([...businessCategories.recipes, ...fromData]);
    return Array.from(merged);
  }, [businessCategories.recipes, recipes]);

  const categories = useMemo(() => ["all", ...categoryOrder], [categoryOrder]);
  const filtered = useMemo(() => (
    recipes.filter(
      (r) => r.name.toLowerCase().includes(search.toLowerCase()) && (category === "all" || r.category === category),
    )
  ), [recipes, search, category]);

  const visibleCategories = category === "all" ? categoryOrder : [category];

  const sortValue = (r: Recipe) => {
    if (sortBy === "productionCost") return r.productionCost;
    if (sortBy === "realMargin") return r.realMargin;
    return r.estimatedProfit;
  };

  const sortedByCategory = (cat: string) => (
    [...filtered]
      .filter((r) => r.category === cat)
      .sort((a, b) => {
        const diff = sortValue(b) - sortValue(a);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, "es");
      })
  );

  if (!business) return <EmptyState title="Sin negocio activo" description="No se pudieron cargar las recetas." />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Recetas" description="Ver costo de producción, costo al público, % ganancia y ganancia neta. Ordená por categoría y métrica." />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input label="Buscar" placeholder="Ej: hamburguesa..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Ordenar por" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="productionCost">Costo producción</option>
              <option value="realMargin">% ganancia</option>
              <option value="estimatedProfit">Ganancia neta</option>
            </Select>
            <div className="flex items-end">
              <Button variant="primary" className="w-full" onClick={() => { setEditing(null); setShowForm(true); }}>
                Nueva receta
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {showForm && (
        <Card>
          <CardHeader title={editing ? "Editar receta" : "Nueva receta"} />
          <CardBody>
          <RecipeForm
            supplies={supplies}
            initial={editing ?? undefined}
            onCancel={() => setShowForm(false)}
            onSubmit={async (payload, opts) => {
              if (editing) {
                await updateRecipe(business.id, editing.id, payload, supplies);
                if (opts.removeImage) await removeRecipeCoverImage(business.id, editing.id, editing.imagePath);
                if (opts.imageFile) await setRecipeCoverImage(business.id, editing.id, opts.imageFile);
              } else {
                const id = await createRecipe(business.id, payload, supplies);
                if (opts.imageFile) await setRecipeCoverImage(business.id, id, opts.imageFile);
              }
              setShowForm(false);
            }}
          />
          </CardBody>
        </Card>
      )}

      {!filtered.length ? (
        <EmptyState title="Sin recetas" description="Creá tu primera receta." />
      ) : (
        <div className="space-y-4">
          {visibleCategories.map((cat) => {
            const items = sortedByCategory(cat);
            if (!items.length) return null;
            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{cat}</h3>
                <div className="overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-3 text-left">Receta</th>
                        <th className="p-3 text-right">Costo prod.</th>
                        <th className="p-3 text-right">Costo público</th>
                        <th className="p-3 text-right">% ganancia</th>
                        <th className="p-3 text-right">Ganancia neta</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-100">
                      {items.map((r) => (
                        <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {r.imageUrl ? (
                                <img src={r.imageUrl} alt={r.name} className="h-14 w-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                              ) : (
                                <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" />
                              )}
                              <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</h3>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">${r.productionCost.toFixed(2)}</td>
                          <td className="p-3 text-right">${r.suggestedPrice.toFixed(2)}</td>
                          <td className="p-3 text-right">{r.realMargin.toFixed(2)}%</td>
                          <td className="p-3 text-right">${r.estimatedProfit.toFixed(2)}</td>
                          <td className="p-3 text-right space-x-2 whitespace-nowrap">
                            <Button size="sm" variant="secondary" onClick={() => { setEditing(r); setShowForm(true); }}>Editar</Button>
                            <Button size="sm" variant="ghost" onClick={() => duplicateRecipe(business.id, r)}>Duplicar</Button>
                            <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setToDelete(r)}>Eliminar</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar receta"
        description={`¿Seguro que querés eliminar ${toDelete?.name ?? ""}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteRecipe(business.id, toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
};
