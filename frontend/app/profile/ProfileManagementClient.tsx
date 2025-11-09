'use client'

import { useState } from 'react'
import { updateProfile, changePassword, updateEmail } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, User, Lock, Mail, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string
  role: 'student' | 'instructor' | 'admin'
  training_level?: string | null
  phone?: string | null
  preferences?: {
    notifications?: {
      email?: boolean
      in_app?: boolean
      sms?: boolean
    }
    weather_alerts?: boolean
    auto_reschedule?: boolean
  }
}

interface ProfileManagementClientProps {
  user: User
  userEmail: string
}

export function ProfileManagementClient({ user, userEmail }: ProfileManagementClientProps) {
  // Profile form state
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    training_level: user.training_level || '',
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    email_notifications: user.preferences?.notifications?.email ?? true,
    in_app_notifications: user.preferences?.notifications?.in_app ?? true,
    sms_notifications: user.preferences?.notifications?.sms ?? false,
    weather_alerts: user.preferences?.weather_alerts ?? true,
    auto_reschedule: user.preferences?.auto_reschedule ?? false,
  })

  // Password form state
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Email form state
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailData, setEmailData] = useState({
    new_email: '',
    password: '',
  })

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    const formData = new FormData()
    formData.append('full_name', profileData.full_name)
    formData.append('phone', profileData.phone)
    if (user.role === 'student' && profileData.training_level) {
      formData.append('training_level', profileData.training_level)
    }
    
    // Add preferences
    formData.append('preferences', JSON.stringify({
      notifications: {
        email: preferences.email_notifications,
        in_app: preferences.in_app_notifications,
        sms: preferences.sms_notifications,
      },
      weather_alerts: preferences.weather_alerts,
      auto_reschedule: preferences.auto_reschedule,
    }))

    const result = await updateProfile(formData)
    setProfileLoading(false)

    if (result.success) {
      toast.success('Profile updated successfully!')
    } else {
      toast.error(result.error || 'Failed to update profile')
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)

    const formData = new FormData()
    formData.append('current_password', passwordData.current_password)
    formData.append('new_password', passwordData.new_password)
    formData.append('confirm_password', passwordData.confirm_password)

    const result = await changePassword(formData)
    setPasswordLoading(false)

    if (result.success) {
      toast.success('Password changed successfully!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } else {
      toast.error(result.error || 'Failed to change password')
    }
  }

  // Handle email update
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)

    const formData = new FormData()
    formData.append('new_email', emailData.new_email)
    formData.append('password', emailData.password)

    const result = await updateEmail(formData)
    setEmailLoading(false)

    if (result.success) {
      toast.success(result.message || 'Email update initiated!')
      setEmailData({ new_email: '', password: '' })
    } else {
      toast.error(result.error || 'Failed to update email')
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {user.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="training_level">Training Level</Label>
                <Select
                  value={profileData.training_level}
                  onValueChange={(value) => setProfileData({ ...profileData, training_level: value })}
                >
                  <SelectTrigger id="training_level">
                    <SelectValue placeholder="Select your training level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student_pilot">Student Pilot</SelectItem>
                    <SelectItem value="private_pilot">Private Pilot</SelectItem>
                    <SelectItem value="instrument_rated">Instrument Rated</SelectItem>
                    <SelectItem value="commercial_pilot">Commercial Pilot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator className="my-6" />

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive updates about bookings via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, email_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>In-App Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Show notifications within the application
                    </p>
                  </div>
                  <Switch
                    checked={preferences.in_app_notifications}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, in_app_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive text messages for critical updates
                    </p>
                  </div>
                  <Switch
                    checked={preferences.sms_notifications}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, sms_notifications: checked })
                    }
                    disabled={!profileData.phone}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weather Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified about weather conflicts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.weather_alerts}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, weather_alerts: checked })
                    }
                  />
                </div>

                {user.role === 'student' && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Accept Reschedules</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically accept instructor-approved reschedule proposals
                      </p>
                    </div>
                    <Switch
                      checked={preferences.auto_reschedule}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, auto_reschedule: checked })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={profileLoading} className="w-full md:w-auto">
              {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Address</CardTitle>
          </div>
          <CardDescription>
            Update your email address (requires verification)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current email:</strong> {userEmail}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_email">New Email Address *</Label>
              <Input
                id="new_email"
                type="email"
                value={emailData.new_email}
                onChange={(e) => setEmailData({ ...emailData, new_email: e.target.value })}
                placeholder="newemail@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_password">Confirm Password *</Label>
              <Input
                id="email_password"
                type="password"
                value={emailData.password}
                onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                placeholder="Enter your current password"
                required
              />
            </div>

            <Button type="submit" disabled={emailLoading} variant="secondary" className="w-full md:w-auto">
              {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password *</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password *</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="Enter new password (min. 8 characters)"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password *</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" disabled={passwordLoading} variant="secondary" className="w-full md:w-auto">
              {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

