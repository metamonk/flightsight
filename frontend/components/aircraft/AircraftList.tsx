'use client'

import { useState } from 'react'
import { useAllAircraft, useDeactivateAircraft, useReactivateAircraft } from '@/lib/queries/aircraft'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreVertical, Edit, Power, PowerOff } from 'lucide-react'
import { AircraftFormDialog } from './AircraftFormDialog'
import { toast } from 'sonner'
import { formatHourlyRate, getAircraftStatusLabel, getAircraftStatusVariant } from '@/lib/schemas/aircraft'
import type { Database } from '@/types/supabase'

type Aircraft = Database['public']['Tables']['aircraft']['Row']

export function AircraftList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null)

  const { data: aircraft = [], isLoading } = useAllAircraft(showInactive)
  const deactivateAircraft = useDeactivateAircraft()
  const reactivateAircraft = useReactivateAircraft()

  // Filter aircraft based on search term
  const filteredAircraft = aircraft.filter((ac) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      ac.tail_number.toLowerCase().includes(searchLower) ||
      ac.make.toLowerCase().includes(searchLower) ||
      ac.model.toLowerCase().includes(searchLower) ||
      ac.category.toLowerCase().includes(searchLower)
    )
  })

  const handleAdd = () => {
    setEditingAircraft(null)
    setDialogOpen(true)
  }

  const handleEdit = (aircraft: Aircraft) => {
    setEditingAircraft(aircraft)
    setDialogOpen(true)
  }

  const handleDeactivate = async (aircraft: Aircraft) => {
    if (!confirm(`Are you sure you want to deactivate ${aircraft.tail_number}? It will no longer be available for booking.`)) {
      return
    }

    try {
      await deactivateAircraft.mutateAsync(aircraft.id)
      toast.success(`${aircraft.tail_number} deactivated`)
    } catch (error) {
      console.error('Error deactivating aircraft:', error)
      toast.error('Failed to deactivate aircraft')
    }
  }

  const handleReactivate = async (aircraft: Aircraft) => {
    try {
      await reactivateAircraft.mutateAsync(aircraft.id)
      toast.success(`${aircraft.tail_number} reactivated`)
    } catch (error) {
      console.error('Error reactivating aircraft:', error)
      toast.error('Failed to reactivate aircraft')
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingAircraft(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading aircraft...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aircraft Fleet</CardTitle>
              <CardDescription>
                Manage your fleet of training aircraft
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? 'Hide Inactive' : 'Show Inactive'}
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Aircraft
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tail number, make, model, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Aircraft Table */}
          {filteredAircraft.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'No aircraft match your search criteria.'
                  : 'No aircraft in the fleet yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleAdd} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Aircraft
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tail Number</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Hourly Rate</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAircraft.map((aircraft) => (
                    <TableRow key={aircraft.id}>
                      <TableCell>
                        <Badge variant={getAircraftStatusVariant(aircraft.is_active)}>
                          {getAircraftStatusLabel(aircraft.is_active)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {aircraft.tail_number}
                      </TableCell>
                      <TableCell>
                        {aircraft.make} {aircraft.model}
                      </TableCell>
                      <TableCell>{aircraft.year || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {aircraft.category}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatHourlyRate(aircraft.hourly_rate)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(aircraft)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {aircraft.is_active ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivate(aircraft)}
                                className="text-destructive"
                              >
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleReactivate(aircraft)}>
                                <Power className="h-4 w-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Results Count */}
          {filteredAircraft.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAircraft.length} of {aircraft.length} aircraft
            </div>
          )}
        </CardContent>
      </Card>

      <AircraftFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        editingAircraft={editingAircraft}
      />
    </>
  )
}

