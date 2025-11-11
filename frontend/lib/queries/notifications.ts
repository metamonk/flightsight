import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Fetch notifications for a user
 */
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, message, status, metadata, created_at, read_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch unread notification count
 */
export function useUnreadCount(userId: string) {
  return useQuery({
    queryKey: ['notifications-unread-count', userId],
    queryFn: async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: false })
        .eq('user_id', userId)
        .neq('status', 'read')
      
      if (error) throw error
      return data?.length || 0
    },
    staleTime: 15 * 1000, // 15 seconds
  })
}

/**
 * Mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', notificationId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', userId)
        .neq('status', 'read')
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

