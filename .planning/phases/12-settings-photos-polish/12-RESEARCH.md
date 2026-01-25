# Phase 12: Settings, Photos & Design Polish - Research

**Researched:** 2026-01-25
**Domain:** Settings migration, photo uploads with face detection, design system audit, animation standardization, accessibility compliance
**Confidence:** HIGH

## Summary

Phase 12 completes the V2 migration by implementing the full settings page, athlete photo uploads with AI-powered face detection cropping, and comprehensive design polish to achieve "Precision Instrument" quality. This research covers five major domains: (1) Settings page migration with Stripe billing integration, (2) Photo upload and face detection services, (3) Design system audit methodology, (4) Animation standardization with Framer Motion, and (5) WCAG 2.1 AA accessibility compliance.

The research reveals that the existing V1 SettingsPage.jsx provides a solid foundation for migration, with established patterns for SpotlightCard components and tab-based navigation. For photo uploads, face-api.js offers browser-based face detection without server dependencies, while react-easy-crop provides excellent cropping UX. Design polish requires systematic component audits using established design system checklists, standardized Framer Motion spring configurations (already established at stiffness: 300, damping: 28), and comprehensive accessibility testing against WCAG 2.1 AA (minimum 4.5:1 contrast ratios, :focus-visible rings, prefers-reduced-motion support).

**Primary recommendation:** Migrate settings page preserving V1's tab structure and Stripe integration, implement client-side face detection using face-api.js + react-easy-crop for photo uploads, conduct systematic design audit using established checklists, standardize all animations to existing spring config, and implement comprehensive accessibility features including focus management and reduced motion support.

## Standard Stack

### Core Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @stripe/react-stripe-js | Latest | Stripe billing integration | Official Stripe library for React, handles Elements and secure payment collection |
| @stripe/stripe-js | Latest | Stripe.js wrapper | Required for @stripe/react-stripe-js, loads Stripe.js securely |
| react-easy-crop | Latest | Image cropping UI | 21 code snippets, High reputation, supports aspect ratios, drag/zoom, pixel-perfect cropping |
| face-api.js | Latest | Browser-based face detection | TensorFlow.js-based, runs in-browser, multiple detection models, 68-point facial landmarks |
| react-loading-skeleton | Latest | Loading state skeletons | 12 code snippets, High reputation, automatic sizing, built-in shimmer animation |
| framer-motion | Latest (already installed) | Animation library | Already established in V2, spring physics config standardized (stiffness: 300, damping: 28) |

### Supporting Tools

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| WebAIM Contrast Checker | Web-based | WCAG color contrast validation | During design audit, verify 4.5:1 minimum contrast ratios |
| react-toastify | Latest | Toast notifications (if not using custom) | Entrance/exit animations, millions of ways to animate |
| Headless UI Dialog | v2.2+ (already installed) | Modal animations | Already in use, v2.1+ simplified transition API with data attributes |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| face-api.js (client-side) | Luxand.cloud API (server-side) | API: 500 free requests/month, faster but requires backend, privacy concerns |
| face-api.js | crop.photo service | Commercial service, automatic headshot fix, better for batch processing |
| react-easy-crop | react-advanced-cropper | 455 snippets vs 21, more features but heavier, overkill for simple headshot cropping |
| react-loading-skeleton | Custom skeletons | More control but lose automatic sizing and animation |
| Custom design audit | Design system checklist services | Services offer automated checks but miss context-specific patterns |

**Installation:**
```bash
npm install @stripe/react-stripe-js @stripe/stripe-js react-easy-crop face-api.js react-loading-skeleton
```

## Architecture Patterns

### Recommended Project Structure

```
src/v2/features/settings/
├── components/           # Settings-specific components
│   ├── SettingsTabs.tsx  # Tab navigation
│   ├── ProfileSection.tsx
│   ├── IntegrationsSection.tsx  # C2, Strava
│   ├── BillingSection.tsx       # Stripe integration
│   ├── TeamMembersSection.tsx
│   └── PhotoUpload.tsx          # Face detection + cropping
├── hooks/
│   ├── useSettings.ts           # TanStack Query hook
│   ├── usePhotoUpload.ts        # Upload + face detection
│   └── useFaceDetection.ts      # face-api.js wrapper
├── utils/
│   ├── faceDetection.ts         # Load models, detect faces
│   └── imageCropping.ts         # Crop helpers
└── pages/
    └── SettingsPage.tsx         # Main settings page

src/v2/components/common/
├── LoadingSkeleton.tsx   # Reusable skeleton component
├── EmptyState.tsx        # Illustrations + CTAs
├── Toast.tsx             # Toast notifications (if custom)
└── ErrorState.tsx        # Friendly error messages

src/v2/styles/
├── tokens.css            # Design tokens (already exists)
├── animations.css        # Standardized animation configs
└── focus-rings.css       # :focus-visible styles for accessibility
```

