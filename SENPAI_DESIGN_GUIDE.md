/**
 * SENPAI.TV DESIGN SYSTEM GUIDE
 * Complete architecture for cinematic anime streaming UX
 *
 * This document outlines the complete design system, components, patterns,
 * and implementation guidelines for SENPAI.TV
 */

# SENPAI.TV - Complete Design System Guide

## Table of Contents
1. Design Philosophy
2. Color System
3. Typography System
4. Component Architecture
5. Animation & Motion
6. Layout Patterns
7. Page Implementation Examples
8. Responsive Design
9. Accessibility Guidelines
10. Performance Optimization

---

## 1. DESIGN PHILOSOPHY

### Vision
"Cinematic anime meets futuristic luxury operating system."

The experience should feel like a fusion of:
- Netflix premium streaming
- Crunchyroll anime expertise  
- Apple TV+ polish
- Cyberpunk 2077 menus
- Japanese editorial design
- AAA gaming interfaces
- Premium luxury brands

### Core Principles
- **Emotional Impact**: Every interaction should feel intentional and premium
- **Cinematic Quality**: 60fps animations, smooth transitions, immersive depth
- **Editorial Excellence**: Magazine-style layouts with hierarchy and breathing room
- **Responsive Artistry**: Adapts beautifully from mobile to 10ft TV screens
- **Performance First**: Premium visuals never compromise loading or interaction speed
- **Accessibility**: WCAG AA compliance with full keyboard and screen reader support

---

## 2. COLOR SYSTEM

### Primary Palette (CSS Variables)
```css
--senpai-bg: #07060a;           /* Deepest black */
--senpai-bg-2: #0d0a14;         /* Dark purple-black */
--senpai-bg-3: #15101e;         /* Slightly lighter dark */
--senpai-paper: #f4ede2;        /* Light cream for contrast */
--senpai-surface: rgba(20, 15, 32, 0.55);  /* Glassmorphic surface */
--senpai-text: #f6f1ff;         /* Pure white-lavender */
--senpai-text-dim: #b9b1d4;     /* Muted text */
```

### Accent Colors
```css
--senpai-violet: #a16bff;       /* Primary action */
--senpai-violet-2: #7a3df5;     /* Hover state */
--senpai-teal: #2af0d9;         /* Secondary action */
--senpai-fuchsia: #ff48d6;      /* Highlights */
--senpai-pink: #ff5d9f;         /* Complementary */
--senpai-amber: #ffc857;        /* Tertiary action */
--senpai-orange: #ff7a2e;       /* Alerts/warnings */
--senpai-red: #ff3b5b;          /* Errors */
```

### Usage Rules
- **Primary Action**: Use `senpai-violet` for main CTAs and interactive elements
- **Secondary Action**: Use `senpai-teal` for discovery and secondary CTAs
- **Highlights**: Use `senpai-pink` or `senpai-fuchsia` for featured content
- **States**: `senpai-violet-2` for hover/active states
- **Disabled**: Use `senpai-text-dim` at 50% opacity
- **Backgrounds**: Always use dark palette (`senpai-bg*`) to protect eyes

### Gradients (Tailwind Classes)
- `gradient-violet-teal`: Primary to secondary
- `gradient-violet-pink`: Primary to accent
- `gradient-teal-cyan`: Cool gradient for special sections
- `text-gradient-primary`: Text with violet-to-teal gradient
- `text-gradient-secondary`: Text with pink-to-amber gradient

---

## 3. TYPOGRAPHY SYSTEM

### Font Families
- **Display**: `font-[Anton]` - Bold, cinematic headlines
- **Cinematic**: `font-[Bowlby_One]` - Large editorial titles
- **Editorial**: `font-[Archivo_Black]` - Section headers
- **Body**: `font-[Inter]` - Readable body text
- **Japanese**: `font-[Noto_Sans_JP]` - Japanese text
- **Code**: `font-[JetBrains_Mono]` - Technical text
- **Script**: `font-[Caveat]` - Decorative accents

