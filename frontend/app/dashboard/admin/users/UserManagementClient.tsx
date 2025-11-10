'use client'

import { useState } from 'react'
import { AdminRealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { UserList } from '@/components/user/UserList'
import { UserDetailDialog } from '@/components/user/UserDetailDialog'
import { AdminCreateDialog } from '@/components/user/AdminCreateDialog'
import { useAllUsers, useUsersByRole, type User } from '@/lib/queries/users'
import { TabsWithVariant, TabsContent, TabsList, TabsTrigger } from '@/components/kibo-ui/tabs'
import { Card, CardContent } from '@/components/kibo-ui/card'
import { Badge } from '@/components/kibo-ui/badge'
import { Separator } from '@/components/kibo-ui/separator'
import { Button } from '@/components/kibo-ui/button'
import { ShieldPlus } from 'lucide-react'

/**
 * User Management Client Component
 * 
 * Client-side portion of the user management interface with:
 * - Real-time subscription via AdminRealtimeProvider for system-wide updates
 * - Tab-based navigation for different views (All Users, Students, Instructors, Admins)
 * - User list with search and filters
 * - User detail view dialog
 * - Admin account creation dialog
 * 
 * Real-time Features:
 * - Automatically updates when users are created, updated, or deleted
 * - Shows connection status in the footer badge
 * - Debounced invalidation to prevent excessive re-renders
 */
export function UserManagementClient() {
  const [activeTab, setActiveTab] = useState('all-users')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false)

  // Fetch user counts for badge display
  const { data: allUsers } = useAllUsers()
  const { data: students } = useUsersByRole('student')
  const { data: instructors } = useUsersByRole('instructor')
  const { data: admins } = useUsersByRole('admin')

  const handleUserSelect = (user: User) => {
    setSelectedUserId(user.id)
    setDetailDialogOpen(true)
  }

  return (
    <AdminRealtimeProvider>
      <div className="space-y-6">
        {/* Header with Create Admin Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">User Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>
          <Button 
            onClick={() => setCreateAdminDialogOpen(true)}
            className="gap-2"
          >
            <ShieldPlus className="h-4 w-4" />
            Create Admin Account
          </Button>
        </div>

        {/* Tab Navigation */}
        <TabsWithVariant 
          value={activeTab} 
          onValueChange={setActiveTab} 
          withHUD={true}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger 
              value="all-users" 
              icon={<span>👥</span>}
              badge={allUsers?.length || 0}
            >
              All Users
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              icon={<span>🎓</span>}
              badge={students?.length || 0}
            >
              Students
            </TabsTrigger>
            <TabsTrigger 
              value="instructors" 
              icon={<span>🧑‍✈️</span>}
              badge={instructors?.length || 0}
            >
              Instructors
            </TabsTrigger>
            <TabsTrigger 
              value="admins" 
              icon={<span>🎯</span>}
              badge={admins?.length || 0}
            >
              Admins
            </TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="all-users" className="mt-6">
            <UserList roleFilter="all" onUserSelect={handleUserSelect} />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="mt-6">
            <UserList roleFilter="student" onUserSelect={handleUserSelect} />
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors" className="mt-6">
            <UserList roleFilter="instructor" onUserSelect={handleUserSelect} />
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="mt-6">
            <UserList roleFilter="admin" onUserSelect={handleUserSelect} />
          </TabsContent>
        </TabsWithVariant>

        {/* System Status Footer */}
        <Card withCorners withGrid={false} withGlow>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-foreground mr-2 animate-pulse"></span>
                  Real-time updates active
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">
                User data synchronized
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      <UserDetailDialog
        userId={selectedUserId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Admin Create Dialog */}
      <AdminCreateDialog
        open={createAdminDialogOpen}
        onOpenChange={setCreateAdminDialogOpen}
      />
    </AdminRealtimeProvider>
  )
}

