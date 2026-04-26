import { RecipeIngredientInput, Supply, Unit } from "../types";
import { UNITS } from "../utils/constants";

interface Props {
  value: RecipeIngredientInput[];
  supplies: Supply[];
  onChange: (items: RecipeIngredientInput[]) => void;
}

export const IngredientSelector = ({ value, supplies, onChange }: Props) => {
  const add = () => onChange([...value, { supplyId: supplies[0]?.id ?? "", quantity: 1, unit: "unit" }]);
  return (
    <div className="space-y-2">
      {value.map((item, idx) => (
        <div key={`${item.supplyId}-${idx}`} className="grid grid-cols-12 gap-2">
          <select className="col-span-5 border rounded p-2" value={item.supplyId} onChange={(e) => onChange(value.map((v, i) => i === idx ? { ...v, supplyId: e.target.value } : v))}>
            {supplies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="col-span-3 border rounded p-2" type="number" min={0.01} step="0.01" value={item.quantity} onChange={(e) => onChange(value.map((v, i) => i === idx ? { ...v, quantity: Number(e.target.value) } : v))} />
          <select className="col-span-3 border rounded p-2" value={item.unit} onChange={(e) => onChange(value.map((v, i) => i === idx ? { ...v, unit: e.target.value as Unit } : v))}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
          <button type="button" className="col-span-1 bg-red-100 text-red-700 rounded" onClick={() => onChange(value.filter((_, i) => i !== idx))}>x</button>
        </div>
      ))}
      <button type="button" className="px-3 py-2 bg-slate-100 rounded" onClick={add}>Agregar ingrediente</button>
    </div>
  );
};
