export function TaskCard({ task }) {
  const priorityColors = {
    High: 'bg-red-900 text-red-300',
    Medium: 'bg-orange-900 text-orange-300',
    Low: 'bg-gray-700 text-gray-300'
  };

  const statusColors = {
    Todo: 'border-gray-700',
    'In Progress': 'border-blue-700',
    Done: 'border-gray-700 opacity-75'
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border ${statusColors[task.status]} hover:border-gray-600 cursor-pointer transition-colors`}>
      <h3 className="text-white font-medium mb-2">{task.title}</h3>
      {task.description && (
        <p className="text-gray-400 text-sm mb-3">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 ${task.assignee.avatarColor} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
            {task.assignee.initials}
          </div>
          <span className="text-gray-400 text-sm">{task.assignee.name}</span>
        </div>
        <span className={`px-2 py-1 ${priorityColors[task.priority]} text-xs rounded`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}
