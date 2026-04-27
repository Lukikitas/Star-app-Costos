export const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-2">
      {message}
    </p>
  );
};
