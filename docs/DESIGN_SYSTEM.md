# Peaks & Pixels Design System

Premium Apple-inspired design system for consistent, beautiful UI across the application.

---

## Color Palette

### Semantic Colors
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `hsl(0, 0%, 100%)` | `hsl(220, 20%, 4%)` | Page background |
| `--foreground` | `hsl(220, 20%, 10%)` | `hsl(0, 0%, 98%)` | Primary text |
| `--card` | `hsl(0, 0%, 100%)` | `hsl(220, 15%, 8%)` | Card backgrounds |
| `--muted` | `hsl(220, 15%, 94%)` | `hsl(220, 15%, 12%)` | Subtle backgrounds |
| `--muted-foreground` | `hsl(220, 10%, 45%)` | `hsl(220, 10%, 55%)` | Secondary text |
| `--border` | `hsl(220, 15%, 90%)` | `hsla(220, 15%, 25%, 0.5)` | Borders |
| `--primary` | `hsl(210, 100%, 50%)` | `hsl(210, 100%, 55%)` | CTAs, links |
| `--accent` | `hsl(280, 100%, 55%)` | `hsl(280, 100%, 60%)` | Gradient secondary |
| `--destructive` | `hsl(0, 84%, 55%)` | `hsl(0, 84%, 60%)` | Error states |

### Status Colors
```css
/* Success */ bg-green-400/10 text-green-400 border-green-400/20
/* Warning */ bg-amber-400/10 text-amber-400 border-amber-400/20
/* Error */   bg-red-400/10 text-red-400 border-red-400/20
/* Info */    bg-primary/10 text-primary border-primary/20
```

---

## Typography

**Font**: Inter (loaded via `next/font`)

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| H1 | `text-4xl lg:text-5xl` | `font-semibold` | `tracking-tight` |
| H2 | `text-3xl lg:text-4xl` | `font-semibold` | `tracking-tight` |
| H3 | `text-2xl lg:text-3xl` | `font-semibold` | `tracking-tight` |
| Body | `text-base` | `font-normal` | default |
| Small | `text-sm` | `font-normal` | default |
| Caption | `text-xs` | `font-medium` | `tracking-wider` (labels) |

---

## Spacing & Radius

**Grid**: 8px base unit

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | `0.75rem` | Inputs, small cards |
| `rounded-xl` | `1rem` | Buttons, nav items |
| `rounded-2xl` | `1.25rem` | Cards, containers |
| `p-4` | `1rem` | Standard padding |
| `p-6` | `1.5rem` | Card internal padding |
| `gap-4` | `1rem` | Grid/flex gaps |
| `gap-6` | `1.5rem` | Section gaps |

---

## Effects & Utilities

### Glassmorphism
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
}
```
**Usage**: Sidebar, header, modals

### Gradients
```css
.gradient-primary  /* Blue → Purple gradient for CTAs */
.gradient-text     /* Gradient text (clip) */
.gradient-border   /* Gradient border effect */
```

### Glow Effects
```css
.glow        /* Subtle primary glow */
.glow-hover  /* Glow on hover */
.pulse-glow  /* Animated pulsing glow */
```

### Transitions
```css
.transition-apple   /* 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) */
.transition-spring  /* 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) */
```

### Animations
```css
.fade-in    /* Fade + slide up on mount */
.shimmer    /* Loading skeleton shimmer */
```

---

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| (default) | 0px | Mobile first |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

### Mobile-First Patterns
```tsx
// Grid stacking
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Hidden on mobile
<div className="hidden sm:block">

// Visible only on mobile
<div className="lg:hidden">

// Responsive padding
<div className="px-4 lg:px-8">

// Responsive text
<h1 className="text-2xl lg:text-4xl">
```

---

## Component Patterns

### Cards
```tsx
<div className="rounded-2xl border border-border/50 bg-card p-6">
  {/* Content */}
</div>
```

### Stat Cards (with hover)
```tsx
<div className="card-hover rounded-2xl border border-border/50 bg-card p-6">
  {/* Lifts on hover with shadow */}
</div>
```

### Buttons
```tsx
// Primary CTA
<Button className="gradient-primary text-white rounded-xl glow-hover">

// Ghost
<Button variant="ghost" className="rounded-xl hover:bg-secondary">
```

### Inputs
```tsx
<Input className="h-12 bg-secondary/50 border-border/50 rounded-xl 
  placeholder:text-muted-foreground focus:border-primary/50" />
```

### Badges (Status)
```tsx
<Badge className="bg-green-400/10 text-green-400 border border-green-400/20">
  confirmed
</Badge>
```

---

## Layout Structure

### Admin Layout
```
┌─────────────────────────────────────────────────┐
│ Sidebar (lg:w-72, glass, fixed)                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Logo + Brand                                │ │
│ │ Navigation (rounded-xl items)               │ │
│ │ Sign Out                                    │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Main Content (lg:pl-72)                         │
│ ┌─────────────────────────────────────────────┐ │
│ │ Header (sticky, glass, h-20)                │ │
│ │ [MobileNav] [Search] [Notifs] [ThemeToggle] │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Page Content (p-8, fade-in)                 │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Mobile Navigation
- `Sheet` component (slides from left)
- Same navigation items as desktop sidebar
- Closes on link click

---

## Dark/Light Mode

Implemented via `next-themes`:

```tsx
// Provider in layout.tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>

// Toggle component
<ThemeToggle /> // Sun/Moon dropdown
```

CSS variables auto-switch based on `.dark` class on `<html>`.

---

## Best Practices

1. **Always use semantic tokens** (`text-foreground`, not `text-white`)
2. **Mobile-first**: Start with base styles, add `md:` / `lg:` for larger screens
3. **Use `transition-apple`** for all interactive hover/focus states
4. **Truncate text** with `truncate` + `min-w-0` on flex children
5. **Touch targets**: Minimum `h-10 w-10` (40px) for tappable elements
6. **Glass effect**: Use sparingly (header, sidebar, modals)
7. **Gradient CTAs**: Reserve `gradient-primary` for primary actions only

---

## Admin CRUD Patterns

Based on v1 patterns, adapted for v2 premium design:

### List Pages
```tsx
// Grid layout with stats bar
<div className="space-y-8 fade-in">
  <div className="flex justify-between">
    <div><h1>Title</h1><p>Subtitle</p></div>
    <Button>Create New</Button>
  </div>
  <div className="grid grid-cols-4 gap-4">{/* Stats */}</div>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => <Card />)}
  </div>
</div>
```

### Form Pages
```tsx
// Two-column layout: main content + sidebar
<form className="grid lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2 space-y-6">
    {/* Form sections with cards */}
  </div>
  <div className="space-y-6">
    {/* Pricing, status, actions */}
  </div>
</form>
```

### API Routes
- `GET /api/admin/[resource]` - List all
- `POST /api/admin/[resource]` - Create new
- `GET /api/admin/[resource]/[id]` - Get single
- `PATCH /api/admin/[resource]/[id]` - Update
- `DELETE /api/admin/[resource]/[id]` - Delete

### Delete Confirmation
Use `AlertDialog` from Radix UI with destructive styling:
```tsx
<AlertDialogAction className="bg-destructive text-white">
  Delete
</AlertDialogAction>
```
