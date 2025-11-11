'use client'

import { Button } from '@/components/ui/button'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { BookLessonButton } from '@/components/booking/BookLessonButton'
import Link from 'next/link'
import { ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'

export interface DashboardNavProps {
  userId: string
  userEmail: string
  role: 'student' | 'instructor' | 'admin'
  currentPage?: 'dashboard' | 'calendar' | 'availability' | 'users' | 'lookups'
  onSignOut: () => void
}

export function DashboardNav({ userId, userEmail, role, currentPage = 'dashboard', onSignOut }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getDashboardLink = () => {
    switch (role) {
      case 'student':
        return '/dashboard/student'
      case 'instructor':
        return '/dashboard/instructor'
      case 'admin':
        return '/dashboard/admin'
    }
  }

  const getTitle = () => {
    if (currentPage !== 'dashboard') {
      return null // Don't show title on subpages
    }
    
    switch (role) {
      case 'student':
        return '✈️ Student Dashboard'
      case 'instructor':
        return '👨‍✈️ Instructor Dashboard'
      case 'admin':
        return '🛡️ Admin Dashboard'
    }
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'calendar':
        return '📅 Calendar View'
      case 'availability':
        return '⏰ Manage Availability'
      case 'users':
        return '👥 User Management'
      case 'lookups':
        return '📋 Lookups'
      default:
        return null
    }
  }

  const title = getTitle()
  const pageTitle = getPageTitle()
  const showBackButton = currentPage !== 'dashboard'

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-3 min-w-0">
            {showBackButton && (
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link href={getDashboardLink()}>
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to dashboard</span>
                </Link>
              </Button>
            )}
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-lg sm:text-xl font-bold text-card-foreground truncate">
                  {title || pageTitle}
                </h1>
                <RoleBadge role={role} size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Right: Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <NotificationBell userId={userId} />
            
            {/* Role-specific navigation */}
            {role === 'student' && (
              <BookLessonButton />
            )}
            
            {role === 'instructor' && (
              <>
                {currentPage !== 'availability' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/instructor/availability">
                      ⏰ Availability
                    </Link>
                  </Button>
                )}
                {currentPage !== 'calendar' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/instructor/calendar">
                      📅 Calendar
                    </Link>
                  </Button>
                )}
              </>
            )}
            
            {role === 'admin' && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/admin/users">
                    👥 Users
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/admin/aircraft">
                    ✈️ Aircraft
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/admin/lookups">
                    📋 Lookups
                  </Link>
                </Button>
              </>
            )}
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                ⚙️ Settings
              </Link>
            </Button>
            
            <form action={onSignOut}>
              <Button type="submit" variant="destructive" size="sm">
                Sign Out
              </Button>
            </form>
          </div>

          {/* Mobile: Notification + Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <NotificationBell userId={userId} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4 space-y-2">
            <div className="text-xs text-muted-foreground px-2 mb-2">
              {userEmail}
            </div>
            
            {/* Role-specific navigation */}
            {role === 'student' && (
              <div className="px-2 mb-2">
                <BookLessonButton className="w-full" />
              </div>
            )}
            
            {role === 'instructor' && (
              <>
                {currentPage !== 'availability' && (
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <Link href="/dashboard/instructor/availability">
                      ⏰ Manage Availability
                    </Link>
                  </Button>
                )}
                {currentPage !== 'calendar' && (
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <Link href="/dashboard/instructor/calendar">
                      📅 Calendar View
                    </Link>
                  </Button>
                )}
              </>
            )}
            
            {role === 'admin' && (
              <>
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link href="/dashboard/admin/users">
                    👥 User Management
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link href="/dashboard/admin/aircraft">
                    ✈️ Aircraft Management
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <Link href="/dashboard/admin/lookups">
                    📋 Lookups
                  </Link>
                </Button>
              </>
            )}
            
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <Link href="/profile">
                ⚙️ Settings
              </Link>
            </Button>
            
            <form action={onSignOut} className="w-full">
              <Button type="submit" variant="destructive" size="sm" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        )}
      </nav>
    </header>
  )
}

