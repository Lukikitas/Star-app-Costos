import { useMemo } from "react";
import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader } from "./ui/Card";

export type ImpactedRecipeRow = {
  id: string;
  name: string;
  category: string;
  desiredMargin: number;
  oldSuggestedPrice: number;
  newSuggestedPrice: number;
  oldEstimatedProfit: number;
  newEstimatedProfit: number;
  oldRealMargin: number;
  newRealMargin: number;
  oldProductionCost: number;
  newProductionCost: number;
  error?: string;
};

interface Props {
  open: boolean;
  loading: boolean;
  rows: ImpactedRecipeRow[];
  selected: Record<string, boolean>;
  globalError?: string;
  onToggle: (recipeId: string) => void;
  onApplySelected: () => void;
  onSkip: () => void;
}

export const ImpactedRecipesDialog = ({
  open,
  loading,
  rows,
  selected,
  globalError,
  onToggle,
  onApplySelected,
  onSkip,
}: Props) => {
  const affectedCount = rows.length;
  const selectableCount = useMemo(() => rows.filter((r) => !r.error).length, [rows]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader
          title="Recetas afectadas por el cambio de precio"
          description={
            affectedCount
              ? `Se encontraron ${affectedCount} receta(s) que usan este insumo. El recálculo mantiene el “margen deseado” de cada receta y sugiere el nuevo precio.`
              : "No hay recetas afectadas."
          }
        />
        <CardBody className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">Calculando recetas afectadas…</p>
          ) : (
            <>
              {globalError ? (
                <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                  {globalError}
                </p>
              ) : null}
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Seleccionables: <strong>{selectableCount}</strong> (las que se pudieron recalcular).
              </div>

              {rows.length ? (
                <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-3 text-left">Receta</th>
                        <th className="p-3 text-right">Precio sugerido</th>
                        <th className="p-3 text-right">% margen</th>
                        <th className="p-3 text-right">Ganancia neta</th>
                        <th className="p-3 text-right">Actualizar</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 dark:text-slate-100">
                      {rows.map((r) => {
                        const checked = Boolean(selected[r.id]);
                        return (
                          <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                            <td className="p-3">
                              <div className="font-medium">{r.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{r.category} · margen deseado {r.desiredMargin}%</div>
                              {r.error ? <div className="text-xs text-red-600 dark:text-red-300 mt-1">{r.error}</div> : null}
                            </td>
                            <td className="p-3 text-right">
                              <div>${r.oldSuggestedPrice.toFixed(2)} → <span className="font-semibold">${r.newSuggestedPrice.toFixed(2)}</span></div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Costo prod.: ${r.oldProductionCost.toFixed(2)} → ${r.newProductionCost.toFixed(2)}</div>
                            </td>
                            <td className="p-3 text-right">
                              <div>{r.oldRealMargin.toFixed(2)}% → <span className="font-semibold">{r.newRealMargin.toFixed(2)}%</span></div>
                            </td>
                            <td className="p-3 text-right">
                              <div>${r.oldEstimatedProfit.toFixed(2)} → <span className="font-semibold">${r.newEstimatedProfit.toFixed(2)}</span></div>
                            </td>
                            <td className="p-3 text-right">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={Boolean(r.error)}
                                onChange={() => onToggle(r.id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">Con este cambio no se afecta ninguna receta.</p>
              )}
            </>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onSkip} disabled={loading}>
              No actualizar recetas
            </Button>
            <Button variant="primary" onClick={onApplySelected} disabled={loading || rows.every((r) => Boolean(r.error) || !selected[r.id])}>
              Aplicar seleccionadas
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

