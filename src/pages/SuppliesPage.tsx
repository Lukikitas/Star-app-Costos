import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { SupplyForm } from "../components/SupplyForm";
import { SupplyTable } from "../components/SupplyTable";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuthContext } from "../context/AuthContext";
import { ImpactedRecipesDialog, ImpactedRecipeRow } from "../components/ImpactedRecipesDialog";
import { createSupply, deleteSupply, getSuppliesOnce, listenSupplies, removeSupplyCoverImage, setSupplyCoverImage, updateSupply } from "../services/supplyService";
import { applyRecipePricingRecalculation, getRecipesOnce, recalculateRecipePricing } from "../services/recipeService";
import { calculateUnitCost } from "../utils/costCalculations";
import { Recipe, Supply } from "../types";

export const SuppliesPage = () => {
  const { business, categories: businessCategories } = useAuthContext();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<Supply | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Supply | null>(null);
  const [impactOpen, setImpactOpen] = useState(false);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactRows, setImpactRows] = useState<ImpactedRecipeRow[]>([]);
  const [impactSelected, setImpactSelected] = useState<Record<string, boolean>>({});
  const [impactSupplies, setImpactSupplies] = useState<Supply[]>([]);
  const [impactRecipeById, setImpactRecipeById] = useState<Record<string, Recipe>>({});
  const [impactGlobalError, setImpactGlobalError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!business) return;
    return listenSupplies(business.id, setSupplies);
  }, [business]);

  const categories = useMemo(() => {
    const fromData = supplies.map((s) => s.category);
    const merged = new Set<string>([...businessCategories.supplies, ...fromData]);
    return ["all", ...Array.from(merged)];
  }, [businessCategories.supplies, supplies]);
  const filtered = supplies.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) && (category === "all" || s.category === category));

  if (!business) return <EmptyState title="Sin negocio activo" description="No se pudo cargar los insumos." />;

  const loadImpactedRecipesForSupply = async (supplyId: string) => {
    setImpactLoading(true);
    setImpactOpen(true);
    setImpactGlobalError(undefined);

    try {
      const [freshSupplies, freshRecipes] = await Promise.all([
        getSuppliesOnce(business.id),
        getRecipesOnce(business.id),
      ]);

      // Guardamos para el APPLY posterior (recálculo con datos consistentes).
      setImpactSupplies(freshSupplies);

      const affected = freshRecipes.filter((r) => r.ingredients.some((i) => i.supplyId === supplyId));
      const rows: ImpactedRecipeRow[] = affected.map((r) => {
        try {
          const next = recalculateRecipePricing(r, freshSupplies);
          return {
            id: r.id,
            name: r.name,
            category: r.category,
            desiredMargin: r.desiredMargin,
            oldSuggestedPrice: r.suggestedPrice,
            newSuggestedPrice: next.suggestedPrice,
            oldEstimatedProfit: r.estimatedProfit,
            newEstimatedProfit: next.estimatedProfit,
            oldRealMargin: r.realMargin,
            newRealMargin: next.realMargin,
            oldProductionCost: r.productionCost,
            newProductionCost: next.productionCost,
          };
        } catch (e) {
          return {
            id: r.id,
            name: r.name,
            category: r.category,
            desiredMargin: r.desiredMargin,
            oldSuggestedPrice: r.suggestedPrice,
            newSuggestedPrice: r.suggestedPrice,
            oldEstimatedProfit: r.estimatedProfit,
            newEstimatedProfit: r.estimatedProfit,
            oldRealMargin: r.realMargin,
            newRealMargin: r.realMargin,
            oldProductionCost: r.productionCost,
            newProductionCost: r.productionCost,
            error: e instanceof Error ? e.message : "No se pudo recalcular.",
          };
        }
      });

      const selected: Record<string, boolean> = {};
      for (const row of rows) selected[row.id] = !row.error;

      const recipeById: Record<string, Recipe> = {};
      for (const r of affected) recipeById[r.id] = r;

      // Si hay cero afectadas, dejamos el modal igualmente abierto con el mensaje.
      setImpactRows(rows);
      setImpactSelected(selected);
      setImpactRecipeById(recipeById);

    } catch (e) {
      console.error("[SuppliesPage] loadImpactedRecipesForSupply failed", e);
      setImpactGlobalError(
        e instanceof Error ? e.message : "No se pudo calcular qué recetas se ven afectadas por el cambio.",
      );
      setImpactRows([]);
      setImpactSelected({});
      setImpactRecipeById({});
    } finally {
      setImpactLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Insumos" description="Cargá tus insumos con su costo y unidad para calcular costos por receta." />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input label="Buscar" placeholder="Ej: queso, pan..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div className="flex items-end">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => { setEditing(null); setShowForm(true); }}
              >
                Nuevo insumo
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {showForm && (
        <Card>
          <CardHeader title={editing ? "Editar insumo" : "Nuevo insumo"} />
          <CardBody>
          <SupplyForm
            initial={editing ?? undefined}
            onCancel={() => setShowForm(false)}
            onSubmit={async (payload, opts) => {
              const supplyToEdit = editing;
              const newUnitCost = supplyToEdit
                ? calculateUnitCost(payload.packageCost, payload.packageQuantity, payload.packageUnit)
                : null;

              if (supplyToEdit) {
                await updateSupply(business.id, supplyToEdit.id, payload);
                if (opts.removeImage) await removeSupplyCoverImage(business.id, supplyToEdit.id, supplyToEdit.imagePath);
                if (opts.imageFile) await setSupplyCoverImage(business.id, supplyToEdit.id, opts.imageFile);
              } else {
                const id = await createSupply(business.id, payload);
                if (opts.imageFile) await setSupplyCoverImage(business.id, id, opts.imageFile);
              }
              setShowForm(false);

              // Si subió el costo unitario del insumo, mostramos qué recetas cambian.
              // (usamos el unitCost recalculado con la misma fórmula del backend)
              if (supplyToEdit && newUnitCost != null && newUnitCost > supplyToEdit.unitCost) {
                await loadImpactedRecipesForSupply(supplyToEdit.id);
              }
            }}
          />
          </CardBody>
        </Card>
      )}

      {!filtered.length ? (
        <EmptyState title="Sin insumos" description="Cargá el primer insumo para comenzar." />
      ) : (
        <SupplyTable
          items={filtered}
          onEdit={(item) => { setEditing(item); setShowForm(true); }}
          onDelete={(item) => setToDelete(item)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar insumo"
        description={`¿Seguro que querés eliminar ${toDelete?.name ?? ""}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteSupply(business.id, toDelete.id);
          setToDelete(null);
        }}
      />

      <ImpactedRecipesDialog
        open={impactOpen}
        loading={impactLoading}
        rows={impactRows}
        selected={impactSelected}
        globalError={impactGlobalError}
        onToggle={(recipeId) => setImpactSelected((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }))}
        onSkip={() => setImpactOpen(false)}
        onApplySelected={async () => {
          const ids = Object.entries(impactSelected)
            .filter(([, v]) => v)
            .map(([id]) => id);
          if (!ids.length) {
            setImpactOpen(false);
            return;
          }

          setImpactLoading(true);
          setImpactGlobalError(undefined);
          try {
            await Promise.all(
              ids.map((rid) => {
                const recipe = impactRecipeById[rid];
                if (!recipe) return Promise.resolve();
                return applyRecipePricingRecalculation(business.id, rid, recipe, impactSupplies);
              }),
            );
            setImpactOpen(false);
          } catch (e) {
            console.error("[SuppliesPage] applyRecipePricingRecalculation failed", e);
            setImpactGlobalError(
              e instanceof Error ? e.message : "No se pudieron aplicar los cambios a todas las recetas.",
            );
          } finally {
            setImpactLoading(false);
          }
        }}
      />
    </div>
  );
};