### Pattern 1: Stripe Billing Integration

**What:** React Stripe.js Elements for secure payment collection
**When to use:** Settings billing tab, subscription management

**Example:**
```typescript
// Source: Context7 /stripe/react-stripe-js
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BillingSection = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message);
    } else {
      // Send paymentMethod.id to backend
      const response = await fetch('/api/v1/billing/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: paymentMethod.id }),
      });
      // Handle response
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: 'var(--color-text-primary)',
              '::placeholder': { color: 'var(--color-text-tertiary)' },
            },
            invalid: { color: 'var(--color-status-error)' },
          },
        }}
      />
      {error && <div className="text-status-error">{error}</div>}
      <button type="submit" disabled={!stripe}>
        Update Payment Method
      </button>
    </form>
  );
};
```

### Pattern 2: Face Detection + Cropping

**What:** Browser-based face detection with react-easy-crop for headshot standardization
**When to use:** Athlete photo upload, profile photo management

**Example:**
```typescript
// Source: face-api.js GitHub, react-easy-crop Context7
import * as faceapi from 'face-api.js';
import Cropper from 'react-easy-crop';
import { useState, useCallback, useEffect } from 'react';

// Load face detection models (once on mount)
const loadFaceDetectionModels = async () => {
  const MODEL_URL = '/models'; // Serve from public/models
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
};

// Detect face and return crop area
const detectFace = async (imageElement: HTMLImageElement) => {
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (!detection) return null;

  const { box } = detection.detection;
  // Expand box by 20% for headshot padding
  const padding = 0.2;
  const x = Math.max(0, box.x - box.width * padding);
  const y = Math.max(0, box.y - box.height * padding);
  const width = box.width * (1 + padding * 2);
  const height = box.height * (1 + padding * 2);

  return { x, y, width, height };
};

const PhotoUpload = () => {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    loadFaceDetectionModels();
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);

    // Detect face and auto-position crop
    const img = new Image();
    img.src = imageUrl;
    img.onload = async () => {
      const faceBox = await detectFace(img);
      if (faceBox) {
        // Center crop on detected face
        setCrop({ x: faceBox.x, y: faceBox.y });
      }
    };
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  return (
    <div>
      <input type="file" accept="image/*" onChange={onFileChange} />
      {image && (
        <div style={{ position: 'relative', width: '100%', height: 400 }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square headshot
            cropShape="rect"
            showGrid={true}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
      )}
    </div>
  );
};
```

### Pattern 3: Loading Skeletons

**What:** react-loading-skeleton for consistent loading states
**When to use:** All data-fetching components (athletes table, erg tests, lineup list, etc.)

**Example:**
```typescript
// Source: Context7 /dvtng/react-loading-skeleton
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AthletesTableSkeleton = () => (
  <SkeletonTheme baseColor="var(--color-bg-surface)" highlightColor="var(--color-bg-hover)">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-border-subtle">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} className="mt-2" />
        </div>
        <Skeleton width={80} height={24} />
      </div>
    ))}
  </SkeletonTheme>
);

// Usage in component
const AthletesTable = () => {
  const { data: athletes, isLoading } = useAthletes();

  if (isLoading) return <AthletesTableSkeleton />;
  if (!athletes?.length) return <EmptyState />;

  return <VirtualTable data={athletes} />;
};
```

### Pattern 4: Framer Motion Spring Standardization

**What:** Standardized spring config across all animations
**When to use:** All drag-drop, modal, hover, transition animations

**Example:**
```typescript
// Source: Context7 /grx7/framer-motion
import { motion } from 'framer-motion';

// Shared spring config (already established in STATE.md)
export const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  restDelta: 0.00001,
  restSpeed: 0.00001,
} as const;

// Button hover/press
const Button = ({ children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={SPRING_CONFIG}
    {...props}
  >
    {children}
  </motion.button>
);

// Modal slide + fade
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <Dialog static open={isOpen} onClose={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={SPRING_CONFIG}
          className="fixed inset-0 flex items-center justify-center"
        >
          <Dialog.Panel>{children}</Dialog.Panel>
        </motion.div>
      </Dialog>
    )}
  </AnimatePresence>
);
```

