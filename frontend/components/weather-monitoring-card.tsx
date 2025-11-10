import { Cloud, CloudRain, Wind } from "lucide-react"

export function WeatherMonitoringCard() {
  return (
    <div className="relative w-full max-w-2xl">
      {/* Corner accents - HUD style */}
      <div className="absolute -left-2 -top-2 h-8 w-8 border-l-2 border-t-2 border-primary" />
      <div className="absolute -right-2 -top-2 h-8 w-8 border-r-2 border-t-2 border-primary" />
      <div className="absolute -left-2 -bottom-2 h-8 w-8 border-l-2 border-b-2 border-primary" />
      <div className="absolute -right-2 -bottom-2 h-8 w-8 border-r-2 border-b-2 border-primary" />

      {/* Main card */}
      <div className="relative overflow-hidden border border-border bg-card backdrop-blur-sm">
        {/* Grid overlay for technical look */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(100,150,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(100,150,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Glowing top border */}
        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="relative p-8 md:p-12">
          {/* Status indicator */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-accent">System Active</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="font-mono text-xs text-muted-foreground">ID: WX-2025</span>
          </div>

          {/* Weather icon with glow effect */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <CloudRain className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-border bg-secondary/50">
                <Cloud className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded border border-border bg-secondary/50">
                <Wind className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Title with technical styling */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Weather Monitoring
              </h2>
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent" />
          </div>

          {/* Description */}
          <p className="max-w-xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
            {"Hourly checks for safe flying conditions with advanced weather data analysis"}
          </p>

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Update Rate</div>
              <div className="font-mono text-xl font-semibold text-primary">60min</div>
            </div>
            <div className="space-y-1 border-l border-border pl-4">
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Accuracy</div>
              <div className="font-mono text-xl font-semibold text-accent">98.5%</div>
            </div>
            <div className="space-y-1 border-l border-border pl-4">
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Coverage</div>
              <div className="font-mono text-xl font-semibold text-foreground">Global</div>
            </div>
          </div>

          {/* Scan line effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(100,150,255,0.02)_50%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite]" />
        </div>
      </div>
    </div>
  )
}
