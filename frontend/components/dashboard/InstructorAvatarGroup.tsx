/**
 * Instructor Avatar Group Component
 * 
 * Displays a stack of instructor avatars to show available instructors.
 * Uses Kibo AvatarStack for responsive stacked layout with hover animation.
 */

'use client'

import { useMemo } from 'react'
import { useUsersByRole, type User } from '@/lib/queries/users'
import { AvatarStack } from '@/components/kibo-ui/avatar-stack'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export interface InstructorAvatarGroupProps {
  /** Maximum number of instructors to display */
  maxDisplay?: number
  
  /** Avatar size in pixels */
  size?: number
  
  /** Enable hover animation */
  animate?: boolean
  
  /** Custom className */
  className?: string
  
  /** Show card wrapper */
  showCard?: boolean
  
  /** Only show active instructors */
  activeOnly?: boolean
}

/**
 * Get initials from full name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * InstructorAvatarGroup Component
 * 
 * Shows available instructors in a stacked avatar layout
 */
export function InstructorAvatarGroup({
  maxDisplay = 5,
  size = 40,
  animate = true,
  className,
  showCard = true,
  activeOnly = true
}: InstructorAvatarGroupProps) {
  
  // Fetch all instructors
  const { data: instructors, isLoading, error } = useUsersByRole('instructor')
  
  // Filter active instructors if needed
  const displayInstructors = useMemo(() => {
    if (!instructors) return []
    
    const filtered = activeOnly 
      ? instructors.filter(i => i.is_active)
      : instructors
    
    // Take only maxDisplay instructors
    return filtered.slice(0, maxDisplay)
  }, [instructors, activeOnly, maxDisplay])
  
  // Count remaining instructors
  const remainingCount = useMemo(() => {
    if (!instructors) return 0
    const filtered = activeOnly 
      ? instructors.filter(i => i.is_active)
      : instructors
    return Math.max(0, filtered.length - maxDisplay)
  }, [instructors, activeOnly, maxDisplay])
  
  // Loading state
  if (isLoading) {
    if (!showCard) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      )
    }
    
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Instructors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Error state
  if (error) {
    if (!showCard) {
      return (
        <p className="text-sm text-destructive">
          Error loading instructors
        </p>
      )
    }
    
    return (
      <Card className={`border-destructive/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Users className="h-4 w-4" />
            Error
          </CardTitle>
          <CardDescription>
            Failed to load instructors
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  // Empty state
  if (displayInstructors.length === 0) {
    if (!showCard) {
      return (
        <p className="text-sm text-muted-foreground">
          No instructors available
        </p>
      )
    }
    
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Instructors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No instructors available
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Avatar Stack Component
  const avatarStack = (
    <TooltipProvider>
      <AvatarStack animate={animate} size={size}>
        {displayInstructors.map((instructor) => (
          <Tooltip key={instructor.id}>
            <TooltipTrigger asChild>
              <Avatar className="border-2 border-background">
                {instructor.avatar_url && (
                  <AvatarImage 
                    src={instructor.avatar_url} 
                    alt={instructor.full_name}
                  />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {getInitials(instructor.full_name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-semibold">{instructor.full_name}</p>
                <p className="text-muted-foreground text-xs">{instructor.email}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {/* Show remaining count if there are more instructors */}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="border-2 border-background">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {remainingCount} more instructor{remainingCount !== 1 ? 's' : ''}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </AvatarStack>
    </TooltipProvider>
  )
  
  // With card wrapper
  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Available Instructors
          </CardTitle>
          <CardDescription className="text-xs">
            {instructors?.filter(i => activeOnly ? i.is_active : true).length || 0} instructor{(instructors?.filter(i => activeOnly ? i.is_active : true).length || 0) !== 1 ? 's' : ''} on staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          {avatarStack}
        </CardContent>
      </Card>
    )
  }
  
  // Without card wrapper
  return (
    <div className={className}>
      {avatarStack}
    </div>
  )
}

export default InstructorAvatarGroup

