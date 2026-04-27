import { useEffect, useState } from "react";
import { CreateRecipeInput, Recipe, RoundingMode, Supply } from "../types";
import { ROUNDING_MODES } from "../utils/constants";
import { IngredientSelector } from "./IngredientSelector";
import { RecipeCostSummary } from "./RecipeCostSummary";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { useAuthContext } from "../context/AuthContext";

interface Props {
  supplies: Supply[];
  initial?: Recipe;
  onSubmit: (payload: CreateRecipeInput, opts: { imageFile?: File | null; removeImage?: boolean }) => Promise<void>;
  onCancel: () => void;
}

export const RecipeForm = ({ supplies, initial, onSubmit, onCancel }: Props) => {
  const { categories } = useAuthContext();
  const [form, setForm] = useState<CreateRecipeInput>({
    name: initial?.name ?? "",
    category: initial?.category ?? categories.recipes[0] ?? "Otros",
    ingredients: initial?.ingredients.map((x) => ({ supplyId: x.supplyId, quantity: x.quantity, unit: x.unit })) ?? [],
    wastePercentage: initial?.wastePercentage ?? 0,
    desiredMargin: initial?.desiredMargin ?? 35,
    extraCosts: initial?.extraCosts ?? 0,
    roundingMode: initial?.roundingMode ?? "none",
  });
  const [error, setError] = useState<string>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(form, { imageFile, removeImage });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la receta.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <Input label="Nombre" placeholder="Ej: Hamburguesa cheddar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Select label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {categories.recipes.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </Select>
      <IngredientSelector value={form.ingredients} supplies={supplies} onChange={(ingredients) => setForm({ ...form, ingredients })} />
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Merma (%)"
          hint="Se aplica sobre el costo de producción + extras."
          type="number"
          value={form.wastePercentage}
          onChange={(e) => setForm({ ...form, wastePercentage: Number(e.target.value) })}
        />
        <Input
          label="Costos extra"
          hint="Ej: packaging, delivery, gas."
          type="number"
          value={form.extraCosts}
          onChange={(e) => setForm({ ...form, extraCosts: Number(e.target.value) })}
        />
        <Input
          label="Margen deseado (%)"
          hint="Objetivo de ganancia sobre precio final."
          type="number"
          value={form.desiredMargin}
          onChange={(e) => setForm({ ...form, desiredMargin: Number(e.target.value) })}
        />
        <Select
          label="Redondeo"
          hint="Opcional: ajusta el precio sugerido."
          value={form.roundingMode}
          onChange={(e) => setForm({ ...form, roundingMode: e.target.value as RoundingMode })}
        >
          {ROUNDING_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </Select>
      </div>
      <RecipeCostSummary input={form} supplies={supplies} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Foto (opcional)</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
              if (file) setRemoveImage(false);
            }}
          />
          {initial?.imageUrl && !removeImage && !imageFile && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => setRemoveImage(true)}
            >
              Quitar foto actual
            </Button>
          )}
          {removeImage && <p className="text-xs text-slate-500 dark:text-slate-400">Se eliminará la foto al guardar.</p>}
        </div>
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="h-24 w-24 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
        ) : initial?.imageUrl && !removeImage ? (
          <img src={initial.imageUrl} alt={initial.name} className="h-24 w-24 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
        ) : null}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit">Guardar</Button>
      </div>
    </form>
  );
};
