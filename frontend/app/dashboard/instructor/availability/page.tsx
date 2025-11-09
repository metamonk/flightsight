import { AvailabilityManagement } from '@/components/availability/AvailabilityManagement'

export default function InstructorAvailabilityPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Availability</h1>
        <p className="text-muted-foreground mt-2">
          Set your weekly schedule to let students know when you're available for lessons.
        </p>
      </div>

      <AvailabilityManagement />

      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Students can only book lessons during your available hours</li>
          <li>• Set recurring patterns for your regular schedule</li>
          <li>• Add one-time blocks for special availability or time off</li>
          <li>• Existing bookings won't be affected by availability changes</li>
        </ul>
      </div>
    </div>
  )
}

