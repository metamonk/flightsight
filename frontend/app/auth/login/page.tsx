import Link from 'next/link'
import { login } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * Login Page
 * 
 * Provides email/password authentication using Supabase Auth.
 * Uses Next.js Server Actions for secure, server-side authentication.
 * Styled with shadcn/ui components and custom theme.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirectTo?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">✈️ FlightSight</h1>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">Sign In</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Please sign in to continue.
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
        {params.message && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-primary">{params.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
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
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </div>

              {/* Hidden redirect field */}
              {params.redirectTo && (
                <input type="hidden" name="redirectTo" value={params.redirectTo} />
              )}

              {/* Submit Button */}
              <Button
                formAction={login}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-sm text-muted-foreground">or</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign up
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

