'use client'

import { useState } from 'react'
import { useAllAirports, useAllLessonTypes } from '@/lib/queries/lookups'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Plane, GraduationCap } from 'lucide-react'
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider'

export default function AdminLookupsClient() {
  const [activeTab, setActiveTab] = useState<'airports' | 'lessons'>('airports')
  
  const { data: airports = [], isLoading: airportsLoading } = useAllAirports()
  const { data: lessonTypes = [], isLoading: lessonsLoading } = useAllLessonTypes()

  const activeAirportsCount = airports.filter(a => a.is_active).length
  const activeLessonsCount = lessonTypes.filter(l => l.is_active).length

  return (
    <RealtimeProvider channels={['lookups']}>
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Airport
                </Button>
              )}
              {activeTab === 'lessons' && (
                <Button>
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
                {airportsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading airports...
                  </div>
                ) : airports.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">No airports configured yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Airport
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Showing {airports.length} airports ({activeAirportsCount} active, {airports.length - activeAirportsCount} inactive)
                    </div>
                    {/* Airport list will go here */}
                    <div className="text-muted-foreground text-sm">
                      Airport management UI coming next...
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lessons" className="space-y-4">
                {lessonsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading lesson types...
                  </div>
                ) : lessonTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">No lesson types configured yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Lesson Type
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Showing {lessonTypes.length} lesson types ({activeLessonsCount} active, {lessonTypes.length - activeLessonsCount} inactive)
                    </div>
                    {/* Lesson types list will go here */}
                    <div className="text-muted-foreground text-sm">
                      Lesson type management UI coming next...
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
    </RealtimeProvider>
  )
}

