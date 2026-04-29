import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { useAuthContext } from "../context/AuthContext";
import { listenPriceHistory } from "../services/priceHistoryService";
import { PriceHistoryEntry } from "../types";

export const ComparePage = () => {
  const { business } = useAuthContext();
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [kindFilter, setKindFilter] = useState<"all" | "supply" | "recipe">("all");

  useEffect(() => {
    if (!business) return;
    return listenPriceHistory(business.id, setHistory);
  }, [business]);

  const filtered = useMemo(() => {
    if (kindFilter === "all") return history;
    return history.filter((h) => h.kind === kindFilter);
  }, [history, kindFilter]);

  const formatDate = (entry: PriceHistoryEntry) => {
    const date = entry.createdAt?.toDate?.();
    if (!date) return "-";
    return date.toLocaleString("es-AR");
  };

  if (!filtered.length) {
    return (
      <Card>
        <CardHeader title="Historial de cambios" description="Seguimiento de cambios de precios en insumos y recetas." />
        <CardBody>
          <EmptyState title="Sin cambios todavía" description="Cuando actualices precios, acá vas a ver el antes/después." />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Historial de cambios" description="Auditoría de antes/después para precios de insumos y recetas." />
        <CardBody>
          <div className="max-w-xs">
            <Select label="Tipo de cambio" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}>
              <option value="all">Todos</option>
              <option value="supply">Insumos</option>
              <option value="recipe">Recetas</option>
            </Select>
          </div>
        </CardBody>
      </Card>

      <div className="overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Elemento</th>
              <th className="p-3 text-left">Antes</th>
              <th className="p-3 text-left">Después</th>
              <th className="p-3 text-left">Contexto</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 dark:text-slate-100">
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3">{formatDate(entry)}</td>
                <td className="p-3">{entry.kind === "supply" ? "Insumo" : "Receta"}</td>
                <td className="p-3">{entry.kind === "supply" ? entry.supplyName : entry.recipeName}</td>
                <td className="p-3">
                  {entry.kind === "supply" ? (
                    <div>
                      <div>$/unidad: {(entry.previousUnitCost ?? 0).toFixed(2)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Paquete: ${(entry.previousPackageCost ?? 0).toFixed(2)}</div>
                    </div>
                  ) : (
                    <div>
                      <div>Precio: ${(entry.previousSuggestedPrice ?? 0).toFixed(2)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Margen: {(entry.previousRealMargin ?? 0).toFixed(2)}%</div>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {entry.kind === "supply" ? (
                    <div>
                      <div>$/unidad: {(entry.nextUnitCost ?? 0).toFixed(2)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Paquete: ${(entry.nextPackageCost ?? 0).toFixed(2)}</div>
                    </div>
                  ) : (
                    <div>
                      <div>Precio: ${(entry.nextSuggestedPrice ?? 0).toFixed(2)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Margen: {(entry.nextRealMargin ?? 0).toFixed(2)}%</div>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {entry.kind === "recipe" && entry.triggerSupplyName
                    ? `Recalculada por cambio en insumo: ${entry.triggerSupplyName}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
