'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CloudRain, X } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Admin Weather Conflict Trigger
 * 
 * Hidden debug panel for manually creating weather conflicts.
 * Press Ctrl+Shift+W to toggle.
 */
export function AdminWeatherTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Toggle panel with Ctrl+Shift+W
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCreateConflict = async () => {
    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID')
      return
    }

    setIsLoading(true)

    try {
      // Call API endpoint that uses service role to bypass RLS
      const response = await fetch('/api/admin/create-weather-conflict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create weather conflict')
        setIsLoading(false)
        return
      }

      toast.success(`✅ Weather conflict created! Check both dashboards for real-time updates.`)
      setBookingId('')
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating conflict:', error)
      toast.error('Failed to create weather conflict')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/50 shadow-2xl">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-primary" />
              <CardTitle>Admin Weather Trigger</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Create a test weather conflict for any booking
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-id">Booking ID</Label>
            <Input
              id="booking-id"
              placeholder="Paste booking UUID here"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get the booking ID from the URL or database
            </p>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">This will create:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Weather conflict with severe conditions</li>
              <li>3 AI reschedule proposals</li>
              <li>Notifications for student and instructor</li>
              <li>Real-time updates on both dashboards</li>
            </ul>
          </div>

          <Button
            onClick={handleCreateConflict}
            disabled={isLoading || !bookingId.trim()}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Weather Conflict'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+W</kbd> to close
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

