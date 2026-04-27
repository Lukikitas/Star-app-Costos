import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader } from "./ui/Card";

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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader title={title} description={description} />
        <CardBody className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>Confirmar</Button>
        </CardBody>
      </Card>
    </div>
  );
};
