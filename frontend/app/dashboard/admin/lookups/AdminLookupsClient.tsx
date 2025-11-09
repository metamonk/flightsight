'use client'

import { useState } from 'react'
import { useAllAirports, useAllLessonTypes, useDeactivateAirport, useReactivateAirport, useDeactivateLessonType, useReactivateLessonType } from '@/lib/queries/lookups'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Plane, GraduationCap } from 'lucide-react'
import { AdminRealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { AirportList } from '@/components/lookups/AirportList'
import { AirportFormDialog } from '@/components/lookups/AirportFormDialog'
import { LessonTypeList } from '@/components/lookups/LessonTypeList'
import { LessonTypeFormDialog } from '@/components/lookups/LessonTypeFormDialog'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database.types'

type Airport = Database['public']['Tables']['airports']['Row']
type LessonType = Database['public']['Tables']['lesson_types']['Row']

export default function AdminLookupsClient() {
  const [activeTab, setActiveTab] = useState<'airports' | 'lessons'>('airports')
  
  const { data: airports = [] } = useAllAirports()
  const { data: lessonTypes = [] } = useAllLessonTypes()
  const deactivateAirport = useDeactivateAirport()
  const reactivateAirport = useReactivateAirport()
  const deactivateLessonType = useDeactivateLessonType()
  const reactivateLessonType = useReactivateLessonType()

  // Airport dialog state
  const [airportDialogOpen, setAirportDialogOpen] = useState(false)
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null)

  // Lesson type dialog state
  const [lessonTypeDialogOpen, setLessonTypeDialogOpen] = useState(false)
  const [editingLessonType, setEditingLessonType] = useState<LessonType | null>(null)

  // Airport handlers
  const handleAddAirport = () => {
    setEditingAirport(null)
    setAirportDialogOpen(true)
  }

  const handleEditAirport = (airport: Airport) => {
    setEditingAirport(airport)
    setAirportDialogOpen(true)
  }

  const handleDeactivateAirport = async (airport: Airport) => {
    try {
      await deactivateAirport.mutateAsync(airport.id)
      toast.success(`✅ ${airport.code} has been deactivated`)
    } catch (error: any) {
      console.error('Error deactivating airport:', error)
      toast.error(error.message || 'Failed to deactivate airport')
    }
  }

  const handleReactivateAirport = async (airport: Airport) => {
    try {
      await reactivateAirport.mutateAsync(airport.id)
      toast.success(`✅ ${airport.code} has been reactivated`)
    } catch (error: any) {
      console.error('Error reactivating airport:', error)
      toast.error(error.message || 'Failed to reactivate airport')
    }
  }

  // Lesson type handlers
  const handleAddLessonType = () => {
    setEditingLessonType(null)
    setLessonTypeDialogOpen(true)
  }

  const handleEditLessonType = (lessonType: LessonType) => {
    setEditingLessonType(lessonType)
    setLessonTypeDialogOpen(true)
  }

  const handleDeactivateLessonType = async (lessonType: LessonType) => {
    try {
      await deactivateLessonType.mutateAsync(lessonType.id)
      toast.success(`✅ "${lessonType.name}" has been deactivated`)
    } catch (error: any) {
      console.error('Error deactivating lesson type:', error)
      toast.error(error.message || 'Failed to deactivate lesson type')
    }
  }

  const handleReactivateLessonType = async (lessonType: LessonType) => {
    try {
      await reactivateLessonType.mutateAsync(lessonType.id)
      toast.success(`✅ "${lessonType.name}" has been reactivated`)
    } catch (error: any) {
      console.error('Error reactivating lesson type:', error)
      toast.error(error.message || 'Failed to reactivate lesson type')
    }
  }

  const activeAirportsCount = airports.filter(a => a.is_active).length
  const activeLessonsCount = lessonTypes.filter(l => l.is_active).length

  return (
    <AdminRealtimeProvider>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Lookups</h1>
          <p className="text-muted-foreground mt-2">
            Manage airports and lesson types available for booking
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Configure airports and lesson types used throughout the system
                </CardDescription>
              </div>
              {activeTab === 'airports' && (
                <Button onClick={handleAddAirport}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Airport
                </Button>
              )}
              {activeTab === 'lessons' && (
                <Button onClick={handleAddLessonType}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson Type
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="airports" className="gap-2">
                  <Plane className="h-4 w-4" />
                  Airports
                  <Badge variant="secondary" className="ml-1">
                    {activeAirportsCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="lessons" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Lesson Types
                  <Badge variant="secondary" className="ml-1">
                    {activeLessonsCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="airports" className="space-y-4">
                <AirportList
                  onAdd={handleAddAirport}
                  onEdit={handleEditAirport}
                  onDeactivate={handleDeactivateAirport}
                  onReactivate={handleReactivateAirport}
                />
              </TabsContent>

              <TabsContent value="lessons" className="space-y-4">
                <LessonTypeList
                  onAdd={handleAddLessonType}
                  onEdit={handleEditLessonType}
                  onDeactivate={handleDeactivateLessonType}
                  onReactivate={handleReactivateLessonType}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Airport Form Dialog */}
        <AirportFormDialog
          airport={editingAirport}
          open={airportDialogOpen}
          onOpenChange={setAirportDialogOpen}
          onSuccess={() => {
            setAirportDialogOpen(false)
            setEditingAirport(null)
          }}
        />

        {/* Lesson Type Form Dialog */}
        <LessonTypeFormDialog
          lessonType={editingLessonType}
          open={lessonTypeDialogOpen}
          onOpenChange={setLessonTypeDialogOpen}
          onSuccess={() => {
            setLessonTypeDialogOpen(false)
            setEditingLessonType(null)
          }}
        />

        {/* System Status Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time sync active</span>
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </AdminRealtimeProvider>
  )
}

