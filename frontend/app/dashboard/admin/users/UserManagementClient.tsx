'use client'

import { useState } from 'react'
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { UserList } from '@/components/user/UserList'
import { UserDetailDialog } from '@/components/user/UserDetailDialog'
import { AdminCreateDialog } from '@/components/user/AdminCreateDialog'
import { useAllUsers, useUsersByRole, type User } from '@/lib/queries/users'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ShieldPlus } from 'lucide-react'

interface UserManagementClientProps {
  userId: string
}

/**
 * User Management Client Component
 * 
 * Client-side portion of the user management interface with:
 * - Real-time subscription via RealtimeProvider
 * - Tab-based navigation for different views
 * - User list with search and filters
 * - User detail view
 * - User creation and editing
 */
export function UserManagementClient({ userId }: UserManagementClientProps) {
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
    <RealtimeProvider userId={userId}>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="all-users" className="flex items-center gap-2">
              👥 All Users
              <Badge variant="secondary" className="ml-1">
                {allUsers?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              🎓 Students
              <Badge variant="secondary" className="ml-1">
                {students?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="instructors" className="flex items-center gap-2">
              🧑‍✈️ Instructors
              <Badge variant="secondary" className="ml-1">
                {instructors?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              🎯 Admins
              <Badge variant="secondary" className="ml-1">
                {admins?.length || 0}
              </Badge>
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
        </Tabs>

        {/* System Status Footer */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-foreground mr-2"></span>
                  Real-time updates active
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">
                User data synchronized
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
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
    </RealtimeProvider>
  )
}

