export function PriorityBadge({ priority }) {
  const priorityConfig = {
    High: 'bg-red-900 text-red-300',
    Medium: 'bg-orange-900 text-orange-300',
    Low: 'bg-gray-700 text-gray-300'
  };

  const colorClass = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <span className={`px-2 py-1 ${colorClass} text-xs rounded font-medium`}>
      {priority}
    </span>
  );
}
