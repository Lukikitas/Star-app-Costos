import { Supply } from "../types";
import { Button } from "./ui/Button";

interface Props {
  items: Supply[];
  onEdit: (item: Supply) => void;
  onDelete: (item: Supply) => void;
}

export const SupplyTable = ({ items, onEdit, onDelete }: Props) => (
  <div className="overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
    <table className="w-full min-w-[700px] text-sm">
      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <tr>
          <th className="p-3 text-left"> </th>
          <th className="p-3 text-left">Nombre</th>
          <th className="p-3 text-left">Categoría</th>
          <th className="p-3 text-left">Costo unidad base</th>
          <th className="p-3" />
        </tr>
      </thead>
      <tbody className="text-slate-900 dark:text-slate-100">
        {items.map((s) => (
          <tr key={s.id} className="border-t border-slate-200 dark:border-slate-800">
            <td className="p-3">
              {s.imageUrl ? (
                <img src={s.imageUrl} alt={s.name} className="h-14 w-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" />
              )}
            </td>
            <td className="p-3">{s.name}</td>
            <td className="p-3 text-slate-600 dark:text-slate-300">{s.category}</td>
            <td className="p-3">${s.unitCost.toFixed(2)} / {s.baseUnit}</td>
            <td className="p-3 text-right space-x-2 whitespace-nowrap">
              <Button size="sm" variant="secondary" onClick={() => onEdit(s)}>Editar</Button>
              <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onDelete(s)}>Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
