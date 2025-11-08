import Link from 'next/link'
import { signup } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * Registration Page
 * 
 * Allows new users to create an account with email and password.
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
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>Create your account to access FlightSight</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <Button
                formAction={signup}
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-sm text-muted-foreground">or</span>
                </div>
              </div>

              {/* Login Link */}
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
            </form>
          </CardContent>
        </Card>

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

