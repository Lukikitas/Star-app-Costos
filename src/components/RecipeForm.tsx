import { useState } from "react";
import { CreateRecipeInput, Recipe, RoundingMode, Supply } from "../types";
import { ROUNDING_MODES, SUPPLY_CATEGORIES } from "../utils/constants";
import { IngredientSelector } from "./IngredientSelector";
import { RecipeCostSummary } from "./RecipeCostSummary";

interface Props {
  supplies: Supply[];
  initial?: Recipe;
  onSubmit: (payload: CreateRecipeInput) => Promise<void>;
  onCancel: () => void;
}

export const RecipeForm = ({ supplies, initial, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<CreateRecipeInput>({
    name: initial?.name ?? "",
    category: initial?.category ?? SUPPLY_CATEGORIES[0],
    ingredients: initial?.ingredients.map((x) => ({ supplyId: x.supplyId, quantity: x.quantity, unit: x.unit })) ?? [],
    wastePercentage: initial?.wastePercentage ?? 0,
    desiredMargin: initial?.desiredMargin ?? 35,
    extraCosts: initial?.extraCosts ?? 0,
    roundingMode: initial?.roundingMode ?? "none",
  });
  const [error, setError] = useState<string>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la receta.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input className="w-full border rounded p-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <select className="w-full border rounded p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {SUPPLY_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
      </select>
      <IngredientSelector value={form.ingredients} supplies={supplies} onChange={(ingredients) => setForm({ ...form, ingredients })} />
      <div className="grid grid-cols-2 gap-2">
        <input className="border rounded p-2" type="number" placeholder="Merma %" value={form.wastePercentage} onChange={(e) => setForm({ ...form, wastePercentage: Number(e.target.value) })} />
        <input className="border rounded p-2" type="number" placeholder="Costos extra" value={form.extraCosts} onChange={(e) => setForm({ ...form, extraCosts: Number(e.target.value) })} />
        <input className="border rounded p-2" type="number" placeholder="Margen deseado %" value={form.desiredMargin} onChange={(e) => setForm({ ...form, desiredMargin: Number(e.target.value) })} />
        <select className="border rounded p-2" value={form.roundingMode} onChange={(e) => setForm({ ...form, roundingMode: e.target.value as RoundingMode })}>
          {ROUNDING_MODES.map((mode) => <option key={mode}>{mode}</option>)}
        </select>
      </div>
      <RecipeCostSummary input={form} supplies={supplies} />
      <div className="flex justify-end gap-2">
        <button type="button" className="px-3 py-2 bg-slate-100 rounded" onClick={onCancel}>Cancelar</button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit">Guardar</button>
      </div>
    </form>
  );
};
