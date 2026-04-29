import { useEffect, useState } from "react";
import { CreateSupplyInput, Supply, Unit } from "../types";
import { UNITS } from "../utils/constants";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { useAuthContext } from "../context/AuthContext";

interface Props {
  initial?: Supply;
  onSubmit: (payload: CreateSupplyInput, opts: { imageFile?: File | null; removeImage?: boolean }) => Promise<void>;
  onCancel: () => void;
}

export const SupplyForm = ({ initial, onSubmit, onCancel }: Props) => {
  const { categories } = useAuthContext();
  const [form, setForm] = useState<CreateSupplyInput>({
    name: initial?.name ?? "",
    category: initial?.category ?? categories.supplies[0] ?? "Otros",
    packageCost: initial?.packageCost ?? 0,
    packageQuantity: initial?.packageQuantity ?? 1,
    packageUnit: initial?.packageUnit ?? "unit",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(form, { imageFile, removeImage });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el insumo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <Input label="Nombre" placeholder="Ej: Queso cheddar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Select label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {categories.supplies.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </Select>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          label="Costo del paquete"
          type="number"
          min={0}
          step="0.01"
          value={form.packageCost}
          onChange={(e) => setForm({ ...form, packageCost: Number(e.target.value) })}
        />
        <Input
          label="Cantidad del paquete"
          type="number"
          min={0.01}
          step="0.01"
          value={form.packageQuantity}
          onChange={(e) => setForm({ ...form, packageQuantity: Number(e.target.value) })}
        />
      </div>
      <Select label="Unidad del paquete" value={form.packageUnit} onChange={(e) => setForm({ ...form, packageUnit: e.target.value as Unit })}>
        {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
      </Select>

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
          <img src={previewUrl} alt="Preview" className="h-36 w-36 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
        ) : initial?.imageUrl && !removeImage ? (
          <img src={initial.imageUrl} alt={initial.name} className="h-36 w-36 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
        ) : null}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary">Guardar</Button>
      </div>
    </form>
  );
};