### Pattern 5: Accessibility - Focus Rings

**What:** :focus-visible for keyboard-only focus indicators
**When to use:** All interactive elements (buttons, links, inputs, custom controls)

**Example:**
```css
/* Source: MDN :focus-visible, Chakra UI focusRing patterns */

/* Global focus ring styles */
:focus {
  outline: none; /* Remove default */
}

:focus-visible {
  outline: 2px solid var(--color-interactive-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Component-specific overrides */
.button:focus-visible {
  outline-color: var(--color-interactive-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.card:focus-visible {
  outline-color: var(--color-border-brand);
  outline-offset: -2px; /* Inside card border */
}

/* Dark theme adjustments */
.v2[data-theme="dark"] :focus-visible {
  outline-color: var(--palette-brand-blue);
}

/* Field theme (high contrast) */
.v2[data-theme="field"] :focus-visible {
  outline-color: var(--color-border-brand);
  outline-width: 3px; /* Thicker for outdoor visibility */
}
```

### Pattern 6: Reduced Motion Support

**What:** @media (prefers-reduced-motion) for accessibility
**When to use:** All animations and transitions

**Example:**
```css
/* Source: MDN prefers-reduced-motion, W3C WCAG Technique C39 */

/* Default: animations enabled */
.animate-slide {
  transition: transform 0.3s ease-out;
}

.animate-fade {
  transition: opacity 0.3s ease-out;
}

/* Reduced motion: disable non-essential animations */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep essential feedback animations (button press) */
  .button {
    transition: background-color 0.1s !important;
  }
}
```

```typescript
// JavaScript/React approach
import { useEffect, useState } from 'react';

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
};

// Usage in Framer Motion
const AnimatedComponent = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG}
    />
  );
};
```

### Anti-Patterns to Avoid

- **Inconsistent spring configs:** Never use different stiffness/damping values per component - use SPRING_CONFIG constant
- **Missing loading states:** Never show empty tables while loading - always use skeletons that match content shape
- **Hover-only indicators:** Never rely on hover for critical information (warnings, validation) - always visible or keyboard accessible
- **Animations without reduced motion support:** Never ship animations without @media (prefers-reduced-motion) fallback
- **Focus without :focus-visible:** Never use :focus alone (shows on mouse click) - always use :focus-visible for keyboard-only
- **Hardcoded colors:** Never use hex colors directly - always use CSS custom properties from tokens.css
- **Client-side face detection without fallback:** Never require face detection - allow manual cropping if detection fails

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image cropping UI | Custom drag/zoom/crop component | react-easy-crop | Handles touch gestures, aspect ratios, zoom constraints, pixel rounding, 21 verified snippets |
| Face detection | Custom ML model training | face-api.js | Pre-trained models (TinyFaceDetector 190KB), 68-point landmarks, runs in-browser |
| Stripe payment forms | Custom card input validation | @stripe/react-stripe-js CardElement | PCI compliance, tokenization, real-time validation, official Stripe SDK |
| Loading skeletons | Custom shimmer animations | react-loading-skeleton | Auto-sizing, built-in shimmer, theme support, 12 verified snippets |
| Toast notifications | Custom positioning/stacking logic | react-toastify or custom with Framer Motion | Automatic stacking, entrance/exit animations, queue management |
| Color contrast checking | Manual calculations | WebAIM Contrast Checker | WCAG 2.1/2.2 compliance verification, batch checking, reliable calculations |
| Modal transitions | Custom animation states | Headless UI + Framer Motion | Focus trapping, scroll locking, keyboard navigation, backdrop click handling |
| Responsive breakpoints | Random pixel values | Standardized 375/768/1024 | Device coverage, maintainable, aligns with Tailwind defaults |

**Key insight:** Settings pages, photo uploads, and design polish involve many subtle edge cases (payment security, face detection edge cases, accessibility requirements). Using battle-tested libraries prevents security vulnerabilities, UX frustrations, and accessibility violations that take weeks to discover and fix.

## Common Pitfalls

### Pitfall 1: Incomplete Settings Migration from V1

**What goes wrong:** Missing features, broken integrations, inconsistent UX when migrating V1 SettingsPage.jsx
**Why it happens:** V1 settings has extensive features (Stripe, C2, Strava, FIT imports, team management) that might be overlooked
**How to avoid:**
- Audit V1 SettingsPage.jsx completely (1000+ lines)
- Create feature parity checklist: Profile, Integrations (C2, Strava, FIT), Billing (Stripe), Team Members, Notifications
- Preserve existing API endpoints (`/api/v1/settings`, `/api/v1/settings/team`)
- Test all integration flows (C2 callback, Strava sync)
**Warning signs:** Missing tabs, broken Stripe checkout, C2 connection failures

