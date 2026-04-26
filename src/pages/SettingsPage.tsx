import { useEffect, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useAuthContext } from "../context/AuthContext";
import { logoutUser } from "../services/authService";
import { createRecipe } from "../services/recipeService";
import { importBusinessData, resetBusinessData } from "../services/importExportService";
import { createSupply, getSuppliesOnce } from "../services/supplyService";
import { CreateRecipeInput, Supply } from "../types";

const demoSupplies = [
  { name: "Pan de hamburguesa", category: "Panificados", packageCost: 12000, packageQuantity: 24, packageUnit: "unit" as const },
  { name: "Queso cheddar", category: "Lácteos", packageCost: 18000, packageQuantity: 2, packageUnit: "kg" as const },
  { name: "Salsa BBQ", category: "Salsas", packageCost: 20000, packageQuantity: 5, packageUnit: "l" as const },
  { name: "Medallón de carne", category: "Carnes", packageCost: 45000, packageQuantity: 5, packageUnit: "kg" as const },
  { name: "Caja hamburguesa", category: "Packaging", packageCost: 15000, packageQuantity: 100, packageUnit: "unit" as const },
];

export const SettingsPage = () => {
  const { business, user } = useAuthContext();
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState<string>();
  const [canLoadDemo, setCanLoadDemo] = useState(false);

  useEffect(() => {
    if (!business) return;
    getSuppliesOnce(business.id).then((items) => setCanLoadDemo(items.length === 0));
  }, [business]);

  if (!business) return null;

  const exportData = async () => {
    const supplies = await getSuppliesOnce(business.id);
    const blob = new Blob([JSON.stringify({ supplies }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `star-costos-${business.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    const text = await file.text();
    await importBusinessData(business.id, JSON.parse(text));
    setMessage("Importación completada.");
  };

  const loadDemo = async () => {
    for (const s of demoSupplies) {
      await createSupply(business.id, s);
    }
    const supplies = await getSuppliesOnce(business.id);
    const byName = (name: string): Supply => {
      const found = supplies.find((s) => s.name === name);
      if (!found) throw new Error(`No se encontró insumo demo: ${name}`);
      return found;
    };
    const recipeInput: CreateRecipeInput = {
      name: "Hamburguesa cheddar",
      category: "Panificados",
      ingredients: [
        { supplyId: byName("Pan de hamburguesa").id, quantity: 1, unit: "unit" },
        { supplyId: byName("Medallón de carne").id, quantity: 120, unit: "g" },
        { supplyId: byName("Queso cheddar").id, quantity: 30, unit: "g" },
        { supplyId: byName("Salsa BBQ").id, quantity: 20, unit: "ml" },
        { supplyId: byName("Caja hamburguesa").id, quantity: 1, unit: "unit" },
      ],
      wastePercentage: 3,
      desiredMargin: 35,
      extraCosts: 0,
      roundingMode: "up100",
    };
    await createRecipe(business.id, recipeInput, supplies);
    setCanLoadDemo(false);
    setMessage("Datos demo cargados.");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <h3 className="font-semibold">Negocio</h3>
        <p>{business.name}</p>
        <p className="text-sm text-slate-500">Usuario: {user?.email}</p>
      </div>
      {message && <p className="text-sm text-green-700 bg-green-50 p-2 rounded">{message}</p>}
      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-2 bg-slate-900 text-white rounded" onClick={exportData}>Exportar JSON</button>
        <label className="px-3 py-2 bg-slate-100 rounded cursor-pointer">Importar JSON<input className="hidden" type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} /></label>
        {canLoadDemo && <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={loadDemo}>Cargar demo</button>}
        <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => setShowReset(true)}>Resetear negocio</button>
        <button className="px-3 py-2 bg-slate-700 text-white rounded" onClick={() => logoutUser()}>Cerrar sesión</button>
      </div>
      <ConfirmDialog
        open={showReset}
        title="Resetear datos"
        description="Esta acción borra insumos y recetas. ¿Continuar?"
        onCancel={() => setShowReset(false)}
        onConfirm={async () => {
          await resetBusinessData(business.id);
          setShowReset(false);
          setCanLoadDemo(true);
        }}
      />
    </div>
  );
};
