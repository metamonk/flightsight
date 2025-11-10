# Tabs Component

A flexible Tabs component for FlightSight with multiple style variants and optional HUD enhancements. Built on Radix UI for accessibility and fully TypeScript-compatible.

## Overview

The Tabs component provides accessible tab navigation with three style variants (default, underline, pills) and optional HUD styling. It handles keyboard navigation, ARIA attributes, and focus management automatically.

## Installation

```tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsWithVariant,
} from '@/components/kibo-ui/tabs'
```

## Basic Usage

### Simple Tabs

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <p>Account settings content</p>
  </TabsContent>
  <TabsContent value="password">
    <p>Password settings content</p>
  </TabsContent>
</Tabs>
```

### With Icons

```tsx
<Tabs defaultValue="home">
  <TabsList>
    <TabsTrigger value="home" icon={<Home />}>
      Home
    </TabsTrigger>
    <TabsTrigger value="profile" icon={<User />}>
      Profile
    </TabsTrigger>
    <TabsTrigger value="settings" icon={<Settings />}>
      Settings
    </TabsTrigger>
  </TabsList>
  <TabsContent value="home">Home content</TabsContent>
  <TabsContent value="profile">Profile content</TabsContent>
  <TabsContent value="settings">Settings content</TabsContent>
</Tabs>
```

### With Badges

```tsx
<Tabs defaultValue="inbox">
  <TabsList>
    <TabsTrigger value="inbox" badge={5}>
      Inbox
    </TabsTrigger>
    <TabsTrigger value="sent">
      Sent
    </TabsTrigger>
    <TabsTrigger value="drafts" badge={2}>
      Drafts
    </TabsTrigger>
  </TabsList>
  <TabsContent value="inbox">5 unread messages</TabsContent>
  <TabsContent value="sent">Sent messages</TabsContent>
  <TabsContent value="drafts">2 draft messages</TabsContent>
</Tabs>
```

## Style Variants

### Default (Segmented Control)

Clean segmented control style with background:

```tsx
<TabsWithVariant defaultValue="tab1" variant="default">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
  <TabsContent value="tab3">Content 3</TabsContent>
</TabsWithVariant>
```

### Underline

Navigation-style tabs with bottom border:

```tsx
<TabsWithVariant defaultValue="overview" variant="underline">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="analytics">Analytics content</TabsContent>
  <TabsContent value="reports">Reports content</TabsContent>
</TabsWithVariant>
```

### Pills

Separated pill-style tabs:

```tsx
<TabsWithVariant defaultValue="all" variant="pills">
  <TabsList>
    <TabsTrigger value="all" badge={12}>
      All
    </TabsTrigger>
    <TabsTrigger value="active" badge={5}>
      Active
    </TabsTrigger>
    <TabsTrigger value="completed" badge={7}>
      Completed
    </TabsTrigger>
  </TabsList>
  <TabsContent value="all">All items</TabsContent>
  <TabsContent value="active">Active items</TabsContent>
  <TabsContent value="completed">Completed items</TabsContent>
</TabsWithVariant>
```

## HUD Features

### HUD-Style Tabs

```tsx
<TabsWithVariant defaultValue="systems" variant="default" withHUD>
  <TabsList>
    <TabsTrigger value="systems" icon={<Activity />}>
      Systems
    </TabsTrigger>
    <TabsTrigger value="weather" icon={<Cloud />}>
      Weather
    </TabsTrigger>
    <TabsTrigger value="alerts" icon={<AlertTriangle />} badge={3}>
      Alerts
    </TabsTrigger>
  </TabsList>
  <TabsContent value="systems">
    System status information
  </TabsContent>
  <TabsContent value="weather">
    Weather monitoring data
  </TabsContent>
  <TabsContent value="alerts">
    3 active alerts
  </TabsContent>
