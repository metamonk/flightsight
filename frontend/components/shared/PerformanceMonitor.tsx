'use client'

import { useEffect } from 'react'
import { initPerformanceMonitoring } from '@/lib/utils/performance'

/**
 * Performance Monitor Client Component
 * 
 * Initializes Web Vitals tracking on the client side.
 * Should be included in the root layout.
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring()
  }, [])

  return null // This component doesn't render anything
}

