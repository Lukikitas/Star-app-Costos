import { Supply } from "../types";

interface Props {
  items: Supply[];
  onEdit: (item: Supply) => void;
  onDelete: (item: Supply) => void;
}

export const SupplyTable = ({ items, onEdit, onDelete }: Props) => (
  <div className="overflow-auto bg-white border border-slate-200 rounded-xl">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Categoría</th><th className="p-3 text-left">Costo unidad base</th><th className="p-3" />
        </tr>
      </thead>
      <tbody>
        {items.map((s) => (
          <tr key={s.id} className="border-t">
            <td className="p-3">{s.name}</td>
            <td className="p-3">{s.category}</td>
            <td className="p-3">${s.unitCost.toFixed(2)} / {s.baseUnit}</td>
            <td className="p-3 text-right space-x-2">
              <button className="px-2 py-1 bg-slate-100 rounded" onClick={() => onEdit(s)}>Editar</button>
              <button className="px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => onDelete(s)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
