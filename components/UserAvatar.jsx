export function UserAvatar({ user, size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`${sizeClass} ${user.avatarColor || 'bg-blue-600'} rounded-full flex items-center justify-center text-white font-semibold`}>
      {user.initials || user.name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}
