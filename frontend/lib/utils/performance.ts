/**
 * Performance Monitoring Utilities
 * 
 * Provides utilities for tracking and reporting Core Web Vitals
 * and component performance metrics in the FlightSight application.
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Core Web Vitals thresholds (in milliseconds or score)
 * Based on Google's recommended values
 */
export const VITALS_THRESHOLDS = {
  // Largest Contentful Paint
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  // First Input Delay (deprecated, use INP)
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  // Cumulative Layout Shift (score)
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  // First Contentful Paint
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  // Interaction to Next Paint
  INP: {
    good: 200,
    needsImprovement: 500,
  },
  // Time to First Byte
  TTFB: {
    good: 800,
    needsImprovement: 1800,
  },
} as const

/**
 * Rating for a metric based on thresholds
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor'

/**
 * Get rating for a metric value
 */
export function getMetricRating(
  metricName: keyof typeof VITALS_THRESHOLDS,
  value: number
): MetricRating {
  const thresholds = VITALS_THRESHOLDS[metricName]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

/**
 * Format metric value for display
 */
export function formatMetricValue(metricName: string, value: number): string {
  if (metricName === 'CLS') {
    return value.toFixed(3)
  }
  return `${Math.round(value)}ms`
}

/**
 * Send metric to analytics endpoint
 * In production, this would send to your analytics service
 */
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  })

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body)
  } else {
    fetch('/api/analytics', { body, method: 'POST', keepalive: true }).catch(
      console.error
    )
  }
}

/**
 * Log metric to console in development
 */
function logMetricToConsole(metric: Metric) {
  const rating = getMetricRating(
    metric.name as keyof typeof VITALS_THRESHOLDS,
    metric.value
  )
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
  
  console.log(
    `${emoji} ${metric.name}:`,
    formatMetricValue(metric.name, metric.value),
    `(${rating})`
  )
}

/**
 * Initialize Web Vitals tracking
 * Call this in your app's entry point (e.g., layout.tsx or _app.tsx)
 */
export function initPerformanceMonitoring() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const reportMetric = (metric: Metric) => {
    if (isDevelopment) {
      logMetricToConsole(metric)
    } else {
      sendToAnalytics(metric)
    }
  }

  // Track all Core Web Vitals
  onCLS(reportMetric)
  onFCP(reportMetric)
  onINP(reportMetric)
  onLCP(reportMetric)
  onTTFB(reportMetric)
}

/**
 * Performance mark utility for custom measurements
 */
export class PerformanceMark {
  private startMark: string
  private endMark: string
  private measureName: string

  constructor(name: string) {
    this.measureName = name
    this.startMark = `${name}-start`
    this.endMark = `${name}-end`
  }

  start() {
    if (typeof performance !== 'undefined') {
      performance.mark(this.startMark)
    }
  }

  end() {
    if (typeof performance !== 'undefined') {
      performance.mark(this.endMark)
      try {
        const measure = performance.measure(
          this.measureName,
          this.startMark,
          this.endMark
        )
        console.log(`⏱️ ${this.measureName}: ${Math.round(measure.duration)}ms`)
        return measure.duration
      } catch (error) {
        console.error(`Failed to measure ${this.measureName}:`, error)
        return 0
      }
    }
    return 0
  }

  clear() {
    if (typeof performance !== 'undefined') {
      try {
        performance.clearMarks(this.startMark)
        performance.clearMarks(this.endMark)
        performance.clearMeasures(this.measureName)
      } catch (error) {
        // Silently fail - marks may not exist
      }
    }
  }
}

/**
 * Measure component render time
 * Usage: const duration = await measureComponentRender('MyComponent', () => <MyComponent />)
 */
export async function measureComponentRender<T>(
  componentName: string,
  renderFn: () => T
): Promise<{ result: T; duration: number }> {
  const mark = new PerformanceMark(`component-render-${componentName}`)
  
  mark.start()
  const result = await Promise.resolve(renderFn())
  const duration = mark.end()
  mark.clear()

  return { result, duration }
}

/**
 * React hook for measuring component mount/unmount time
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return

  const mark = new PerformanceMark(`component-lifecycle-${componentName}`)

  // Start mark when component mounts
  mark.start()

  // Return cleanup function for unmount
  return () => {
    mark.end()
    mark.clear()
  }
}

/**
 * Measure data fetching performance
 */
export async function measureDataFetch<T>(
  fetchName: string,
  fetchFn: () => Promise<T>
): Promise<{ data: T; duration: number }> {
  const mark = new PerformanceMark(`data-fetch-${fetchName}`)
  
  mark.start()
  const data = await fetchFn()
  const duration = mark.end()
  mark.clear()

  return { data, duration }
}

/**
 * Get current performance metrics summary
 */
export function getPerformanceMetrics() {
  if (typeof performance === 'undefined') {
    return null
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  if (!navigation) {
    return null
  }

  return {
    // DNS lookup time
    dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
    // TCP connection time
    tcp: Math.round(navigation.connectEnd - navigation.connectStart),
    // Request time
    request: Math.round(navigation.responseStart - navigation.requestStart),
    // Response time
    response: Math.round(navigation.responseEnd - navigation.responseStart),
    // DOM processing time
    domProcessing: Math.round(navigation.domComplete - navigation.domInteractive),
    // Total load time
    loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    // Time to interactive
    timeToInteractive: Math.round(navigation.domInteractive - navigation.fetchStart),
  }
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary() {
  const metrics = getPerformanceMetrics()
  
  if (!metrics) {
    console.log('Performance metrics not available')
    return
  }

  console.group('📊 Performance Summary')
  console.table(metrics)
  console.groupEnd()
}

