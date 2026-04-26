interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({ open, title, description, onCancel, onConfirm }: ConfirmDialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h4 className="font-semibold text-lg mb-2">{title}</h4>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded bg-slate-100" onClick={onCancel}>Cancelar</button>
          <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};
