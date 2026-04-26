import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { RecipeForm } from "../components/RecipeForm";
import { useAuthContext } from "../context/AuthContext";
import { createRecipe, deleteRecipe, duplicateRecipe, listenRecipes, updateRecipe } from "../services/recipeService";
import { listenSupplies } from "../services/supplyService";
import { Recipe, Supply } from "../types";

export const RecipesPage = () => {
  const { business } = useAuthContext();
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

  const categories = useMemo(() => ["all", ...new Set(recipes.map((r) => r.category))], [recipes]);
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) && (category === "all" || r.category === category));

  if (!business) return <EmptyState title="Sin negocio activo" description="No se pudieron cargar las recetas." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input className="border rounded p-2" placeholder="Buscar receta" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border rounded p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => { setEditing(null); setShowForm(true); }}>Nueva receta</button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-4">
          <RecipeForm
            supplies={supplies}
            initial={editing ?? undefined}
            onCancel={() => setShowForm(false)}
            onSubmit={async (payload) => {
              if (editing) await updateRecipe(business.id, editing.id, payload, supplies);
              else await createRecipe(business.id, payload, supplies);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {!filtered.length ? <EmptyState title="Sin recetas" description="Creá tu primera receta." /> : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center justify-between gap-2" key={r.id}>
              <div>
                <h3 className="font-semibold">{r.name}</h3>
                <p className="text-sm text-slate-500">{r.category} · Margen real {r.realMargin.toFixed(2)}%</p>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-slate-100" onClick={() => { setEditing(r); setShowForm(true); }}>Editar</button>
                <button className="px-2 py-1 rounded bg-amber-100" onClick={() => duplicateRecipe(business.id, r)}>Duplicar</button>
                <button className="px-2 py-1 rounded bg-red-100 text-red-700" onClick={() => setToDelete(r)}>Eliminar</button>
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
