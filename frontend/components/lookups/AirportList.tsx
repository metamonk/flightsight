'use client'

import { useState } from 'react'
import { useAllAirports } from '@/lib/queries/lookups'
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
import { Search, Plus, Edit, Ban, CheckCircle, Plane } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type Airport = Database['public']['Tables']['airports']['Row']

interface AirportListProps {
  onAdd: () => void
  onEdit: (airport: Airport) => void
  onDeactivate: (airport: Airport) => void
  onReactivate: (airport: Airport) => void
}

export function AirportList({ onAdd, onEdit, onDeactivate, onReactivate }: AirportListProps) {
  const { data: airports = [], isLoading } = useAllAirports()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Filter airports based on search and status
  const filteredAirports = airports.filter((airport) => {
    const matchesSearch =
      searchQuery === '' ||
      airport.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airport.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airport.state?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && airport.is_active) ||
      (statusFilter === 'inactive' && !airport.is_active)

    return matchesSearch && matchesStatus
  })

  const activeCount = airports.filter((a) => a.is_active).length
  const inactiveCount = airports.length - activeCount

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading airports...
      </div>
    )
  }

  if (airports.length === 0) {
    return (
      <div className="text-center py-12">
        <Plane className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">No airports configured yet</p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Airport
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({airports.length})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({inactiveCount})
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAirports.length} of {airports.length} airports
      </div>

      {/* Airport Table */}
      {filteredAirports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No airports match your search criteria
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAirports.map((airport) => (
                <TableRow
                  key={airport.id}
                  className={!airport.is_active ? 'opacity-60' : ''}
                >
                  <TableCell className="font-mono font-semibold">
                    {airport.code}
                  </TableCell>
                  <TableCell>{airport.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[airport.city, airport.state, airport.country]
                      .filter(Boolean)
                      .join(', ')}
                  </TableCell>
                  <TableCell>
                    {airport.is_active ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-600 border-green-500/20"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(airport)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {airport.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeactivate(airport)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReactivate(airport)}
                          className="text-green-600 hover:text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

