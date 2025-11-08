import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/10">
      {/* Navigation Bar */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">✈️</span>
              <span className="text-xl font-bold text-foreground">FlightSight</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-5xl mx-auto w-full space-y-16">
          {/* Hero Content */}
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5">
              ✈️ Aviation Management Platform
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
              FlightSight
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              AI-Powered Flight Lesson Weather Rescheduling
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Intelligent weather monitoring and automatic rescheduling for flight training. 
              Keep your students safe and schedules optimized with real-time weather alerts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link href="/dashboard/student">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-8">
            <Separator className="max-w-md mx-auto" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-2">🌦️</div>
                  <CardTitle className="text-xl">Weather Monitoring</CardTitle>
                  <CardDescription className="text-base">
                    Hourly checks for safe flying conditions with advanced weather data analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-2">🤖</div>
                  <CardTitle className="text-xl">AI Rescheduling</CardTitle>
                  <CardDescription className="text-base">
                    Smart proposals based on instructor and student availability patterns
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-2">🔔</div>
                  <CardTitle className="text-xl">Real-time Alerts</CardTitle>
                  <CardDescription className="text-base">
                    Instant notifications for weather conflicts and schedule changes
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="text-center pt-8">
            <Badge variant="outline" className="text-xs font-normal px-4 py-2">
              Powered by Next.js 16, Supabase, OpenAI & QStash
            </Badge>
          </div>
        </div>
      </main>
    </div>
  )
}
