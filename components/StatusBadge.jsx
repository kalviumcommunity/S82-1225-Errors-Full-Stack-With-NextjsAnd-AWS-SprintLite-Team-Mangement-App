export function StatusBadge({ status }) {
  const statusConfig = {
    Todo: {
      color: 'text-gray-400',
      dot: 'bg-gray-500'
    },
    'In Progress': {
      color: 'text-blue-400',
      dot: 'bg-blue-500'
    },
    Done: {
      color: 'text-green-400',
      dot: 'bg-green-500'
    }
  };

  const config = statusConfig[status] || statusConfig.Todo;

  return (
    <span className={`inline-flex items-center gap-1 ${config.color}`}>
      <span className={`w-2 h-2 ${config.dot} rounded-full`}></span>
      {status}
    </span>
  );
}
