import { RecipeIngredientInput, Supply, Unit } from "../types";
import { UNITS } from "../utils/constants";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

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
          <Select
            className="col-span-12 md:col-span-6"
            value={item.supplyId}
            onChange={(e) => onChange(value.map((v, i) => i === idx ? { ...v, supplyId: e.target.value } : v))}
          >
            {supplies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input
            className="col-span-7 md:col-span-3"
            type="number"
            min={0.01}
            step="0.01"
            value={item.quantity}
            onChange={(e) => onChange(value.map((v, i) => i === idx ? { ...v, quantity: Number(e.target.value) } : v))}
          />
          <Select
            className="col-span-5 md:col-span-2"
            value={item.unit}
            onChange={(e) => onChange(value.map((v, i) => i === idx ? { ...v, unit: e.target.value as Unit } : v))}
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
          <div className="col-span-12 md:col-span-1 flex md:justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 w-full md:w-auto"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
            >
              Quitar
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={add}>Agregar ingrediente</Button>
    </div>
  );
};
