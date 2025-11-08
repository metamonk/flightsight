'use client'

import { useState } from 'react'
import { signup } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function RegisterForm() {
  const [role, setRole] = useState('student')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get started</CardTitle>
        <CardDescription>Create your account to access FlightSight</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <Select name="role" value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">
                  🎓 Student Pilot
                </SelectItem>
                <SelectItem value="instructor">
                  👨‍✈️ Flight Instructor
                </SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="role" value={role} />
            <p className="text-xs text-muted-foreground">
              Choose the role that describes you best
            </p>
          </div>

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
        </form>
      </CardContent>
    </Card>
  )
}

