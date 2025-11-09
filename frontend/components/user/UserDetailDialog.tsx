'use client'

import { useState } from 'react'
import { 
  useUserById, 
  useUserStats, 
  usePromoteToInstructor,
  useDemoteToStudent,
  useDeactivateUser,
  useReactivateUser,
  type User, 
  type UserRole, 
  type TrainingLevel 
} from '@/lib/queries/users'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { UserEditDialog } from './UserEditDialog'
import { UserActivityInsights } from './UserActivityInsights'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  GraduationCap,
  Trophy,
  CheckCircle2,
  Clock3,
  Plane,
  Pencil,
  ArrowUp,
  ArrowDown,
  Ban,
  CheckCircle
} from 'lucide-react'

interface UserDetailDialogProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * UserDetailDialog Component
 * 
 * Displays comprehensive user information including:
 * - Basic profile information (name, email, role, etc.)
 * - Training level and status
 * - Booking history statistics
 * - Account activity (created date, last login)
 * - Contact information
 * - User preferences
 * 
 * Features:
 * - Loading states with skeletons
 * - Error handling
 * - Responsive layout
 * - Visual hierarchy with icons
 * - Statistics cards
 */
export function UserDetailDialog({ userId, open, onOpenChange }: UserDetailDialogProps) {
  const { data: user, isLoading: userLoading } = useUserById(userId || undefined)
  const { data: stats, isLoading: statsLoading } = useUserStats(userId || '')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [promoteConfirmOpen, setPromoteConfirmOpen] = useState(false)
  const [demoteConfirmOpen, setDemoteConfirmOpen] = useState(false)
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false)
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false)

  // Mutations
  const promoteToInstructor = usePromoteToInstructor()
  const demoteToStudent = useDemoteToStudent()
  const deactivateUser = useDeactivateUser()
  const reactivateUser = useReactivateUser()

  const handlePromote = async () => {
    if (!user) return
    
    try {
      await promoteToInstructor.mutateAsync(user.id)
      toast.success(`✅ ${user.full_name} promoted to Instructor!`)
      setPromoteConfirmOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to promote user')
      console.error('Promote error:', error)
    }
  }

  const handleDemote = async () => {
    if (!user) return
    
    try {
      await demoteToStudent.mutateAsync(user.id)
      toast.success(`✅ ${user.full_name} changed to Student role`)
      setDemoteConfirmOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to change user role')
      console.error('Demote error:', error)
    }
  }

  const handleDeactivate = async () => {
    if (!user) return
    
    try {
      await deactivateUser.mutateAsync(user.id)
      toast.success(`✅ ${user.full_name} has been deactivated`)
      setDeactivateConfirmOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate user')
      console.error('Deactivate error:', error)
    }
  }

  const handleReactivate = async () => {
    if (!user) return
    
    try {
      await reactivateUser.mutateAsync(user.id)
      toast.success(`✅ ${user.full_name} has been reactivated`)
      setReactivateConfirmOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reactivate user')
      console.error('Reactivate error:', error)
    }
  }

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format date with time
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Format training level for display
  const formatTrainingLevel = (level?: TrainingLevel | null) => {
    if (!level) return 'Not Specified'
    return level
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Get training level icon
  const getTrainingLevelIcon = (level?: TrainingLevel | null) => {
    switch (level) {
      case 'student_pilot':
        return '🎓'
      case 'private_pilot':
        return '✈️'
      case 'instrument_rated':
        return '🛫'
      case 'commercial_pilot':
        return '🏆'
      default:
        return '📚'
    }
  }

  const isLoading = userLoading || statsLoading
  const canPromote = user?.role === 'student'
  const canDemote = user?.role === 'instructor'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5" />
                  {isLoading ? 'Loading...' : user?.full_name}
                </DialogTitle>
                <DialogDescription>
                  Detailed user information and activity
                </DialogDescription>
              </div>
              {!isLoading && user && (
                <div className="flex items-center gap-2">
                  {/* Promote/Demote Buttons */}
                  {canPromote && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setPromoteConfirmOpen(true)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <ArrowUp className="h-4 w-4" />
                      Promote to Instructor
                    </Button>
                  )}
                  {canDemote && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDemoteConfirmOpen(true)}
                      className="gap-2"
                    >
                      <ArrowDown className="h-4 w-4" />
                      Change to Student
                    </Button>
                  )}
                  
                  {/* Deactivate/Reactivate Button */}
                  {user.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeactivateConfirmOpen(true)}
                      className="gap-2 text-destructive hover:bg-destructive/10"
                    >
                      <Ban className="h-4 w-4" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReactivateConfirmOpen(true)}
                      className="gap-2 text-green-600 hover:bg-green-600/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Reactivate
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-muted-foreground">User not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name and Role */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user.role} size="default" />
                    {!user.is_active && (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Training Level (for students/instructors) */}
                {(user.role === 'student' || user.role === 'instructor') && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Training Level</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <span>{getTrainingLevelIcon(user.training_level)}</span>
                          {formatTrainingLevel(user.training_level)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Account Dates */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Login</p>
                      <p className="text-sm font-medium">{formatDateTime(user.last_login_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Trophy className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{stats?.completedBookings || 0}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Clock3 className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{stats?.upcomingBookings || 0}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Plane className="h-8 w-8 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold">{stats?.totalHours || 0}</p>
                    <p className="text-xs text-muted-foreground">Flight Hours</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preferences Card */}
            {user.preferences && (
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-base">User Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.notifications?.email ? 'default' : 'secondary'}>
                        {user.preferences.notifications?.email ? '✓' : '✗'}
                      </Badge>
                      <span className="text-sm">Email Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.notifications?.in_app ? 'default' : 'secondary'}>
                        {user.preferences.notifications?.in_app ? '✓' : '✗'}
                      </Badge>
                      <span className="text-sm">In-App Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.notifications?.sms ? 'default' : 'secondary'}>
                        {user.preferences.notifications?.sms ? '✓' : '✗'}
                      </Badge>
                      <span className="text-sm">SMS Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.weather_alerts ? 'default' : 'secondary'}>
                        {user.preferences.weather_alerts ? '✓' : '✗'}
                      </Badge>
                      <span className="text-sm">Weather Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.preferences.auto_reschedule ? 'default' : 'secondary'}>
                        {user.preferences.auto_reschedule ? '✓' : '✗'}
                      </Badge>
                      <span className="text-sm">Auto Reschedule</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Insights */}
            <UserActivityInsights stats={stats} isLoading={statsLoading} />

            {/* Last Booking Info */}
            {user.lastBookingDate && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Last Booking:</strong> {formatDateTime(user.lastBookingDate)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Edit Dialog */}
    {user && (
      <UserEditDialog
        user={user}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          // Refresh will happen automatically via React Query cache invalidation
        }}
      />
    )}

    {/* Promote Confirmation Dialog */}
    <AlertDialog open={promoteConfirmOpen} onOpenChange={setPromoteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promote to Instructor?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to promote <strong>{user?.full_name}</strong> to Instructor?
            <br /><br />
            This will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Change their role from Student to Instructor</li>
              <li>Allow them to accept booking requests from students</li>
              <li>Grant access to the instructor dashboard</li>
              <li>Enable availability management features</li>
            </ul>
            <br />
            This action can be reversed later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePromote}
            disabled={promoteToInstructor.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {promoteToInstructor.isPending ? 'Promoting...' : 'Promote to Instructor'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Demote Confirmation Dialog */}
    <AlertDialog open={demoteConfirmOpen} onOpenChange={setDemoteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change to Student Role?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change <strong>{user?.full_name}</strong> from Instructor to Student?
            <br /><br />
            This will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Change their role from Instructor to Student</li>
              <li>Remove access to the instructor dashboard</li>
              <li>Prevent them from accepting new bookings as an instructor</li>
              <li>Remove availability management features</li>
            </ul>
            <br />
            <strong>Note:</strong> Existing bookings where they are the instructor will not be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDemote}
            disabled={demoteToStudent.isPending}
          >
            {demoteToStudent.isPending ? 'Changing Role...' : 'Change to Student'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Deactivate Confirmation Dialog */}
    <AlertDialog open={deactivateConfirmOpen} onOpenChange={setDeactivateConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate User Account?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate <strong>{user?.full_name}</strong>'s account?
            <br /><br />
            This will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Prevent them from logging into the system</li>
              <li>Block all access to their dashboard</li>
              <li>Hide them from active user lists</li>
              <li>Prevent new booking creation</li>
            </ul>
            <br />
            <strong>Important:</strong> Existing bookings will remain intact. They can be reactivated later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeactivate}
            disabled={deactivateUser.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deactivateUser.isPending ? 'Deactivating...' : 'Deactivate User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Reactivate Confirmation Dialog */}
    <AlertDialog open={reactivateConfirmOpen} onOpenChange={setReactivateConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivate User Account?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reactivate <strong>{user?.full_name}</strong>'s account?
            <br /><br />
            This will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Restore their login access</li>
              <li>Re-enable their dashboard</li>
              <li>Show them in active user lists</li>
              <li>Allow them to create new bookings</li>
            </ul>
            <br />
            They will be able to access the system immediately upon reactivation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReactivate}
            disabled={reactivateUser.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {reactivateUser.isPending ? 'Reactivating...' : 'Reactivate User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}