</TabsWithVariant>
```

## Complete Examples

### Dashboard Navigation

```tsx
function DashboardTabs() {
  return (
    <TabsWithVariant defaultValue="overview" variant="underline">
      <TabsList className="w-full">
        <TabsTrigger value="overview" icon={<LayoutDashboard />}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="bookings" icon={<Calendar />} badge={5}>
          Bookings
        </TabsTrigger>
        <TabsTrigger value="students" icon={<Users />}>
          Students
        </TabsTrigger>
        <TabsTrigger value="aircraft" icon={<Plane />}>
          Aircraft
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Dashboard widgets */}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="bookings">
        <BookingsList />
      </TabsContent>
      <TabsContent value="students">
        <StudentsList />
      </TabsContent>
      <TabsContent value="aircraft">
        <AircraftList />
      </TabsContent>
    </TabsWithVariant>
  );
}
```

### Settings Panel

```tsx
function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <TabsWithVariant defaultValue="general" variant="default">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {/* General settings form */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Security settings form */}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Other tab contents */}
      </TabsWithVariant>
    </div>
  );
}
```

### HUD System Monitor

```tsx
function SystemMonitor() {
  return (
    <TabsWithVariant 
      defaultValue="status" 
      variant="default" 
      withHUD
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="status" icon={<Activity />}>
          Status
        </TabsTrigger>
        <TabsTrigger value="weather" icon={<CloudRain />}>
          Weather
        </TabsTrigger>
        <TabsTrigger value="alerts" icon={<AlertCircle />} badge={2}>
          Alerts
        </TabsTrigger>
        <TabsTrigger value="logs" icon={<FileText />}>
          Logs
        </TabsTrigger>
      </TabsList>
      <TabsContent value="status">
        <Card withCorners withGrid withGlow>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex justify-between">
                <span className="font-mono">Weather Monitoring</span>
                <BadgeDot variant="success" withPulse>
                  Active
                </BadgeDot>
              </div>
              <div className="flex justify-between">
                <span className="font-mono">Booking System</span>
                <BadgeDot variant="success" withPulse>
                  Active
                </BadgeDot>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="weather">
        <Card withGrid>
          <CardContent>
            <p>Weather monitoring data</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="alerts">
        <Card>
          <CardContent>
            <p>2 active system alerts</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="logs">
        <Card>
          <CardContent>
            <p>System logs</p>
          </CardContent>
        </Card>
      </TabsContent>
    </TabsWithVariant>
  );
}
```

### Controlled Tabs

```tsx
function ControlledTabs() {
  const [activeTab, setActiveTab] = React.useState("tab1");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setActiveTab("tab1")}>
          Go to Tab 1
        </Button>
        <Button onClick={() => setActiveTab("tab2")}>
          Go to Tab 2
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
        <TabsContent value="tab3">Tab 3 content</TabsContent>
      </Tabs>
    </div>
  );
}
```

## Accessibility

The Tabs component is fully accessible and WCAG 2.1 AA compliant:

### Keyboard Navigation

- `Tab` - Move focus to the tab list
- `ArrowLeft` / `ArrowRight` - Navigate between tabs
- `Home` - Focus first tab
- `End` - Focus last tab
- `Space` or `Enter` - Activate focused tab

### Screen Readers

The component automatically handles:
- `role="tablist"` on TabsList
- `role="tab"` on TabsTrigger
- `role="tabpanel"` on TabsContent
- `aria-selected` state
- `aria-controls` linking
- `aria-labelledby` association

### Best Practices

```tsx
// ✅ Good: Descriptive tab labels
<TabsTrigger value="account">
  Account Settings
</TabsTrigger>

// ✅ Good: Icons with text labels
<TabsTrigger value="home" icon={<Home />}>
  Home
</TabsTrigger>

// ❌ Bad: Icon only without label
<TabsTrigger value="home">
  <Home />
</TabsTrigger>

// ✅ Good: Icon only with aria-label
<TabsTrigger value="home" aria-label="Home">
  <Home />
</TabsTrigger>

