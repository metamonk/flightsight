'use client'

import { useState } from 'react'
import { useAllLessonTypes } from '@/lib/queries/lookups'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Plus, Edit, Ban, CheckCircle, GraduationCap } from 'lucide-react'
import { getCategoryLabel, getLessonTypeCategoryColor } from '@/lib/schemas/lookups'
import type { Database } from '@/lib/types/database.types'

type LessonType = Database['public']['Tables']['lesson_types']['Row']

interface LessonTypeListProps {
  onAdd: () => void
  onEdit: (lessonType: LessonType) => void
  onDeactivate: (lessonType: LessonType) => void
  onReactivate: (lessonType: LessonType) => void
}

export function LessonTypeList({ onAdd, onEdit, onDeactivate, onReactivate }: LessonTypeListProps) {
  const { data: lessonTypes = [], isLoading, error, refetch } = useAllLessonTypes()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Filter lesson types
  const filteredLessonTypes = lessonTypes.filter((lt) => {
    const matchesSearch =
      searchQuery === '' ||
      lt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lt.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && lt.is_active) ||
      (statusFilter === 'inactive' && !lt.is_active)

    const matchesCategory = categoryFilter === null || lt.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const activeCount = lessonTypes.filter((lt) => lt.is_active).length
  const inactiveCount = lessonTypes.length - activeCount

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Error state with retry
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Failed to Load Lesson Types
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error 
                ? error.message 
                : 'There was an error loading the lesson types. Please try again.'}
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="gap-2"
            >
              <span>🔄</span>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (lessonTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">No lesson types configured yet</p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Lesson Type
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({lessonTypes.length})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({inactiveCount})
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Category:</span>
        <Button
          variant={categoryFilter === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter(null)}
        >
          All
        </Button>
        <Button
          variant={categoryFilter === 'primary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter('primary')}
        >
          Primary
        </Button>
        <Button
          variant={categoryFilter === 'advanced' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter('advanced')}
        >
          Advanced
        </Button>
        <Button
          variant={categoryFilter === 'specialized' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter('specialized')}
        >
          Specialized
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredLessonTypes.length} of {lessonTypes.length} lesson types
      </div>

      {/* Lesson Types Table */}
      {filteredLessonTypes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No lesson types match your search criteria
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessonTypes.map((lessonType) => (
                <TableRow
                  key={lessonType.id}
                  className={!lessonType.is_active ? 'opacity-60' : ''}
                >
                  <TableCell className="font-medium">{lessonType.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getLessonTypeCategoryColor(lessonType.category)}
                    >
                      {getCategoryLabel(lessonType.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">
                    {lessonType.description || '—'}
                  </TableCell>
                  <TableCell>
                    {lessonType.is_active ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-600 border-green-500/20"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(lessonType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {lessonType.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeactivate(lessonType)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReactivate(lessonType)}
                          className="text-green-600 hover:text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

