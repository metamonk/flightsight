import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: 'student' | 'instructor' | 'admin'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const roleConfig = {
  student: {
    label: 'Student',
    emoji: '🎓',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  },
  instructor: {
    label: 'Instructor',
    emoji: '👨‍✈️',
    variant: 'default' as const,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  },
  admin: {
    label: 'Admin',
    emoji: '⚙️',
    variant: 'destructive' as const,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800',
  },
}

/**
 * RoleBadge Component
 * 
 * Displays a styled badge indicating the user's role in the system.
 * Used consistently across all dashboards and navigation areas.
 * 
 * @param role - User role: 'student', 'instructor', or 'admin'
 * @param size - Badge size (default: 'default')
 * @param className - Additional CSS classes for customization
 */
export function RoleBadge({ role, size = 'default', className }: RoleBadgeProps) {
  const config = roleConfig[role]

  if (!config) {
    return null
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-medium border',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'lg' && 'text-base px-3 py-1',
        className
      )}
    >
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </Badge>
  )
}