### Typography Classes
```
.text-cinematic     /* Hero headlines: 5xl-7xl */
.text-cinematic-sm  /* Section titles: 3xl-4xl */
h1                  /* 5xl-7xl, Anton, bold */
h2                  /* 4xl-6xl, Bowlby One, bold */
h3                  /* 2xl-4xl, Archivo Black, bold */
p                   /* base-lg, Inter, normal */
```

### Sizing Recommendations
- **Hero Headlines**: 48px+ on mobile, 80px+ on desktop
- **Section Titles**: 28px+ on mobile, 48px+ on desktop  
- **Body Text**: 16px base with 1.5 line height
- **Captions**: 12px with 1.4 line height
- **Labels**: 11px uppercase with 0.15em letter-spacing

### Font Weights
- **Bold Displays**: 900
- **Headlines**: 700-800
- **UI Elements**: 600-700
- **Body**: 400-500
- **Captions**: 400

---

## 4. COMPONENT ARCHITECTURE

### Core Components (in `/src/components/senpai/`)

#### AppShell
```tsx
<AppShell active="home" hideNav={false} hideSidebar={false}>
  {children}
</AppShell>
```
- Premium header with glassmorphism
- Responsive sidebar navigation
- Dynamic aurora background
- Mobile-friendly hamburger menu

#### CinematicHero
```tsx
<CinematicHero
  title="Title"
  subtitle="Subtitle"
  gradient="violet-teal"
  height="screen"
  animated
  actionButton={{ label: 'Click', onClick: () => {} }}
/>
```
- Full-width hero section
- Parallax animated backgrounds
- Gradient overlays
- Call-to-action buttons
- Responsive sizing

#### ScrollReveal / Parallax
```tsx
<ScrollReveal direction="up" delay={0}>
  Content animates on scroll
</ScrollReveal>
```
- Fade-in on scroll triggers
- Stagger animations for lists
- Parallax depth effects
- Intersection observer based

#### TiltCard / GlowingCard
```tsx
<TiltCard intensity={10}>
  <GlowingCard color="violet">
    Interactive 3D content
  </GlowingCard>
</TiltCard>
```
- 3D mouse-tracking tilt effects
- Neon glow on hover
- Glass-morphism styling
- Smooth transform transitions

#### NeonButton
```tsx
<NeonButton color="violet" size="md" className="">
  Click Me
</NeonButton>
```
- Glowing button with hover effects
- Multiple color variants
- Responsive sizing
- Active scale animations

#### GlassCard
```tsx
<GlassCard className="">
  Content with glass effect
</GlassCard>
```
- Frosted glass background
- Smooth blur effect
- Transparent borders
- Perfect for overlays

### Icon System
- Use `lucide-react` for all icons (18-24px default)
- Colors: `text-senpai-{color}` with opacity as needed
- Sizing: 16px (small), 20px (medium), 24px (large)

---

## 5. ANIMATION & MOTION

### Tailwind Animation Classes
```
animate-fade-in          /* Fade in from 0s */
animate-fade-in-up       /* Fade and slide from below */
animate-fade-in-down     /* Fade and slide from above */
animate-fade-in-left     /* Fade and slide from left */
animate-fade-in-right    /* Fade and slide from right */
animate-scale-in         /* Scale from 0.95 to 1 */
animate-pulse            /* Pulsing opacity */
animate-float            /* Floating motion */
animate-float-slow       /* Slower floating motion */
animate-shimmer          /* Shimmer effect */
animate-glow-pulse       /* Pulsing glow */
animate-spin-slow        /* Slow rotation */
```

### Motion System Library (from `/src/lib/motion.ts`)
```ts
import { MOTION, staggerConfig, parallaxConfig } from '@/lib/motion';

// Use transition presets
transitions: {
  default:     /* 0.3s ease */
  fast:        /* 0.2s ease */
  slow:        /* 0.5s ease */
  cinematic:   /* 0.6s custom curve */
  bounce:      /* Bouncy easing */
  elastic:     /* Elastic easing */
}

// Use variant presets
variants: {
  fadeIn, fadeInUp, fadeInDown,
  scaleIn, scaleInRotate,
  slideInLeft, slideInRight,
  blur
}
```

