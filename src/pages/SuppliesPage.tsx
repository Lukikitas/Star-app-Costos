import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { SupplyForm } from "../components/SupplyForm";
import { SupplyTable } from "../components/SupplyTable";
import { useAuthContext } from "../context/AuthContext";
import { createSupply, deleteSupply, listenSupplies, updateSupply } from "../services/supplyService";
import { Supply } from "../types";

export const SuppliesPage = () => {
  const { business } = useAuthContext();
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

  const categories = useMemo(() => ["all", ...new Set(supplies.map((s) => s.category))], [supplies]);
  const filtered = supplies.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) && (category === "all" || s.category === category));

  if (!business) return <EmptyState title="Sin negocio activo" description="No se pudo cargar los insumos." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input className="border rounded p-2" placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border rounded p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => { setEditing(null); setShowForm(true); }}>Nuevo insumo</button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-4">
          <SupplyForm
            initial={editing ?? undefined}
            onCancel={() => setShowForm(false)}
            onSubmit={async (payload) => {
              if (editing) await updateSupply(business.id, editing.id, payload);
              else await createSupply(business.id, payload);
              setShowForm(false);
            }}
          />
        </div>
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
