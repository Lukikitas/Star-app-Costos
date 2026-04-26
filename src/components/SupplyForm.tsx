import { useState } from "react";
import { CreateSupplyInput, Supply, Unit } from "../types";
import { SUPPLY_CATEGORIES, UNITS } from "../utils/constants";

interface Props {
  initial?: Supply;
  onSubmit: (payload: CreateSupplyInput) => Promise<void>;
  onCancel: () => void;
}

export const SupplyForm = ({ initial, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<CreateSupplyInput>({
    name: initial?.name ?? "",
    category: initial?.category ?? SUPPLY_CATEGORIES[0],
    packageCost: initial?.packageCost ?? 0,
    packageQuantity: initial?.packageQuantity ?? 1,
    packageUnit: initial?.packageUnit ?? "unit",
  });
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el insumo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input className="w-full border rounded p-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <select className="w-full border rounded p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {SUPPLY_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
      </select>
      <input className="w-full border rounded p-2" type="number" min={0} step="0.01" value={form.packageCost} onChange={(e) => setForm({ ...form, packageCost: Number(e.target.value) })} />
      <input className="w-full border rounded p-2" type="number" min={0.01} step="0.01" value={form.packageQuantity} onChange={(e) => setForm({ ...form, packageQuantity: Number(e.target.value) })} />
      <select className="w-full border rounded p-2" value={form.packageUnit} onChange={(e) => setForm({ ...form, packageUnit: e.target.value as Unit })}>
        {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
      </select>
      <div className="flex gap-2 justify-end">
        <button type="button" className="px-3 py-2 bg-slate-100 rounded" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Guardar</button>
      </div>
    </form>
  );
};
