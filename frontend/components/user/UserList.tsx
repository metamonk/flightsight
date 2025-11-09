'use client'

import { useState, useMemo } from 'react'
import { Search, UserPlus, Ban } from 'lucide-react'
import { useAllUsers, type User } from '@/lib/queries/users'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface UserListProps {
  roleFilter?: 'all' | 'student' | 'instructor' | 'admin'
  onUserSelect?: (user: User) => void
}

/**
 * UserList Component
 * 
 * Displays a table of all users with:
 * - Search by name or email
 * - Filter by role
 * - Role badges for visual identification
 * - Responsive table layout
 * - Loading states
 * - Empty states
 * - Click handlers for user selection
 */
export function UserList({ roleFilter = 'all', onUserSelect }: UserListProps) {
  const { data: users, isLoading } = useAllUsers()
  const [searchQuery, setSearchQuery] = useState('')
  const [localRoleFilter, setLocalRoleFilter] = useState<string>(roleFilter)

  // Filter and search users
  const filteredUsers = useMemo(() => {
    if (!users) return []

    let filtered = users

    // Apply role filter
    if (localRoleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === localRoleFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(u => 
        u.full_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [users, localRoleFilter, searchQuery])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format training level for display
  const formatTrainingLevel = (level?: string | null) => {
    if (!level) return 'N/A'
    return level
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Role Filter */}
        <Select value={localRoleFilter} onValueChange={setLocalRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="instructor">Instructors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        {/* Add User Button (placeholder) */}
        <Button variant="default" className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add User</span>
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users?.length || 0} users
      </div>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-muted-foreground">
                {searchQuery || localRoleFilter !== 'all' 
                  ? 'No users found matching your filters'
                  : 'No users in the system'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Training Level</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                        !user.is_active ? 'opacity-60' : ''
                      }`}
                      onClick={() => onUserSelect?.(user)}
                    >
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} size="sm" />
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTrainingLevel(user.training_level)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phone || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.last_login_at 
                          ? formatDate(user.last_login_at) 
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

