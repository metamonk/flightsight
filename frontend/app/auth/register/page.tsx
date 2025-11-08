import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RegisterForm } from './RegisterForm'

/**
 * Registration Page
 * 
 * Allows new users to create an account with email, password, and role selection.
 * Uses Next.js Server Actions for secure, server-side user creation.
 * Styled with shadcn/ui components and custom theme.
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">✈️ FlightSight</h1>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">Create Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join FlightSight to manage your flight training schedule.
          </p>
        </div>

        {/* Error Message */}
        {params.error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{params.error}</p>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {params.success && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">✓ Account created successfully!</p>
                <p className="text-sm text-primary/80">{params.success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        <RegisterForm />

        {/* Divider & Login Link */}
        <div className="space-y-4">
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-sm text-muted-foreground">or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

