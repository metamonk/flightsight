import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { ProfileManagementClient } from './ProfileManagementClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

/**
 * Profile Settings Page
 * 
 * Allows users to manage their profile information, preferences, and security settings.
 * Accessible from all dashboard types (student, instructor, admin).
 */
export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile from database
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userProfile) {
    redirect('/auth/login')
  }

  // Determine back link based on role
  const role = (userProfile as any).role || 'student'
  const backLink = `/dashboard/${role === 'admin' ? 'admin' : role === 'instructor' ? 'instructor' : 'student'}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={backLink}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <form>
            <Button
              formAction={logout}
              variant="outline"
              size="default"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6 border-0 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                {(userProfile as any).role === 'admin' ? '👑' : (userProfile as any).role === 'instructor' ? '👨‍✈️' : '🎓'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{(userProfile as any).full_name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {(userProfile as any).role} Account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileManagementClient 
          user={userProfile as any} 
          userEmail={user.email || ''} 
        />
      </main>
    </div>
  )
}

