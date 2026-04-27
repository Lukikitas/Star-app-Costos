import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { SupplyForm } from "../components/SupplyForm";
import { SupplyTable } from "../components/SupplyTable";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuthContext } from "../context/AuthContext";
import { createSupply, deleteSupply, listenSupplies, removeSupplyCoverImage, setSupplyCoverImage, updateSupply } from "../services/supplyService";
import { Supply } from "../types";

export const SuppliesPage = () => {
  const { business, categories: businessCategories } = useAuthContext();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<Supply | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Supply | null>(null);

  useEffect(() => {
    if (!business) return;
    return listenSupplies(business.id, setSupplies);
  }, [business]);

  const categories = useMemo(() => {
    const fromData = supplies.map((s) => s.category);
    const merged = new Set<string>([...businessCategories.supplies, ...fromData]);
    return ["all", ...Array.from(merged)];
  }, [businessCategories.supplies, supplies]);
  const filtered = supplies.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) && (category === "all" || s.category === category));

  if (!business) return <EmptyState title="Sin negocio activo" description="No se pudo cargar los insumos." />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Insumos" description="Cargá tus insumos con su costo y unidad para calcular costos por receta." />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input label="Buscar" placeholder="Ej: queso, pan..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div className="flex items-end">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => { setEditing(null); setShowForm(true); }}
              >
                Nuevo insumo
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {showForm && (
        <Card>
          <CardHeader title={editing ? "Editar insumo" : "Nuevo insumo"} />
          <CardBody>
          <SupplyForm
            initial={editing ?? undefined}
            onCancel={() => setShowForm(false)}
            onSubmit={async (payload, opts) => {
              if (editing) {
                await updateSupply(business.id, editing.id, payload);
                if (opts.removeImage) await removeSupplyCoverImage(business.id, editing.id, editing.imagePath);
                if (opts.imageFile) await setSupplyCoverImage(business.id, editing.id, opts.imageFile);
              } else {
                const id = await createSupply(business.id, payload);
                if (opts.imageFile) await setSupplyCoverImage(business.id, id, opts.imageFile);
              }
              setShowForm(false);
            }}
          />
          </CardBody>
        </Card>
      )}

      {!filtered.length ? (
        <EmptyState title="Sin insumos" description="Cargá el primer insumo para comenzar." />
      ) : (
        <SupplyTable
          items={filtered}
          onEdit={(item) => { setEditing(item); setShowForm(true); }}
          onDelete={(item) => setToDelete(item)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar insumo"
        description={`¿Seguro que querés eliminar ${toDelete?.name ?? ""}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteSupply(business.id, toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
};