// ✅ Good: Badge for notifications
<TabsTrigger value="inbox" badge={5}>
  Inbox
</TabsTrigger>
```

## Component Props

### Tabs

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | `string` | - | Default active tab (uncontrolled) |
| `value` | `string` | - | Active tab (controlled) |
| `onValueChange` | `(value: string) => void` | - | Callback when tab changes |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab orientation |
| `className` | `string` | - | Additional CSS classes |

### TabsList

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'underline' \| 'pills'` | `'default'` | Style variant (via TabsWithVariant) |
| `withHUD` | `boolean` | `false` | Enable HUD styling (via TabsWithVariant) |
| `className` | `string` | - | Additional CSS classes |

### TabsTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | Required | Unique tab identifier |
| `icon` | `ReactNode` | - | Icon element |
| `badge` | `string \| number` | - | Badge/count indicator |
| `disabled` | `boolean` | `false` | Disable the tab |
| `className` | `string` | - | Additional CSS classes |

### TabsContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | Required | Matching tab value |
| `className` | `string` | - | Additional CSS classes |

### TabsWithVariant

Wrapper component that provides variant context:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'underline' \| 'pills'` | `'default'` | Style variant |
| `withHUD` | `boolean` | `false` | Enable HUD styling |
| `...props` | `TabsProps` | - | All Tabs props |

## Styling

### Custom Styles

```tsx
<Tabs className="w-full">
  <TabsList className="w-full justify-start">
    <TabsTrigger value="tab1" className="flex-1">
      Tab 1
    </TabsTrigger>
  </TabsList>
</Tabs>
```

### Responsive Tabs

```tsx
<TabsList className="w-full sm:w-auto">
  <TabsTrigger value="tab1" className="flex-1 sm:flex-initial">
    Tab 1
  </TabsTrigger>
  <TabsTrigger value="tab2" className="flex-1 sm:flex-initial">
    Tab 2
  </TabsTrigger>
</TabsList>
```

## Best Practices

### Use Appropriate Variants

```tsx
// ✅ Good: Default for settings-style panels
<TabsWithVariant variant="default">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>
</TabsWithVariant>

// ✅ Good: Underline for navigation
<TabsWithVariant variant="underline">
  <TabsList className="w-full">
    <TabsTrigger value="home">Home</TabsTrigger>
    <TabsTrigger value="about">About</TabsTrigger>
  </TabsList>
</TabsWithVariant>

// ✅ Good: Pills for filters/categories
<TabsWithVariant variant="pills">
  <TabsList>
    <TabsTrigger value="all" badge={12}>All</TabsTrigger>
    <TabsTrigger value="active" badge={5}>Active</TabsTrigger>
  </TabsList>
</TabsWithVariant>
```

### Content Organization

```tsx
// ✅ Good: Meaningful content grouping
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  {/* Related content in each tab */}
</Tabs>

// ❌ Bad: Too many tabs (use navigation instead)
<Tabs>
  <TabsList>
    {/* 10+ tabs */}
  </TabsList>
</Tabs>
```

## Related Components

- `Card` - For content within tab panels
- `Badge` - For notification counts (integrated)
- `Button` - For additional actions in tabs
- `DropdownMenu` - For overflow tabs

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Performance

- Lazy content rendering (only active tab)
- CSS-only transitions
- Minimal re-renders
- Automatic state management
- Keyboard navigation optimization

## Migration from shadcn Tabs

100% compatible API - drop-in replacement:

```tsx
// Old (shadcn)
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// New (Kibo UI) - Same API!
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/kibo-ui/tabs'

// With optional new features
import { TabsWithVariant } from '@/components/kibo-ui/tabs'

<TabsWithVariant variant="underline" withHUD>
  <TabsList>
    <TabsTrigger value="tab1" icon={<Icon />} badge={5}>
      Tab 1
    </TabsTrigger>
  </TabsList>
</TabsWithVariant>
```

## License

Part of the FlightSight project.

