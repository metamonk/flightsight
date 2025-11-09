import { AircraftList } from '@/components/aircraft/AircraftList'

export default function AdminAircraftPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aircraft Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your training fleet, track usage, and configure aircraft settings.
        </p>
      </div>

      <AircraftList />

      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Fleet Management Tips</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Active aircraft are available for student bookings</li>
          <li>• Deactivate aircraft during maintenance periods</li>
          <li>• Weather minimums affect automatic weather conflict detection</li>
          <li>• Usage statistics help track fleet utilization</li>
        </ul>
      </div>
    </div>
  )
}