### Pitfall 2: Face Detection Model Loading Performance

**What goes wrong:** 10+ second initial load downloading face-api.js models (190KB TinyFaceDetector + landmarks)
**Why it happens:** Models are large binary files that must load before detection works
**How to avoid:**
- Host models in `/public/models` directory (not CDN)
- Lazy load models only when PhotoUpload component mounts
- Show loading spinner during model download
- Cache models in browser (Service Worker or localStorage for model metadata)
- Consider fallback to manual crop if detection fails
**Warning signs:** Slow photo upload UX, timeout errors, "model not loaded" errors

### Pitfall 3: Design Audit Scope Creep

**What goes wrong:** Endless tweaking, never shipping, "perfect is the enemy of good"
**Why it happens:** No clear definition of "done" for design polish
**How to avoid:**
- Define specific checklist with binary pass/fail criteria
- Time-box audit: 1 day per feature area (Athletes, Erg, Lineup, etc.)
- Prioritize WCAG violations and broken animations over minor color tweaks
- Document "known cosmetic issues" to defer non-blocking polish
**Warning signs:** Spending days on hover state timing, debating shadow opacity values

### Pitfall 4: Accessibility Testing Only at End

**What goes wrong:** Discovering 100+ WCAG violations after "feature complete"
**Why it happens:** Accessibility treated as final polish step instead of built-in requirement
**How to avoid:**
- Add accessibility checks to component creation: focus rings, contrast, aria-labels
- Use axe DevTools browser extension during development
- Test keyboard navigation for every new component
- Include screen reader testing in acceptance criteria
- Run automated WebAIM contrast checks on all new color combinations
**Warning signs:** Unable to keyboard navigate, invisible focus states, red axe DevTools errors

### Pitfall 5: Inconsistent Animation Timing

**What goes wrong:** Some modals use 300ms, others 200ms; some use ease-out, others use spring
**Why it happens:** No centralized animation constants, copy-paste from different sources
**How to avoid:**
- Create `/src/v2/utils/animations.ts` with SPRING_CONFIG, TRANSITION_DURATION constants
- Document in PLAN.md: "All animations MUST use SPRING_CONFIG"
- Code review checklist: verify no hardcoded transition values
- Grep codebase: `grep -r "transition.*duration" src/v2` before merge
**Warning signs:** Different transition speeds across similar interactions, inconsistent animation feel

### Pitfall 6: Missing Empty/Error/Loading States

**What goes wrong:** Blank screens during loading, unhelpful error messages, confusing empty tables
**Why it happens:** Happy path implemented first, edge cases forgotten
**How to avoid:**
- For every data-fetching component: implement loading skeleton, empty state, error state
- Use established patterns: `if (isLoading) return <Skeleton />; if (error) return <ErrorState />; if (!data?.length) return <EmptyState />;`
- Empty states need illustration + helpful CTA ("Upload your first athlete photo")
- Error states need retry action + clear message ("Failed to load. Try again?")
**Warning signs:** White screen while loading, "undefined" errors shown to users, empty tables with no guidance

### Pitfall 7: Contrast Ratio Failures in Field Theme