### CSS Animation Classes
- All animations are GPU-accelerated
- Use `will-transform` and `will-opacity` for performance
- Prefers `prefers-reduced-motion` for accessibility
- Easing curves optimized for 60fps

### Timing Guidelines
- **UI Interactions**: 200-300ms
- **Page Transitions**: 300-500ms
- **Scroll Reveals**: 400-600ms
- **Stagger Delays**: 50-150ms between items
- **Hover Effects**: 200-300ms

---

## 6. LAYOUT PATTERNS

### Page Structure Pattern
```tsx
<AppShell active="section-key">
  <div className="space-y-20 pb-20">
    {/* Hero Section */}
    <CinematicHero ... />
    
    {/* Feature Cards / Stats */}
    <ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cards */}
      </div>
    </ScrollReveal>
    
    {/* Content Grid */}
    <ScrollReveal direction="up">
      <div className="space-y-6">
        <h2 className="text-cinematic-sm">Title</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Items with TiltCard */}
        </div>
      </div>
    </ScrollReveal>
    
    {/* CTA Section */}
    <ScrollReveal>
      <GlassCard className="p-12 text-center">
        Call to action content
      </GlassCard>
    </ScrollReveal>
  </div>
</AppShell>
```

### Grid System
- **Mobile (default)**: 2-3 columns
- **Tablet (md)**: 3-4 columns  
- **Desktop (lg)**: 4-5 columns
- **Ultra-wide (xl)**: 5-6 columns
- Gap: 16px (gap-4)

### Spacing System
- Hero to next section: `space-y-20` (80px)
- Section parts: `space-y-6` to `space-y-12`
- Card gaps: `gap-4` (16px)
- Internal padding: `p-6` to `p-12`
- Container padding: `px-4 md:px-6 lg:px-8 py-6`

### Content Container
- Max-width: 1600px on desktop
- Full-bleed on mobile
- Centered with `max-w-[1600px] mx-auto`

---

## 7. PAGE IMPLEMENTATION EXAMPLES

### Watch/Player Page
```tsx
<AppShell hideNav hideSidebar hideAurora>
  <div className="relative w-screen h-screen">
    {/* Video Player */}
    {/* Controls with glass background */}
    {/* Metadata sidebar */}
  </div>
</AppShell>
```

### Content Detail Page  
```tsx
<AppShell>
  <CinematicHero 
    image={posterUrl}
    height="lg"
    actionButton={{ label: 'Watch Now' }}
  />
  <ScrollReveal>
    <div className="grid md:grid-cols-3 gap-12">
      {/* Content info */}
      {/* Related content grid */}
    </div>
  </ScrollReveal>
</AppShell>
```

### List/Grid Pages
```tsx
<AppShell active="section">
  <div className="space-y-12">
    <div className="space-y-6">
      <h1 className="text-cinematic">Section Title</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <ScrollReveal key={item.id} delay={i * 50}>
            <TiltCard intensity={8}>
              {/* Card content */}
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </div>
</AppShell>
```

---

## 8. RESPONSIVE DESIGN

### Breakpoints
- `sm`: 640px - Tablets
- `md`: 768px - Large tablets  
- `lg`: 1024px - Desktops
- `xl`: 1280px - Large desktops
- `2xl`: 1536px - Extra large screens
- `3xl`: 1920px - TV / 10ft UI

### Mobile-First Approach
- Default styles for mobile
- `md:` for tablets
- `lg:` for desktops
- `xl:` for large screens

### Typography Scaling
```
Mobile: h1 = 32px, h2 = 24px, p = 16px
md:     h1 = 48px, h2 = 36px, p = 16px
lg:     h1 = 64px, h2 = 48px, p = 18px
xl:     h1 = 80px, h2 = 56px, p = 18px
```

### Grid Adjustments
- Mobile: 2 columns
- md: 3 columns
- lg: 4 columns
- xl: 5-6 columns

### Touch Targets
- Minimum 44x44px for interactive elements
- Larger on mobile: 48x48px
- Use `touch-target` utility class

---

## 9. ACCESSIBILITY GUIDELINES

