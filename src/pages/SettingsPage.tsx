import { useEffect, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { logoutUser } from "../services/authService";
import { addCategory, removeCategory, renameCategory } from "../services/categoryService";
import { createRecipe } from "../services/recipeService";
import { importBusinessData, resetBusinessData } from "../services/importExportService";
import { createSupply, getSuppliesOnce } from "../services/supplyService";
import { updateBusiness } from "../services/businessService";
import { CreateRecipeInput, Supply } from "../types";

const demoSupplies = [
  { name: "Pan de hamburguesa", category: "Panificados", packageCost: 12000, packageQuantity: 24, packageUnit: "unit" as const },
  { name: "Queso cheddar", category: "Lácteos", packageCost: 18000, packageQuantity: 2, packageUnit: "kg" as const },
  { name: "Salsa BBQ", category: "Salsas", packageCost: 20000, packageQuantity: 5, packageUnit: "l" as const },
  { name: "Medallón de carne", category: "Carnes", packageCost: 45000, packageQuantity: 5, packageUnit: "kg" as const },
  { name: "Caja hamburguesa", category: "Packaging", packageCost: 15000, packageQuantity: 100, packageUnit: "unit" as const },
];

export const SettingsPage = () => {
  const { business, user, categories } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState<string>();
  const [canLoadDemo, setCanLoadDemo] = useState(false);
  const [newSupplyCategory, setNewSupplyCategory] = useState("");
  const [newRecipeCategory, setNewRecipeCategory] = useState("");
  const [catError, setCatError] = useState<string>();
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    if (!business) return;
    getSuppliesOnce(business.id).then((items) => setCanLoadDemo(items.length === 0));
    setBusinessName(business.name);
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
      <Card>
        <CardHeader title="Negocio" description="Podés actualizar el nombre visible de tu negocio." />
        <CardBody className="space-y-3">
          <p className="font-medium text-slate-900 dark:text-slate-100">{business.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Usuario: {user?.email}</p>
          <div className="flex flex-wrap gap-2 items-end">
            <Input
              label="Nombre del negocio"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="secondary"
              onClick={async () => {
                const next = businessName.trim();
                if (!next) return;
                await updateBusiness(business.id, { name: next });
                setMessage("Nombre del negocio actualizado.");
              }}
            >
              Guardar nombre
            </Button>
          </div>
        </CardBody>
      </Card>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">Apariencia</h3>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">Tema</p>
          <Select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)} className="max-w-[220px]">
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </Select>
        </div>
      </div>

      {message && <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 p-2 rounded">{message}</p>}

      <Card>
        <CardHeader title="Categorías" description="Administrá categorías por negocio. Se usan en filtros y formularios." />
        <CardBody className="space-y-6">
          {catError && <p className="text-sm text-red-600 dark:text-red-300">{catError}</p>}

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Categorías de insumos</h4>
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-sm"
                placeholder="Nueva categoría (insumos)"
                value={newSupplyCategory}
                onChange={(e) => setNewSupplyCategory(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={async () => {
                  if (!business) return;
                  setCatError(undefined);
                  try {
                    await addCategory(business.id, "supplies", newSupplyCategory);
                    setNewSupplyCategory("");
                  } catch (e) {
                    setCatError(e instanceof Error ? e.message : "No se pudo agregar la categoría.");
                  }
                }}
              >
                Agregar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {categories.supplies.map((cat) => (
                <div key={cat} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2">
                  <input
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none"
                    defaultValue={cat}
                    onBlur={async (e) => {
                      const next = e.target.value;
                      if (!business || next.trim() === cat.trim()) return;
                      setCatError(undefined);
                      try {
                        await renameCategory(business.id, "supplies", cat, next);
                      } catch (err) {
                        setCatError(err instanceof Error ? err.message : "No se pudo renombrar la categoría.");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      if (!business) return;
                      setCatError(undefined);
                      try {
                        await removeCategory(business.id, "supplies", cat);
                      } catch (err) {
                        setCatError(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
                      }
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Categorías de recetas</h4>
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-sm"
                placeholder="Nueva categoría (recetas)"
                value={newRecipeCategory}
                onChange={(e) => setNewRecipeCategory(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={async () => {
                  if (!business) return;
                  setCatError(undefined);
                  try {
                    await addCategory(business.id, "recipes", newRecipeCategory);
                    setNewRecipeCategory("");
                  } catch (e) {
                    setCatError(e instanceof Error ? e.message : "No se pudo agregar la categoría.");
                  }
                }}
              >
                Agregar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {categories.recipes.map((cat) => (
                <div key={cat} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2">
                  <input
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none"
                    defaultValue={cat}
                    onBlur={async (e) => {
                      const next = e.target.value;
                      if (!business || next.trim() === cat.trim()) return;
                      setCatError(undefined);
                      try {
                        await renameCategory(business.id, "recipes", cat, next);
                      } catch (err) {
                        setCatError(err instanceof Error ? err.message : "No se pudo renombrar la categoría.");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      if (!business) return;
                      setCatError(undefined);
                      try {
                        await removeCategory(business.id, "recipes", cat);
                      } catch (err) {
                        setCatError(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
                      }
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={exportData}>Exportar JSON</Button>
        <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg cursor-pointer">
          Importar JSON
          <input className="hidden" type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        </label>
        {canLoadDemo && <Button variant="primary" onClick={loadDemo}>Cargar demo</Button>}
        <Button variant="danger" onClick={() => setShowReset(true)}>Resetear negocio</Button>
        <Button variant="secondary" onClick={() => logoutUser()}>Cerrar sesión</Button>
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
