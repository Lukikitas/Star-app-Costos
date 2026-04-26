export const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{message}</p>;
};
