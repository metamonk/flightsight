/**
 * Schedule-X Theming Utilities
 * 
 * Helper functions for applying consistent FlightSight theming
 * to Schedule-X calendar instances.
 */

/**
 * Get the CSS class for an event based on booking status
 * Maps to our custom theme classes defined in theme.css
 */
export function getEventClassName(
  status: 'scheduled' | 'pending' | 'cancelled' | string,
  hasWeatherConflict: boolean = false
): string {
  if (hasWeatherConflict) return 'sx-event-weather-conflict'
  
  switch (status) {
    case 'scheduled':
      return 'sx-event-scheduled'
    case 'pending':
      return 'sx-event-pending'
    case 'cancelled':
      return 'sx-event-cancelled'
    default:
      return 'sx-event-pending' // default fallback
  }
}

/**
 * Get CSS class for background events (like weather conflicts)
 */
export function getBackgroundEventClassName(
  type: 'weather-conflict' | 'maintenance' | 'blocked' | string
): string {
  switch (type) {
    case 'weather-conflict':
      return 'sx-weather-conflict'
    case 'maintenance':
      return 'sx-maintenance'
    case 'blocked':
      return 'sx-blocked'
    default:
      return ''
  }
}

/**
 * Apply dark mode to Schedule-X calendar
 * Call this when theme changes
 */
export function applyDarkMode(isDark: boolean): void {
  if (typeof document === 'undefined') return
  
  const calendarWrappers = document.querySelectorAll('.sx-react-calendar-wrapper')
  calendarWrappers.forEach(wrapper => {
    if (isDark) {
      wrapper.classList.add('dark')
    } else {
      wrapper.classList.remove('dark')
    }
  })
}

/**
 * Custom event styling hook
 * Can be used for one-off event styling needs
 */
export function createCustomEventStyle(
  baseColor: string,
  textColor: string = 'white'
): React.CSSProperties {
  return {
    backgroundColor: baseColor,
    color: textColor,
    borderRadius: 'calc(var(--radius) - 4px)',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    boxShadow: 'var(--shadow-sm)',
  }
}

/**
 * Weather conflict styling for background events
 */
export const weatherConflictStyle: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    45deg,
    oklch(var(--destructive)) 0,
    oklch(var(--destructive)) 5px,
    transparent 5px,
    transparent 10px
  )`,
  opacity: 0.2,
  border: '1px dashed oklch(var(--destructive))',
  borderRadius: 'calc(var(--radius) - 4px)',
}

/**
 * Apply responsive styles based on viewport width
 */
export function getResponsiveCalendarHeight(): string {
  if (typeof window === 'undefined') return '800px'
  
  const width = window.innerWidth
  if (width < 640) return '600px'  // mobile
  if (width < 1024) return '700px' // tablet
  return '800px' // desktop
}

/**
 * Theme configuration object
 * Can be used to customize calendar appearance
 */
export const scheduleXTheme = {
  colors: {
    scheduled: {
      light: '#10b981',
      dark: '#6ee7b7',
    },
    pending: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    weatherConflict: {
      light: '#ef4444',
      dark: '#f87171',
    },
    cancelled: {
      light: '#6b7280',
      dark: '#9ca3af',
    },
  },
  spacing: {
    eventPadding: '0.25rem 0.5rem',
    gridCellPadding: '0.5rem',
    headerPadding: '1rem 1.5rem',
  },
  typography: {
    eventFontSize: '0.75rem',
    headerFontSize: '1.125rem',
    timeFontSize: '0.75rem',
    fontFamily: 'var(--font-sans)',
    monoFontFamily: 'var(--font-mono)',
  },
  borders: {
    radius: 'var(--radius)',
    width: '1px',
  },
  shadows: {
    event: 'var(--shadow-sm)',
    eventHover: 'var(--shadow-md)',
    popover: 'var(--shadow-lg)',
  },
} as const

export type ScheduleXTheme = typeof scheduleXTheme