**What goes wrong:** Field theme (high-contrast outdoor mode) fails WCAG contrast checks
**Why it happens:** Amber/yellow backgrounds create challenging contrast requirements
**How to avoid:**
- Test ALL color combinations with WebAIM Contrast Checker: text-on-background, border-on-background
- Field theme text must be near-black (#1c1917) for sufficient contrast on amber
- Borders need stone-300 (#d6d3d1) minimum for visibility
- Interactive elements need amber-700 (#b45309) or darker
**Warning signs:** WebAIM shows < 4.5:1 ratio, text hard to read in sunlight

### Pitfall 8: Headless UI v2 Breaking Changes

**What goes wrong:** Old Transition API patterns fail with Headless UI v2.1+
**Why it happens:** Headless UI v2.1 simplified API using data attributes instead of enter/leave classes
**How to avoid:**
- Check installed version: `npm list @headlessui/react`
- v2.1+ uses: `data-[closed]:opacity-0` instead of `enterFrom="opacity-0"`
- v1.x uses: Transition component with enter/enterFrom/enterTo props
- Use Framer Motion alternative if consistency needed across versions
**Warning signs:** Transitions not animating, console errors about invalid props

## Code Examples

Verified patterns from official sources:

### Empty State Component

```typescript
// Source: GitLab Pajamas Design System, Twilio Paste Design System
import { Upload, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Upload,
  title,
  description,
  action,
  illustration,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {illustration || (
      <div className="w-16 h-16 mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
        <Icon className="w-8 h-8 text-text-tertiary" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-sm text-text-secondary mb-6 max-w-sm">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-interactive-primary text-white rounded-lg hover:bg-interactive-hover transition-colors"
      >
        <Plus className="w-4 h-4" />
        {action.label}
      </button>
    )}
  </div>
);

// Usage
<EmptyState
  title="No athlete photos yet"
  description="Upload photos to create a visual roster. Photos with faces will be automatically cropped to headshots."
  action={{
    label: "Upload Photos",
    onClick: () => setShowUpload(true),
  }}
/>
```

### Error State with Retry

```typescript
// Source: Material UI Snackbar patterns
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 mb-4 rounded-full bg-status-error/10 flex items-center justify-center">
      <AlertTriangle className="w-8 h-8 text-status-error" />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-sm text-text-secondary mb-6 max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-default rounded-lg hover:bg-hover transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    )}
  </div>
);

// Usage
const AthletesPage = () => {
  const { data, isLoading, error, refetch } = useAthletes();

  if (error) {
    return (
      <ErrorState
        message="Failed to load athletes. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }
  // ...
};
```

### Toast Notification Component

```typescript
// Source: react-toastify patterns
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const ToastContext = createContext<{
  showToast: (type: ToastType, message: string) => void;
} | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: AlertTriangle,
  };

  const colors = {
    success: 'bg-status-success/10 border-status-success/20 text-status-success',
    error: 'bg-status-error/10 border-status-error/20 text-status-error',
    warning: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
    info: 'bg-status-info/10 border-status-info/20 text-status-info',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100 }}
                transition={SPRING_CONFIG}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[toast.type]} shadow-lg max-w-md`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-text-primary flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Usage
const MyComponent = () => {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast('success', 'Settings saved successfully');
    } catch (error) {
      showToast('error', 'Failed to save settings');
    }
  };
};
```

### Responsive Breakpoint Hook

```typescript
// Source: Tailwind breakpoint patterns
import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
} as const;

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.tablet) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

