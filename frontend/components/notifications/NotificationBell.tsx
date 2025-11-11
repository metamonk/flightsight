'use client'

import { Bell, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/lib/queries/notifications'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface NotificationBellProps {
  userId: string
}

// Client-only time display to prevent hydration mismatch
function TimeAgo({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState<string>('')
  
  useEffect(() => {
    // Only run on client
    setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }))
    
    // Optional: Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }))
    }, 60000)
    
    return () => clearInterval(interval)
  }, [date])
  
  // Return placeholder during SSR, real value after hydration
  return <span suppressHydrationWarning>{timeAgo || 'just now'}</span>
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const { data: notifications = [], isLoading } = useNotifications(userId)
  const { data: unreadCount = 0 } = useUnreadCount(userId)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId)
    }
  }

  const handleMarkAllRead = () => {
    markAllAsRead.mutate(userId)
  }

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    e.preventDefault()
    deleteNotification.mutate(notificationId)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'weather_conflict':
        return '⚠️'
      case 'reschedule_proposal':
        return '🤖'
      case 'booking_created':
        return '📅'
      case 'booking_updated':
        return '🔄'
      case 'booking_cancelled':
        return '❌'
      case 'reschedule_accepted':
        return '✅'
      default:
        return '📬'
    }
  }

  const getNotificationLink = (notification: any) => {
    const bookingId = notification.metadata?.booking_id
    if (bookingId) {
      return `/dashboard/booking/${bookingId}`
    }
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const isUnread = notification.status !== 'read'
                const link = getNotificationLink(notification)
                const NotificationContent = (
                  <div
                    className={cn(
                      "flex gap-3 p-3 rounded-sm transition-colors cursor-pointer hover:bg-accent",
                      isUnread && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification.id, !isUnread)}
                  >
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm leading-tight",
                          isUnread && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        {isUnread && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          <TimeAgo date={notification.created_at} />
                        </p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                          onClick={(e) => handleDelete(e, notification.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )

                return link ? (
                  <Link key={notification.id} href={link} className="block group">
                    {NotificationContent}
                  </Link>
                ) : (
                  <div key={notification.id} className="group">
                    {NotificationContent}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

