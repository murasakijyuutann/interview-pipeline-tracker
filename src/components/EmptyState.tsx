interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "No interviews yet." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <span className="text-4xl mb-3">📭</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