// Usage
const MyComponent = () => {
  const breakpoint = useBreakpoint();

  return (
    <div>
      {breakpoint === 'mobile' && <MobileLayout />}
      {breakpoint === 'tablet' && <TabletLayout />}
      {breakpoint === 'desktop' && <DesktopLayout />}
    </div>
  );
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Headless UI v1 Transition API (enter/enterFrom/enterTo) | Headless UI v2.1+ data attributes (data-[closed]:opacity-0) | June 2024 | Simpler API, less verbose, better TypeScript support |
| WCAG 2.1 AA (50 criteria) | WCAG 2.2 AA (new criteria for touch targets, dragging) | October 2023 | 24×24px minimum touch targets (Level AA), focus appearance enhancements |
| Custom skeleton loaders | react-loading-skeleton auto-sizing | Ongoing | No manual width/height matching, skeletons adapt to content automatically |
| face-api.js SSD MobileNet | face-api.js TinyFaceDetector | 2020+ | 190KB model vs 500KB+, faster detection, mobile-friendly |
| Manual contrast checking | WebAIM Contrast Checker batch mode | 2024+ | Check multiple color pairs at once, faster design system audits |
| CSS transitions only | Framer Motion spring physics | Ongoing trend | More natural animations, velocity-aware, better perceived performance |
| Server-side face detection | Browser-based face-api.js | 2018+ | Privacy (no server upload), faster (no round-trip), offline-capable |

**Deprecated/outdated:**
- **Headless UI v1 Transition syntax:** Still works but verbose, use v2.1+ data attribute approach for new code
- **WCAG 2.0:** Superseded by 2.1 (2018) and 2.2 (2023), legal standard now 2.1 AA minimum
- **44px touch targets as "best practice":** Now WCAG 2.2 Level AAA requirement, Level AA requires 24×24px
- **:focus without :focus-visible:** Old approach shows focus on mouse click, use :focus-visible for keyboard-only

## Open Questions

Things that couldn't be fully resolved:

1. **Face Detection Model Hosting**
   - What we know: face-api.js models (190KB+ total) must be hosted somewhere accessible
   - What's unclear: Best practice for production hosting - CDN vs /public vs separate static server
   - Recommendation: Start with `/public/models`, monitor load times, consider CDN if > 2s load

2. **Settings API Migration Strategy**
   - What we know: V1 uses `/api/v1/settings` and `/api/v1/settings/team` endpoints
   - What's unclear: Whether to preserve V1 endpoints or create new V2 endpoints
   - Recommendation: Preserve V1 endpoints for backward compatibility, V2 UI calls same APIs

3. **Photo Storage Backend**
   - What we know: Cropped photos need server-side storage (S3, Cloudinary, local filesystem)
   - What's unclear: Existing photo storage implementation in V1
   - Recommendation: Check existing athlete photo handling in V1, preserve storage backend

4. **Design Audit Scope - V1 Components**
   - What we know: Phase 12 focuses on V2 components polish
   - What's unclear: Whether to audit/polish remaining V1 components accessed via /legacy routes
   - Recommendation: V2-only scope for Phase 12, defer V1 polish to maintenance phase

5. **Stripe Webhook Handling**
   - What we know: Stripe billing requires webhooks for subscription updates
   - What's unclear: Existing webhook implementation in backend
   - Recommendation: Verify webhook routes exist (`/api/v1/stripe/webhook`), test with Stripe CLI

6. **Accessibility Audit Tooling**
   - What we know: Automated tools catch ~30% of issues, manual testing required for 70%
   - What's unclear: Which screen reader to test with (NVDA, JAWS, VoiceOver)
   - Recommendation: Start with free NVDA (Windows) or VoiceOver (Mac), focus on critical flows

## Sources

### Primary (HIGH confidence)

- **Context7 /grx7/framer-motion** - Spring physics configuration, animation patterns
- **Context7 /stripe/react-stripe-js** - Stripe Elements integration, payment form patterns
- **Context7 /valentinh/react-easy-crop** - Image cropping API, aspect ratios, pixel coordinates
- **Context7 /dvtng/react-loading-skeleton** - Skeleton component props, theming, auto-sizing
- **Context7 /websites/headlessui_com** - Dialog transitions, Framer Motion integration, v2.1 API
- **face-api.js GitHub** - TinyFaceDetector model, face landmark detection, browser implementation
- **W3C WCAG 2.1 Understanding Docs** - Target size requirements, focus appearance, color contrast
- **MDN Web Docs** - :focus-visible pseudo-class, prefers-reduced-motion media query

### Secondary (MEDIUM confidence)

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG 4.5:1 ratio verification
- [Design System Checklist](https://www.designsystemchecklist.com/) - Component audit methodology
- [GitLab Pajamas Design System](https://design.gitlab.com/patterns/empty-states/) - Empty state patterns
- [Twilio Paste Design System](https://paste.twilio.design/patterns/empty-state) - Empty state best practices
- [Smashing Magazine - Accessible Target Sizes](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/) - 44px touch target research
- [BrowserStack Responsive Breakpoints Guide](https://www.browserstack.com/guide/responsive-design-breakpoints) - 375/768/1024 breakpoint rationale
- [React Toastify Complete Guide](https://deadsimplechat.com/blog/react-toastify-the-complete-guide/) - Toast animation patterns
- [Magic Crop](https://poloclub.github.io/magic-crop/) - Browser-based face detection reference

### Tertiary (LOW confidence - marked for validation)

- WebSearch: "face detection API headshot cropping service 2026" - Commercial API options (Luxand.cloud, crop.photo)
- WebSearch: "empty state design patterns illustrations CTAs 2026" - UX best practices for empty states
- WebSearch: "WCAG 2.1 AA compliance checklist React 2026" - Accessibility compliance deadlines (April 2026 for gov)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7 with code snippets, official documentation confirmed
- Architecture: HIGH - Patterns sourced from official docs (Stripe, Headless UI, face-api.js GitHub)
- Pitfalls: MEDIUM - Based on common issues in documentation, GitHub issues, and developer community feedback
- Face detection services: MEDIUM - WebSearch results verified with official service sites, but not hands-on tested
- Accessibility requirements: HIGH - W3C WCAG official documentation, MDN reference documentation

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable domain, but framework updates possible)

**Notes:**
- Headless UI v2.1+ API changes may require updates if upgrading from v1.x
- WCAG 2.2 is current standard but 2.1 AA remains legal minimum for most jurisdictions
- Face detection models should be tested with diverse photo sets for accuracy validation
- Design audit should be time-boxed to prevent perfectionism scope creep