### Keyboard Navigation
- Tab through all interactive elements
- Focus ring visible: `focus:ring-2 focus:ring-senpai-violet`
- Logical tab order in components
- Escape key closes modals/overlays

### Color Contrast
- Text: WCAG AA minimum (4.5:1 for normal text)
- Use `senpai-text` on dark backgrounds
- Use `senpai-text-dim` for secondary text
- Test with contrast checker tools

### Screen Readers
- Use semantic HTML (button, link, heading, nav)
- Add aria-labels where needed
- Use aria-live for dynamic content
- Describe images with alt text

### Motion Accessibility
- Respect `prefers-reduced-motion: reduce`
- All animations should be stoppable
- No auto-playing video with sound
- Provide pause controls

### Focus Management
- Visible focus indicators on all interactive elements
- Focus should follow logical reading order
- Modal dialogs should trap focus
- Skip links for keyboard users

---

## 10. PERFORMANCE OPTIMIZATION

### Loading Performance
- Lazy load images with `loading="lazy"`
- Use responsive image sizes with srcset
- Code-split pages with React.lazy()
- Preload critical fonts

### Animation Performance
- Use CSS animations over JS when possible
- GPU-accelerate with `transform` and `opacity`
- Avoid animating layout properties
- Use `will-change` sparingly
- Test with 60fps target

### Bundle Size
- Tree-shake unused components
- Dynamic imports for route-based code-splitting
- Minify and compress assets
- Cache busting with content hash

### Rendering Performance
- Use memoization for expensive components
- Virtual scrolling for long lists
- Debounce scroll events
- Avoid blocking main thread with large computations

### Metrics Targets
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- Lighthouse Best Practices: 95+
- Lighthouse SEO: 90+
- Core Web Vitals: All green

---

## Implementation Checklist

For each page, ensure:
- [ ] Uses AppShell with correct `active` prop
- [ ] Has CinematicHero or equivalent hero section
- [ ] Includes ScrollReveal animations on major sections
- [ ] Uses TiltCard for content cards
- [ ] Implements proper spacing (space-y-20 between sections)
- [ ] Has mobile-responsive grid (2-4 columns)
- [ ] Includes loading states with shimmer animations
- [ ] Has empty state with helpful message
- [ ] All buttons use NeonButton or consistent styling
- [ ] Icons use lucide-react (18-24px)
- [ ] Color palette uses senpai-* CSS variables
- [ ] Typography uses font families from system
- [ ] Touch targets minimum 44px on mobile
- [ ] Focus states visible and tested
- [ ] alt text on all images
- [ ] Passes accessibility checks
- [ ] Performs well (Lighthouse 90+)

---

## File Organization

```
src/
├── components/
│   ├── senpai/
│   │   ├── index.ts (exports)
│   │   ├── AppShell.tsx
│   │   ├── CinematicHero.tsx
│   │   ├── Animations.tsx
│   │   └── TiltCard.tsx
│   └── (old components - deprecating)
├── lib/
│   ├── motion.ts (animation presets)
│   └── utils.ts
├── pages/
│   ├── Index.tsx ✅ (redesigned)
│   ├── Genres.tsx ✅ (redesigned)
│   ├── Manga.tsx ✅ (redesigned)
│   ├── Watch.tsx (needs redesign)
│   ├── Search.tsx (needs redesign)
│   └── ... (others need redesign)
├── hooks/
├── styles/
│   └── index.css (Senpai design tokens)
└── ...
```

---

## Next Steps

1. **Immediate**: Ensure all pages use AppShell with aurora backgrounds
2. **Week 1**: Redesign remaining high-priority pages (Watch, Search, Profile)
3. **Week 2**: Enhance all secondary pages with new design system
4. **Week 3**: Polish animations, accessibility, and performance
5. **Week 4**: Testing, bug fixes, optimization

---

## Questions & Support

For implementing this design system:
- Reference existing redesigned pages (Index, Genres, Manga)
- Use component exports from `@/components/senpai`
- Follow the layout patterns provided
- Test on mobile, tablet, desktop, and wide screens
- Ensure accessibility with keyboard and screen readers

Happy building! 🎬✨
