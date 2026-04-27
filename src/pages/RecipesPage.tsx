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
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!business) return;
    const unsubR = listenRecipes(business.id, setRecipes);
    const unsubS = listenSupplies(business.id, setSupplies);
    return () => { unsubR(); unsubS(); };
  }, [business]);

  const categories = useMemo(() => {
    const fromData = recipes.map((r) => r.category);
    const merged = new Set<string>([...businessCategories.recipes, ...fromData]);
    return ["all", ...Array.from(merged)];
  }, [businessCategories.recipes, recipes]);
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) && (category === "all" || r.category === category));

  if (!business) return <EmptyState title="Sin negocio activo" description="No se pudieron cargar las recetas." />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Recetas" description="Armá recetas con ingredientes y obtené costo final, margen real y precio sugerido." />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input label="Buscar" placeholder="Ej: hamburguesa..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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

      {!filtered.length ? <EmptyState title="Sin recetas" description="Creá tu primera receta." /> : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2" key={r.id}>
              <div className="flex items-center gap-3">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.name} className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" />
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{r.category} · Margen real {r.realMargin.toFixed(2)}%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setEditing(r); setShowForm(true); }}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => duplicateRecipe(business.id, r)}>Duplicar</Button>
                <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setToDelete(r)}>Eliminar</Button>
              </div>
            </div>
          ))}
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
