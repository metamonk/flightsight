'use client'

import { useState } from 'react'
import { useUser } from '@/lib/hooks/useUser'
import { 
  useInstructorAvailability,
  useDeleteAvailability 
} from '@/lib/queries/availability'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit } from 'lucide-react'
import { AvailabilityBlockDialog } from './AvailabilityBlockDialog'
import { toast } from 'sonner'
import { DAY_LABELS, formatTimeDisplay, formatDateDisplay } from '@/lib/schemas/availability'
import type { Database } from '@/lib/types/database.types'

type AvailabilityPattern = Database['public']['Tables']['availability']['Row']

export function AvailabilityManagement() {
  const { data: user } = useUser()
  const { data: patterns = [], isLoading } = useInstructorAvailability(user?.id)
  const deleteAvailability = useDeleteAvailability()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPattern, setEditingPattern] = useState<AvailabilityPattern | null>(null)

  // Guard: Don't render if user is not loaded
  if (!user?.id) {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            Loading user data...
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleAdd = () => {
    setEditingPattern(null)
    setDialogOpen(true)
  }

  const handleEdit = (pattern: AvailabilityPattern) => {
    setEditingPattern(pattern)
    setDialogOpen(true)
  }

  const handleDelete = async (pattern: AvailabilityPattern) => {
    if (!confirm('Are you sure you want to delete this availability pattern?')) {
      return
    }

    try {
      await deleteAvailability.mutateAsync({ 
        id: pattern.id, 
        userId: pattern.user_id 
      })
      toast.success('Availability pattern deleted')
    } catch (error: any) {
      console.error('Error deleting availability:', {
        error,
        message: error?.message,
        details: error?.details,
      })
      const errorMessage = error?.message || 'Failed to delete availability pattern'
      toast.error(errorMessage)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingPattern(null)
  }

  // Group patterns by day of week
  const patternsByDay: Record<number, AvailabilityPattern[]> = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.day_of_week]) {
      acc[pattern.day_of_week] = []
    }
    acc[pattern.day_of_week]!.push(pattern)
    return acc
  }, {} as Record<number, AvailabilityPattern[]>)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading availability...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Availability</CardTitle>
              <CardDescription>
                Manage your weekly availability schedule. Students can only book lessons during your available hours.
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't set up your availability yet.
              </p>
              <Button onClick={handleAdd} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Availability Pattern
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {DAY_LABELS.map((day) => {
                const dayPatterns = patternsByDay[day.value] || []
                
                if (dayPatterns.length === 0) return null

                return (
                  <div key={day.value} className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      {day.label}
                    </h3>
                    <div className="space-y-2">
                      {dayPatterns.map((pattern) => (
                        <div
                          key={pattern.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {formatTimeDisplay(pattern.start_time)} - {formatTimeDisplay(pattern.end_time)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pattern.is_recurring ? (
                                <>
                                  Recurring weekly
                                  {pattern.valid_from && ` from ${formatDateDisplay(pattern.valid_from)}`}
                                  {pattern.valid_until && ` until ${formatDateDisplay(pattern.valid_until)}`}
                                </>
                              ) : (
                                `One-time on ${formatDateDisplay(pattern.valid_from)}`
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(pattern)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(pattern)}
                              disabled={deleteAvailability.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AvailabilityBlockDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        editingPattern={editingPattern}
        userId={user.id}
      />
    </>
  )
}

